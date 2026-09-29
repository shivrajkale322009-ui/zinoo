import WhatsAppTemplatePreview from './WhatsAppTemplatePreview';
import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, increment, onSnapshot, orderBy, query, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { CheckCircle2, ChevronRight, MessageCircle, Plus, Send, Users } from 'lucide-react';
import { auth, db, functions, marketingDb } from '../firebaseConfig';
import { parseLeadCsv } from '../utils/leadCsv';

const tone = (s) => ({ COMPLETED: 'success', SENDING: 'info', QUEUED: 'warning', FAILED: 'danger', CANCELLED: 'danger' }[s] || 'muted');
const displayDate = (v) => v?.toDate?.()?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) || 'Just now';
const displayLeadTime = (value) => {
  if (!value) return 'Not recorded';
  const [hours, minutes] = String(value).split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return String(value);
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, hours, minutes));
};
const displayLeadDate = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return 'Not recorded';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
};
const leadDateTimeValue = (lead) => {
  const date = String(lead?.date || '');
  const time = normalizeLeadTime(lead?.importTime) || '00:00';
  const timestamp = new Date(`${date}T${time}:00`).getTime();
  if (Number.isFinite(timestamp)) return timestamp;
  const createdAt = lead?.createdAt?.toDate?.() || new Date(lead?.createdAt || 0);
  return Number.isFinite(createdAt.getTime()) ? createdAt.getTime() : 0;
};
const MONTH_INDEX = Object.freeze({ january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 });
const normalizeLeadTime = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*([ap])\.?m\.?)?$/i);
  if (!match) return '';
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem && (hours < 1 || hours > 12)) return '';
  if (meridiem) hours = (hours % 12) + (meridiem === 'p' ? 12 : 0);
  return hours <= 23 && minutes <= 59 ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` : '';
};
const normalizeIndianImportPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return digits.startsWith('91') && digits.length === 12 ? `+${digits}` : '';
};
const phoneKey = (value) => String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
const displayUploadedAt = (value) => {
  const date = value?.toDate?.() || new Date(value || 0);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Uploading…';
};
const resolveLeadDate = (value, fallbackDate) => {
  const raw = String(value || '').trim();
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const numeric = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  const named = raw.match(/^(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?$/i);
  let day; let month; let year;
  if (iso) {
    [, year, month, day] = iso.map(Number);
    month -= 1;
  } else if (numeric) {
    day = Number(numeric[1]); month = Number(numeric[2]) - 1; year = Number(numeric[3]);
    if (year < 100) year += 2000;
  } else if (named) {
    day = Number(named[1]); month = MONTH_INDEX[named[2].toLowerCase()]; year = Number(named[3] || String(fallbackDate || '').slice(0, 4));
  } else return '';
  const candidate = new Date(year, month, day);
  return Number.isInteger(month) && candidate.getFullYear() === year && candidate.getMonth() === month && candidate.getDate() === day
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : '';
};
const parseImportedLead = (line, fallbackDate, fallbackTime) => {
  const rawLine = String(line || '').trim();
  // WhatsApp copy/paste can preserve tabs or turn them into plain spaces.
  // Read the date, time, and final phone field first, allowing an empty name.
  const datePattern = '(?:\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{1,2}\\s+[a-z]+(?:\\s+\\d{4})?)';
  const timePattern = '\\d{1,2}:\\d{2}(?:\\s*[ap]\\.?m\\.?)?';
  const naturalRecord = rawLine.match(new RegExp(`^(${datePattern})\\s*(.*?)\\s*(${timePattern})\\s*(.+)$`, 'i'));
  if (naturalRecord) {
    const date = resolveLeadDate(naturalRecord[1], fallbackDate);
    const importTime = normalizeLeadTime(naturalRecord[3]);
    const phone = normalizeIndianImportPhone(naturalRecord[4]);
    if (date && importTime && phone) return { name: naturalRecord[2].trim() || 'Unnamed lead', phone, date, importTime };
  }
  // Support a spreadsheet pasted in any column order, including Name, Phone, Date, Time.
  const columns = rawLine.split(/\t|,/).map((value) => value.trim()).filter(Boolean);
  const dateIndex = columns.findIndex((value) => Boolean(resolveLeadDate(value, fallbackDate)));
  const timeIndex = columns.findIndex((value) => Boolean(normalizeLeadTime(value)));
  const phoneIndex = columns.findIndex((value) => Boolean(normalizeIndianImportPhone(value)));
  if (dateIndex >= 0 && timeIndex >= 0 && phoneIndex >= 0) {
    const name = columns.filter((_, index) => ![dateIndex, timeIndex, phoneIndex].includes(index)).join(' ').trim();
    return { name: name || 'Unnamed lead', phone: normalizeIndianImportPhone(columns[phoneIndex]), date: resolveLeadDate(columns[dateIndex], fallbackDate), importTime: normalizeLeadTime(columns[timeIndex]) };
  }
  const legacy = String(line || '').split(/[,\t]/).map((value) => value.trim());
  const name = legacy.length > 1 ? legacy[0] : '';
  return { name: name || 'Unnamed lead', phone: normalizeIndianImportPhone(legacy.length > 1 ? legacy[1] : legacy[0]), date: fallbackDate, importTime: fallbackTime };
};

export default function WhatsAppLeadManager({ leads = [], onSuccess, onError, onViewChange, onOpenCampaign }) {
  const [campaigns, setCampaigns] = useState([]), [templates, setTemplates] = useState([]), [imports, setImports] = useState([]), [open, setOpen] = useState(false), [saving, setSaving] = useState(false), [selected, setSelected] = useState(null), [recipients, setRecipients] = useState([]), [confirmOpen, setConfirmOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', audience: 'all', projectId: '', stage: '', templateId: '', customIds: [] });
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  const [mediaReady, setMediaReady] = useState(false);
  const [customLeadSearch, setCustomLeadSearch] = useState('');
  const [customLeadLimit, setCustomLeadLimit] = useState(100);
  const matchingCustomLeads = useMemo(() => {
    const search = customLeadSearch.trim().toLowerCase();
    const digits = search.replace(/\D/g, '');
    return leads.filter((lead) => !search || String(lead.name || '').toLowerCase().includes(search)
      || String(lead.phone || '').toLowerCase().includes(search)
      || (digits && /^[+\d\s().-]+$/.test(search) && String(lead.phone || '').replace(/\D/g, '').includes(digits)));
  }, [leads, customLeadSearch]);

  const [importText, setImportText] = useState(''), [importName, setImportName] = useState(''), [importDate, setImportDate] = useState(() => new Date().toISOString().slice(0, 10)), [importTime, setImportTime] = useState(() => new Date().toTimeString().slice(0, 5)), [updateExisting, setUpdateExisting] = useState(false), [importing, setImporting] = useState(false), [deletingLeads, setDeletingLeads] = useState(false);
  const [importOpen, setImportOpen] = useState(false), [manualOpen, setManualOpen] = useState(false), [addingManual, setAddingManual] = useState(false);
  const [manualLead, setManualLead] = useState({ name: '', phone: '', whatsappOptIn: false });
  const [recordingConsentId, setRecordingConsentId] = useState('');
  const [templateLoadError, setTemplateLoadError] = useState('');
  const [templatesFromCache, setTemplatesFromCache] = useState(false);
  const [templateSyncError, setTemplateSyncError] = useState('');
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const refreshTemplates = async () => {
    setSyncingTemplates(true);
    setTemplateSyncError('');
    try { await httpsCallable(functions, 'syncWhatsAppTemplates')(); }
    catch (error) { setTemplateSyncError(error?.message || 'Unable to refresh templates from Meta.'); }
    finally { setSyncingTemplates(false); }
  };
  const [marketingAccessReady, setMarketingAccessReady] = useState(false);
  const [showLeadList, setShowLeadList] = useState(false), [showImportHistory, setShowImportHistory] = useState(false), [leadSearch, setLeadSearch] = useState('');
  useEffect(() => () => onViewChange?.('overview'), [onViewChange]);
  useEffect(() => {
    let active = true;
    httpsCallable(functions, 'ensureWhatsAppMarketingAccess')()
      .then(() => httpsCallable(functions, 'syncWhatsAppTemplates')().catch((error) => { if (active) setTemplateSyncError(error?.message || 'Unable to refresh templates from Meta.'); }))
      .then(() => { if (active) setMarketingAccessReady(true); })
      .catch((error) => { if (active) onError(error?.message || 'Unable to verify WhatsApp marketing access.'); });
    return () => { active = false; };
  }, [onError]);
  useEffect(() => marketingAccessReady ? onSnapshot(query(collection(marketingDb, 'whatsapp_campaigns'), orderBy('createdAt', 'desc')), s => setCampaigns(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => onError('Unable to load WhatsApp campaigns.')) : undefined, [marketingAccessReady, onError]);
  useEffect(() => onSnapshot(query(collection(db, 'leadImports'), orderBy('uploadedAt', 'desc')), s => setImports(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => onError('Unable to load lead import history.')), [onError]);
  useEffect(() => {
    if (!marketingAccessReady) return undefined;
    return onSnapshot(collection(marketingDb, 'whatsapp_templates'), (snapshot) => {
    setTemplateLoadError('');
    setTemplatesFromCache(snapshot.metadata.fromCache);
    setTemplates(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))));
  }, (error) => {
    const message = error?.code === 'permission-denied'
      ? 'Your account cannot read WhatsApp templates. Sign in as an Admin, then reload.'
      : 'Templates could not be loaded. Check your connection and reload.';
    setTemplateLoadError(message);
    onError(message);
  });
  }, [marketingAccessReady, onError]);
  useEffect(() => marketingAccessReady && selected ? onSnapshot(query(collection(marketingDb, 'whatsapp_campaigns', selected.id, 'recipients'), orderBy('createdAt', 'desc')), s => setRecipients(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => onError('Unable to load campaign results.')) : undefined, [marketingAccessReady, selected, onError]);
  const projects = useMemo(() => [...new Map(leads.filter(l => l.projectId).map(l => [l.projectId, l.project || l.projectId])).entries()], [leads]);
  const stages = useMemo(() => [...new Set(leads.map(l => l.stage).filter(Boolean))], [leads]);
  const eligible = leads.filter(l => l.phone && l.whatsappOptIn === true).length;
  const estimate = draft.audience === 'custom' ? draft.customIds.length : draft.audience === 'project' ? leads.filter(l => l.projectId === draft.projectId && l.phone && l.whatsappOptIn === true).length : draft.audience === 'stage' ? leads.filter(l => l.stage === draft.stage && l.phone && l.whatsappOptIn === true).length : eligible;
  const approved = templates.filter((template) => String(template.status || '').trim().toUpperCase() === 'APPROVED');
  const selectedTemplate = templates.find(t => t.id === draft.templateId);
  const visibleLeads = useMemo(() => {
    const search = leadSearch.trim().toLowerCase();
    const matchingLeads = search ? leads.filter((lead) => `${lead.name || ''} ${lead.phone || ''}`.toLowerCase().includes(search)) : leads;
    return [...matchingLeads].sort((left, right) => leadDateTimeValue(right) - leadDateTimeValue(left));
  }, [leadSearch, leads]);
  const [leadPage, setLeadPage] = useState(1);
  useEffect(() => setLeadPage(1), [leadSearch]);
  const pageCount = Math.max(1, Math.ceil(visibleLeads.length / 100));
  const currentPage = Math.min(leadPage, pageCount);
  const pageLeads = visibleLeads.slice((currentPage - 1) * 100, currentPage * 100);
  const serialByPhone = useMemo(() => {
    const serials = new Map();
    const used = new Set();
    let next = 1;
    [...leads].sort((left, right) => leadDateTimeValue(left) - leadDateTimeValue(right)).forEach((lead) => {
      const key = phoneKey(lead.phone);
      if (!key || serials.has(key)) return;
      const stored = Number(lead.serialNumber);
      const serial = Number.isInteger(stored) && stored > 0 && !used.has(stored) ? stored : next;
      serials.set(key, serial);
      used.add(serial);
      while (used.has(next)) next += 1;
    });
    return serials;
  }, [leads]);
  const leadPhoneCounts = useMemo(() => leads.reduce((counts, lead) => {
    const key = phoneKey(lead.phone);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map()), [leads]);
  const nextSerialNumber = useMemo(() => Math.max(leads.length, ...[...serialByPhone.values()], 0) + 1, [leads.length, serialByPhone]);
  const create = async () => {
    if (!mediaReady) return onError('Wait for the template preview and select valid header media.');
    if (!draft.name.trim() || !draft.templateId || (draft.audience === 'project' && !draft.projectId) || (draft.audience === 'stage' && !draft.stage)) return onError('Complete the campaign name, audience, and approved template.');
    if (!estimate) return onError('Select at least one eligible lead before sending.');
    setConfirmOpen(true);
  };
  const sendConfirmedCampaign = async () => {
    if (!mediaReady || saving || !confirmOpen || !draft.name.trim() || !draft.templateId || !estimate) return;
    setSaving(true);
    try {
      const result = await httpsCallable(functions, 'createWhatsAppCampaign')({ name: draft.name, templateId: draft.templateId, headerMediaUrl, audience: { type: draft.audience, projectId: draft.projectId || undefined, stage: draft.stage || undefined, leadIds: draft.customIds } });
      setConfirmOpen(false);
      setOpen(false);
      setHeaderMediaUrl('');
      setDraft({ name: '', audience: 'all', projectId: '', stage: '', templateId: '', customIds: [] });
      onSuccess(`Campaign queued for ${result.data.recipientCount} recipients.`);
    }
    catch (e) { onError(e?.message || 'Unable to queue the campaign.'); } finally { setSaving(false); }
  };
  const sent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const normalizeIndianPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    return digits.startsWith('91') && digits.length === 12 ? `+${digits}` : '';
  };
  const addManualLead = async () => {
    const userId = auth.currentUser?.uid;
    const phone = normalizeIndianPhone(manualLead.phone);
    const name = manualLead.name.trim() || 'Unnamed lead';
    if (!userId || !phone) return onError('Enter a valid 10-digit Indian phone number.');
    const digits = phone.replace(/\D/g, '');
    if (leads.some((lead) => String(lead.phone || '').replace(/\D/g, '') === digits)) return onError('This phone number is already a lead.');
    setAddingManual(true);
    try {
      await writeBatch(db).set(doc(collection(db, 'leads')), {
        name,
        phone,
        date: importDate,
        importTime: new Date().toTimeString().slice(0, 5),
        serialNumber: nextSerialNumber,
        duplicateImportCount: 0,
        source: 'manual_entry',
        whatsappOptIn: manualLead.whatsappOptIn,
        optInAt: manualLead.whatsappOptIn ? serverTimestamp() : null,
        optInSource: manualLead.whatsappOptIn ? 'manual_admin_record' : null,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).commit();
      setManualLead({ name: '', phone: '', whatsappOptIn: false });
      setManualOpen(false);
      onSuccess(manualLead.whatsappOptIn ? `${phone} added and ready for an approved WhatsApp campaign.` : `${phone} added. Record WhatsApp consent before including it in a campaign.`);
    } catch (error) { onError(error?.message || 'Unable to add the lead.'); } finally { setAddingManual(false); }
  };
  const recordConsent = async (lead) => {
    if (!lead?.id) return;
    if (!window.confirm(`Confirm that ${lead.name || lead.phone || 'this lead'} explicitly agreed to receive WhatsApp marketing messages.`)) return;
    setRecordingConsentId(lead.id);
    try {
      await updateDoc(doc(db, 'leads', lead.id), {
        whatsappOptIn: true,
        optInAt: serverTimestamp(),
        optInSource: 'admin_recorded_consent',
        optInRecordedBy: auth.currentUser?.uid || null,
        updatedAt: serverTimestamp(),
      });
      onSuccess(`${lead.name || lead.phone || 'Lead'} is now eligible for approved WhatsApp campaigns.`);
    } catch (error) { onError(error?.message || 'Unable to record WhatsApp consent.'); } finally { setRecordingConsentId(''); }
  };
  const deleteAllLeads = async () => {
    if (!leads.length) return onError('There are no leads to delete.');
    if (!window.confirm(`Permanently delete all ${leads.length} leads? This cannot be undone. Import history will be kept.`)) return;
    setDeletingLeads(true);
    try {
      // Firestore batches support up to 500 operations; leave headroom and delete in chunks.
      const chunks = Array.from({ length: Math.ceil(leads.length / 450) }, (_, index) => leads.slice(index * 450, (index + 1) * 450));
      await Promise.all(chunks.map((leadChunk) => {
        const batch = writeBatch(db);
        leadChunk.forEach((lead) => batch.delete(doc(db, 'leads', lead.id)));
        return batch.commit();
      }));
      onSuccess(`${leads.length} leads permanently deleted. You can now import the corrected file as a fresh batch.`);
    } catch (error) { onError(error?.message || 'Unable to delete all leads.'); } finally { setDeletingLeads(false); }
  };
  const importLeads = async () => {
    const userId = auth.currentUser?.uid;
    let rows;
    try {
      rows = parseLeadCsv(importText, importDate) ?? importText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
        .map((line) => parseImportedLead(line, importDate, importTime)).filter((lead) => lead.phone);
    } catch (error) { return onError(error.message); }
    if (!userId) return onError('Sign in again before importing leads.');
    if (!rows.length) return onError('No valid leads found. Paste Date, Name (optional), Time, and a 10-digit or +91 phone number.');
    if (rows.length > 400) return onError('Import up to 400 rows at a time.');
    setImporting(true);
    try {
      const batch = writeBatch(db);
      const existingByPhone = new Map(leads.map((lead) => [phoneKey(lead.phone), lead]).filter(([key]) => key));
      const rowsByPhone = rows.reduce((groups, lead) => {
        const key = phoneKey(lead.phone);
        groups.set(key, [...(groups.get(key) || []), lead]);
        return groups;
      }, new Map());
      const importId = doc(collection(db, 'leadImports')).id;
      const batchName = importName.trim() || `Import ${new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}`;
      let createdCount = 0;
      let duplicateCount = 0;
      let updatedCount = 0;
      let serial = nextSerialNumber;
      rowsByPhone.forEach((phoneRows, key) => {
        const existingLead = existingByPhone.get(key);
        if (existingLead) {
          duplicateCount += phoneRows.length;
          const suppliedLead = phoneRows[0];
          const correction = updateExisting ? {
            ...(suppliedLead.name && suppliedLead.name !== 'Unnamed lead' ? { name: suppliedLead.name } : {}),
            date: suppliedLead.date,
            importTime: suppliedLead.importTime,
          } : {};
          if (updateExisting) updatedCount += 1;
          batch.update(doc(db, 'leads', existingLead.id), { ...correction, duplicateImportCount: increment(phoneRows.length), lastDuplicateImportId: importId, lastDuplicateImportName: batchName, lastDuplicateImportedAt: serverTimestamp(), updatedAt: serverTimestamp() });
          return;
        }
        const lead = phoneRows[0];
        const repeatedInThisImport = phoneRows.length - 1;
        duplicateCount += repeatedInThisImport;
        batch.set(doc(collection(db, 'leads')), { ...lead, serialNumber: serial++, duplicateImportCount: repeatedInThisImport, importBatchId: importId, importBatchName: batchName, uploadedAt: serverTimestamp(), source: 'manual_import', whatsappOptIn: true, optInAt: serverTimestamp(), optInSource: 'manual_import', createdBy: userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        createdCount += 1;
      });
      batch.set(doc(db, 'leadImports', importId), { name: batchName, importedCount: createdCount, duplicateCount, totalRows: rows.length, uploadedAt: serverTimestamp(), uploadedBy: userId });
      await batch.commit();
      setImportText('');
      setImportName('');
      setImportOpen(false);
      onSuccess(`${createdCount} new leads imported.${updatedCount ? ` ${updatedCount} existing lead${updatedCount === 1 ? '' : 's'} updated from the supplied date and time.` : ''} ${duplicateCount} duplicate phone number${duplicateCount === 1 ? '' : 's'} kept under the existing serial number.`);
    } catch (error) { onError(error?.message || 'Unable to import leads.'); } finally { setImporting(false); }
  };
  if (selected) return <section className="whatsapp-marketing"><button className="btn-secondary" onClick={() => setSelected(null)}>← Back to campaigns</button><section className="admin-panel-section"><div className="admin-panel-section-head"><div><span className="admin-panel-kicker">Campaign results</span><h3>{selected.name}</h3><p>{selected.sentCount || 0} sent · {selected.deliveredCount || 0} delivered · {selected.failedCount || 0} failed</p></div><span className={`whatsapp-status ${tone(selected.status)}`}>{selected.status}</span></div><div className="whatsapp-recipient-results">{recipients.map(r => <div key={r.id}><span><strong>{r.leadName || 'Lead'}</strong><small>{r.phoneNumber}</small></span><span className={`whatsapp-status ${tone(r.status === 'DELIVERED' ? 'COMPLETED' : r.status === 'FAILED' ? 'FAILED' : 'SENDING')}`}>{r.status}</span>{r.errorMessage && <small>{r.errorMessage}</small>}</div>)}</div></section></section>;
  return <section className="whatsapp-marketing">
    {importOpen && <section className="admin-panel-section whatsapp-builder whatsapp-import-form"><div className="admin-panel-section-head"><div><span className="admin-panel-kicker">Bulk import</span><h3>Import CRM leads</h3><p>Paste your WhatsApp export directly: <code>29 April [tab] Rutu Kharat [tab] 14:57 [tab] 80109 20376</code>. Zinoo saves each record’s date, name, time, and phone number.</p></div><button className="btn-secondary" onClick={() => setImportOpen(false)}>Cancel</button></div><label>Import name (optional)<input value={importName} placeholder="April WhatsApp leads" onChange={e => setImportName(e.target.value)} /></label><label>Default year/date for simple rows<input type="date" value={importDate} onChange={e => setImportDate(e.target.value)} /></label><label>Default time for simple rows<input type="time" value={importTime} onChange={e => setImportTime(e.target.value)} /></label><label>Leads<textarea value={importText} placeholder={'29 April\tRutu Kharat\t14:57\t80109 20376\n29 April\tShivnanda Gangasagre\t15:05\t820 802 8551'} onChange={e => setImportText(e.target.value)} /></label><label className="whatsapp-consent"><input type="checkbox" checked={updateExisting} onChange={e => setUpdateExisting(e.target.checked)} /> Update the name, date, and time for existing matching phone numbers.</label><p>Rows with their own date and time use those values. A duplicate phone number stays under its existing serial number.</p><div className="whatsapp-directory-actions"><button className="btn-secondary" disabled={importing || deletingLeads} onClick={importLeads}>{importing ? 'Importing…' : 'Import leads'}</button><button className="btn-secondary" disabled={importing || deletingLeads || !leads.length} onClick={deleteAllLeads}>{deletingLeads ? 'Deleting…' : 'Delete all leads'}</button></div></section>}
    {manualOpen && <section className="admin-panel-section whatsapp-builder whatsapp-manual-entry"><div className="admin-panel-section-head"><div><span className="admin-panel-kicker">New lead</span><h3>Add lead manually</h3><p>Add one lead and record consent only when it has been explicitly given.</p></div><button className="btn-secondary" onClick={() => setManualOpen(false)}>Cancel</button></div><label>Name (optional)<input value={manualLead.name} placeholder="Lead name" onChange={e => setManualLead({ ...manualLead, name: e.target.value })} /></label><label>WhatsApp phone number<input type="tel" inputMode="numeric" value={manualLead.phone} placeholder="8468845210" onChange={e => setManualLead({ ...manualLead, phone: e.target.value })} /></label><label className="whatsapp-consent"><input type="checkbox" checked={manualLead.whatsappOptIn} onChange={e => setManualLead({ ...manualLead, whatsappOptIn: e.target.checked })} /> I have recorded this lead’s consent to receive WhatsApp marketing messages.</label><button className="btn-primary" disabled={addingManual} onClick={addManualLead}><Plus size={17} /> {addingManual ? 'Adding…' : 'Add lead'}</button></section>}
    <div className="whatsapp-campaign-trigger whatsapp-dashboard-header"><button type="button" className="btn-primary" onClick={() => { setShowLeadList(false); onViewChange?.('overview'); setImportOpen(false); setManualOpen(false); setOpen(true); window.setTimeout(() => document.getElementById('whatsapp-campaign-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }}><Plus size={17} /> Create campaign</button><button className="btn-secondary" onClick={() => { setOpen(false); setManualOpen(false); setImportOpen(true); }}><Plus size={17} /> Import leads</button><button className="btn-secondary" onClick={() => { setOpen(false); setImportOpen(false); setManualOpen(true); }}><Plus size={17} /> Add lead manually</button></div>
    <section className="whatsapp-summary-grid"><button type="button" className="whatsapp-summary-action" onClick={() => { setShowLeadList(true); onViewChange?.('total-leads'); }} aria-label={`Show all ${leads.length} leads`}><span>Total leads</span><div className="whatsapp-summary-metric"><b>{leads.length}</b><Users /></div><small>View all</small></button><article><span>Eligible leads</span><div className="whatsapp-summary-metric"><b>{eligible}</b><CheckCircle2 /></div></article><article><span>Campaigns</span><div className="whatsapp-summary-metric"><b>{campaigns.length}</b><MessageCircle /></div></article><article><span>Messages sent</span><div className="whatsapp-summary-metric"><b>{sent}</b><Send /></div></article></section>
    {showLeadList && <section className="admin-panel-section whatsapp-lead-directory"><div className="admin-panel-section-head"><div><span className="admin-panel-kicker">Lead directory</span><h3>All leads</h3><p>{visibleLeads.length ? (currentPage - 1) * 100 + 1 : 0}–{Math.min(currentPage * 100, visibleLeads.length)} of {visibleLeads.length} lead{leads.length === 1 ? '' : 's'} shown · latest date first.</p></div><div className="whatsapp-directory-actions"><button className="btn-secondary" onClick={() => setShowImportHistory((current) => !current)}>{showImportHistory ? 'Hide import history' : 'Import history'}</button><button className="btn-secondary" onClick={() => { setShowLeadList(false); onViewChange?.('overview'); }}>Close</button></div></div>{showImportHistory && <div className="whatsapp-import-history"><h4>Import history</h4>{imports.length ? imports.map((item) => <article key={item.id}><span><strong>{item.name || 'Unnamed import'}</strong><small>{displayUploadedAt(item.uploadedAt)}</small></span><span>{item.importedCount || 0} new leads</span><span>{item.duplicateCount || 0} duplicates</span></article>) : <p>No named imports yet.</p>}</div>}<input className="whatsapp-lead-search" type="search" value={leadSearch} placeholder="Search name or phone" aria-label="Search leads" onChange={(event) => setLeadSearch(event.target.value)} />{visibleLeads.length ? <><div className="whatsapp-lead-table-scroll"><div className="whatsapp-lead-table"><div className="whatsapp-lead-table-head"><span>Name / mobile</span><span>Serial no.</span><span>Date</span><span>Time</span><span>Status</span></div><div className="whatsapp-lead-rows">{pageLeads.map((lead) => <div className="whatsapp-lead-row" key={lead.id}><span className="whatsapp-lead-avatar">{String(lead.name || 'L').trim().charAt(0).toUpperCase()}</span><span className="whatsapp-lead-copy"><strong>{lead.name || 'Unnamed lead'}</strong><span>{lead.phone || 'No phone number'}</span>{((lead.duplicateImportCount || 0) > 0 || (leadPhoneCounts.get(phoneKey(lead.phone)) || 0) > 1) && <small className="whatsapp-duplicate-note">Duplicate import ×{Math.max(lead.duplicateImportCount || 0, (leadPhoneCounts.get(phoneKey(lead.phone)) || 1) - 1)}</small>}</span><span className="whatsapp-lead-serial"><strong>#{serialByPhone.get(phoneKey(lead.phone)) || '—'}</strong></span><span className="whatsapp-lead-date"><strong>{displayLeadDate(lead.date)}</strong></span><span className="whatsapp-lead-time"><strong>{displayLeadTime(lead.importTime)}</strong></span><span className={`whatsapp-status ${lead.whatsappOptIn === true ? 'success' : 'warning'}`}>{lead.whatsappOptIn === true ? 'Eligible' : 'Consent needed'}</span>{lead.whatsappOptIn !== true && <button type="button" className="btn-secondary whatsapp-record-consent" disabled={recordingConsentId === lead.id} onClick={() => recordConsent(lead)}>{recordingConsentId === lead.id ? 'Recording…' : 'Record consent'}</button>}</div>)}</div></div></div><div className="whatsapp-lead-pagination"><button className="btn-secondary" disabled={currentPage === 1} onClick={() => setLeadPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pageCount}</span><button className="btn-secondary" disabled={currentPage === pageCount} onClick={() => setLeadPage(currentPage + 1)}>Next 100 leads</button></div></> : <div className="admin-empty-state-card"><Users size={28} /><h4>No matching leads</h4><p>Try a different name or phone number.</p></div>}</section>}
    {open && <section id="whatsapp-campaign-builder" className="admin-panel-section whatsapp-builder whatsapp-campaign-builder"><div className="admin-panel-section-head"><div><span className="admin-panel-kicker">New campaign</span><h3>Campaign builder</h3></div><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button></div><label>Campaign name<input value={draft.name} placeholder="Green Valley September Launch" onChange={e => setDraft({ ...draft, name: e.target.value })} /></label><label>Audience<select value={draft.audience} onChange={e => setDraft({ ...draft, audience: e.target.value })}><option value="all">All leads</option><option value="project">Leads from a selected project</option><option value="stage">Leads by lead status</option><option value="custom">Custom selected leads</option></select></label>{draft.audience === 'project' && <label>Project<select value={draft.projectId} onChange={e => setDraft({ ...draft, projectId: e.target.value })}><option value="">Select project</option>{projects.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>}{draft.audience === 'stage' && <label>Lead status<select value={draft.stage} onChange={e => setDraft({ ...draft, stage: e.target.value })}><option value="">Select status</option>{stages.map(s => <option key={s}>{s}</option>)}</select></label>}{draft.audience === 'custom' && <>
      <label>Search leads by name or phone number<input type="search" value={customLeadSearch} placeholder="Enter a name or phone number" onChange={(event) => { setCustomLeadSearch(event.target.value); setCustomLeadLimit(100); }} /></label>
      <p role="status">{matchingCustomLeads.length} matching leads · {draft.customIds.length} selected</p>
      <div className="whatsapp-custom-leads">{matchingCustomLeads.slice(0, customLeadLimit).map(l => <label key={l.id}><input type="checkbox" checked={draft.customIds.includes(l.id)} onChange={() => setDraft(d => ({ ...d, customIds: d.customIds.includes(l.id) ? d.customIds.filter(id => id !== l.id) : [...d.customIds, l.id] }))} /><span>{l.name || 'Unnamed lead'} · {l.phone || 'No phone'}</span></label>)}{!matchingCustomLeads.length && <p>No matching leads. Try another name or phone number.</p>}</div>
      {matchingCustomLeads.length > customLeadLimit && <button type="button" className="btn-secondary" onClick={() => setCustomLeadLimit((count) => count + 100)}>Show more leads</button>}
    </>}<div className="whatsapp-recipient-count"><Users size={17} /><strong>About {estimate} leads selected</strong><span>Final valid E.164 recipient count is verified server-side.</span></div><label>Approved Meta template<select value={draft.templateId} onChange={e => { setDraft({ ...draft, templateId: e.target.value }); setHeaderMediaUrl(''); setMediaReady(false); }}><option value="">{templateLoadError || (templatesFromCache ? 'Connecting to Firestore…' : approved.length ? 'Select approved template' : 'No approved templates found')}</option>{templates.map(t => <option key={t.id} value={t.id} disabled={String(t.status || '').toUpperCase() !== 'APPROVED'}>{t.name} · {t.language}{String(t.status || '').toUpperCase() !== 'APPROVED' ? ` · ${t.status || 'Unknown status'}` : ''}</option>)}</select></label><button type="button" className="btn-secondary" disabled={syncingTemplates || !marketingAccessReady} onClick={refreshTemplates}>{syncingTemplates ? 'Refreshing…' : 'Refresh from Meta'}</button>{templateSyncError && <p className="app-error" role="alert">{templateSyncError}</p>}{templates.some(t => String(t.status || '').toUpperCase() !== 'APPROVED') && <p>Templates awaiting approval or otherwise unavailable are shown with their status. Only approved templates can be sent.</p>}{templateLoadError && <p className="app-error" role="alert">{templateLoadError}</p>}{!templateLoadError && templatesFromCache && <p>Waiting for a live Firestore connection. Keep this page online and it will load approved templates automatically.</p>}{!templateLoadError && !templatesFromCache && !approved.length && <p>No approved templates are available in this Firebase project yet.</p>}{selectedTemplate && <WhatsAppTemplatePreview key={selectedTemplate.id} template={selectedTemplate} onMediaChange={setHeaderMediaUrl} onReadyChange={setMediaReady} />}<button className="btn-primary" disabled={saving || !approved.length || !mediaReady} onClick={create}><Send size={17} /> {saving ? 'Queuing…' : 'Confirm and send campaign'}</button></section>}
    <section className="admin-panel-section whatsapp-recent-campaigns"><div className="admin-panel-section-head"><div><h3>Recent campaigns</h3><p>Progress and delivery results are updated by Meta webhooks.</p></div></div>{campaigns.length ? <div className="whatsapp-campaign-list">{campaigns.map(c => <button type="button" className="whatsapp-campaign-row" key={c.id} onClick={() => onOpenCampaign?.(c.id)} aria-label={`View campaign ${c.name}`}><span><strong>{c.name}</strong><small>{displayDate(c.createdAt)} · {c.templateName}</small></span><span>{c.sentCount || 0}/{c.totalRecipients || 0} sent · {c.deliveredCount || 0} delivered · {c.failedCount || 0} failed</span><span className={`whatsapp-status ${tone(c.status)}`}>{c.status}</span><ChevronRight size={18} /></button>)}</div> : <div className="admin-empty-state-card"><MessageCircle size={28} /><h4>No campaigns yet</h4><p>Start with a small test audience and an approved Meta template.</p></div>}</section>
    {confirmOpen && <div className="whatsapp-send-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="whatsapp-send-confirm-title"><section className="whatsapp-send-confirm"><span className="admin-panel-kicker">Final confirmation</span><h2 id="whatsapp-send-confirm-title">Send this campaign?</h2><strong className="whatsapp-send-count">{estimate}</strong><p className="whatsapp-send-count-label">people will receive this WhatsApp message</p><div className="whatsapp-send-summary"><span><b>Campaign</b>{draft.name.trim()}</span><span><b>Audience</b>{draft.audience === 'custom' ? `${draft.customIds.length} selected leads` : draft.audience === 'all' ? 'All eligible leads' : draft.audience === 'project' ? 'Selected project leads' : 'Selected status leads'}</span><span><b>Template</b>{selectedTemplate?.name || 'Approved Meta template'}</span></div>{selectedTemplate && <WhatsAppTemplatePreview key={`confirm-${selectedTemplate.id}`} template={selectedTemplate} headerMediaUrl={headerMediaUrl} />}<div className="whatsapp-send-confirm-actions"><button type="button" className="btn-secondary" disabled={saving} onClick={() => setConfirmOpen(false)}>Go back</button><button type="button" className="btn-primary" disabled={saving} onClick={sendConfirmedCampaign}><Send size={17} /> {saving ? 'Sending…' : `Send to ${estimate} people`}</button></div></section></div>}
  </section>;
}
