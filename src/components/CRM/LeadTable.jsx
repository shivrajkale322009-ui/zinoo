import React, { useState, useMemo, useEffect, useId } from 'react';
import LeadBudgetSelect from './LeadBudgetSelect';
import LeadQuickNote from './LeadQuickNote';
import {
  Search,
  Filter,
  Columns3,
  Plus,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  XCircle,
  X,
  Flame,
  User,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  LEAD_STAGES,
  LEAD_TEMPERATURES,
  LEAD_SOURCES,
  PREFERRED_AREAS,
  formatLeadBudget,
  isToday,
  isOverdue,
  getEpochMs,
  getPhoneDigits,
  getLeadSummaryMetrics,
  createActivityRecord
} from '../../utils/crmLeadModel';

const TABLE_COLUMNS = ['Customer Name', 'Uploaded Date', 'Phone / Contact', 'Source', 'Budget', 'Location & Size', 'Assigned Agent', 'Stage', 'Temp', 'Next Follow-up', 'Notes', 'Actions'];
const COLUMN_STORAGE_KEY = 'druvio.crm.hiddenColumns';

export default function LeadTable({
  leads = [],
  agents = [],
  onSelectLead,
  onOpenAddModal,
  onOpenMetrics,
  onLoadSampleData,
  onUpdateLead,
  currentUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumns, setShowColumns] = useState(false);
  const columnPanelId = useId();
  const [hiddenColumns, setHiddenColumns] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COLUMN_STORAGE_KEY) || '[]');
      const valid = Array.isArray(saved) ? [...new Set(saved.filter((column) => TABLE_COLUMNS.includes(column)))] : [];
      return valid.length < TABLE_COLUMNS.length ? valid : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(hiddenColumns)); } catch { /* Preferences still work for this session. */ }
  }, [hiddenColumns]);
  const [savingLeads, setSavingLeads] = useState({});
  const [saveError, setSaveError] = useState('');
  const uploadedDate = (lead) => {
    const time = getEpochMs(lead.createdAt) || getEpochMs(lead.date);
    return time ? new Date(time).toLocaleDateString('en-GB') : 'Not available';
  };
  const updateField = async (lead, field, value) => {
    if (savingLeads[lead.id] || value === lead[field]) return;
    setSavingLeads((previous) => ({ ...previous, [lead.id]: true }));
    setSaveError('');
    const activity = createActivityRecord({
      type: field === 'stage' ? 'stage_changed' : 'temperature_changed',
      title: field === 'stage' ? 'Stage Changed' : 'Temperature Changed',
      description: field === 'stage' ? `Stage moved from "${lead.stage || 'New'}" to "${value}".` : `Updated temperature to ${value}.`,
      user: currentUser
    });
    try {
      const saved = await onUpdateLead(lead.id, { [field]: value, activities: [activity, ...(lead.activities || [])] });
      if (saved === false) setSaveError('Could not save the change. Please try again.');
    } catch {
      setSaveError('Could not save the change. Please try again.');
    } finally {
      setSavingLeads((previous) => ({ ...previous, [lead.id]: false }));
    }
  };
  const fieldSelect = (lead, field, options, selected) => (
    <select className="crm-inline-select crm-colored-status" aria-label={`${field === 'stage' ? 'Stage' : 'Temperature'} for ${lead.name || lead.phone || 'unnamed lead'}`}
      value={selected.key} disabled={!onUpdateLead || savingLeads[lead.id]}
      style={{ '--status-bg': selected.bg, '--status-border': selected.border, '--status-color': selected.text }}
      onChange={(event) => updateField(lead, field, event.target.value)}>
      {options.map((option) => <option key={option.key} value={option.key} style={{ backgroundColor: option.bg, color: option.text, fontWeight: 600 }}>● {option.label}</option>)}
    </select>
  );
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'today_fu', 'overdue_fu', 'new', 'hot', 'visits_today', 'unassigned'
  const [stageFilter, setStageFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [tempFilter, setTempFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Calculate live summary metrics
  const summaryMetrics = useMemo(() => getLeadSummaryMetrics(leads), [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    let result = leads;

    // 1. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const qDigits = getPhoneDigits(q);

      result = result.filter((lead) => {
        const nameMatch = String(lead.name || '').toLowerCase().includes(q);
        const locMatch = Array.isArray(lead.preferredLocations)
          ? lead.preferredLocations.some((loc) => String(loc).toLowerCase().includes(q))
          : false;
        const projectMatch = Array.isArray(lead.recommendedProjects)
          ? lead.recommendedProjects.some((p) => String(p.projectName || '').toLowerCase().includes(q))
          : false;
        const phoneMatch = qDigits && lead.phone && getPhoneDigits(lead.phone).includes(qDigits);

        return nameMatch || locMatch || projectMatch || phoneMatch;
      });
    }

    // 2. Quick filter tabs
    if (quickFilter === 'today_fu') {
      result = result.filter((lead) => lead.nextFollowUpAt && isToday(lead.nextFollowUpAt));
    } else if (quickFilter === 'overdue_fu') {
      result = result.filter(
        (lead) =>
          lead.nextFollowUpAt &&
          isOverdue(lead.nextFollowUpAt) &&
          lead.stage !== 'Closed Won' &&
          lead.stage !== 'Closed Lost'
      );
    } else if (quickFilter === 'new') {
      result = result.filter((lead) => (lead.stage || 'New') === 'New');
    } else if (quickFilter === 'hot') {
      result = result.filter((lead) => lead.temperature === 'Hot');
    } else if (quickFilter === 'visits_today') {
      result = result.filter((lead) => {
        const visits = Array.isArray(lead.siteVisits) ? lead.siteVisits : [];
        return visits.some((v) => isToday(v.date || v.datetime) && v.status !== 'Cancelled');
      });
    } else if (quickFilter === 'unassigned') {
      result = result.filter((lead) => !lead.assignedUserId || lead.assignedUserId === 'unassigned');
    }

    // 3. Dropdown filters
    if (stageFilter) {
      result = result.filter((lead) => (lead.stage || 'New') === stageFilter);
    }
    if (agentFilter) {
      result = result.filter((lead) => lead.assignedUserId === agentFilter);
    }
    if (sourceFilter) {
      result = result.filter((lead) => (lead.source || 'Website') === sourceFilter);
    }
    if (tempFilter) {
      result = result.filter((lead) => (lead.temperature || 'Warm') === tempFilter);
    }
    if (locationFilter) {
      result = result.filter((lead) =>
        Array.isArray(lead.preferredLocations) && lead.preferredLocations.includes(locationFilter)
      );
    }

    // Sort by recent activity or creation date
    return [...result].sort((a, b) => {
      const timeA = getEpochMs(a.updatedAt || a.createdAt || a.date);
      const timeB = getEpochMs(b.updatedAt || b.createdAt || b.date);
      return timeB - timeA;
    });
  }, [
    leads,
    searchQuery,
    quickFilter,
    stageFilter,
    agentFilter,
    sourceFilter,
    tempFilter,
    locationFilter
  ]);

  // Paginated chunk
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  const hasActiveFilters = Boolean(
    searchQuery || stageFilter || agentFilter || sourceFilter || tempFilter || locationFilter || quickFilter !== 'all'
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setQuickFilter('all');
    setStageFilter('');
    setAgentFilter('');
    setSourceFilter('');
    setTempFilter('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="crm-workspace">
      {saveError && <p role="alert">{saveError}</p>}
      {/* 1. TOP METRIC SUMMARY CARDS */}
      <div className="crm-metrics-grid">
        <div
          className={`crm-metric-card ${quickFilter === 'all' ? 'active' : ''}`}
          onClick={() => { setQuickFilter('all'); setCurrentPage(1); }}
        >
          <div className="crm-metric-icon blue">
            <UserCheck size={20} />
          </div>
          <div className="crm-metric-content">
            <span className="crm-metric-value">{summaryMetrics.totalLeads}</span>
            <span className="crm-metric-label">Total Leads</span>
          </div>
        </div>

        <div
          className={`crm-metric-card ${quickFilter === 'new' ? 'active' : ''}`}
          onClick={() => { setQuickFilter('new'); setCurrentPage(1); }}
        >
          <div className="crm-metric-icon purple">
            <Sparkles size={20} />
          </div>
          <div className="crm-metric-content">
            <span className="crm-metric-value">{summaryMetrics.newLeads}</span>
            <span className="crm-metric-label">New Leads</span>
          </div>
        </div>

        <div
          className={`crm-metric-card ${quickFilter === 'today_fu' ? 'active' : ''}`}
          onClick={() => { setQuickFilter('today_fu'); setCurrentPage(1); }}
        >
          <div className="crm-metric-icon amber">
            <Clock size={20} />
          </div>
          <div className="crm-metric-content">
            <span className="crm-metric-value">{summaryMetrics.followUpsToday}</span>
            <span className="crm-metric-label">Follow-ups Today</span>
          </div>
        </div>

        <div
          className={`crm-metric-card ${quickFilter === 'visits_today' ? 'active' : ''}`}
          onClick={() => { setQuickFilter('visits_today'); setCurrentPage(1); }}
        >
          <div className="crm-metric-icon emerald">
            <Calendar size={20} />
          </div>
          <div className="crm-metric-content">
            <span className="crm-metric-value">{summaryMetrics.siteVisitsToday}</span>
            <span className="crm-metric-label">Site Visits Today</span>
          </div>
        </div>

        <div
          className={`crm-metric-card ${quickFilter === 'hot' ? 'active' : ''}`}
          onClick={() => { setQuickFilter('hot'); setCurrentPage(1); }}
        >
          <div className="crm-metric-icon rose">
            <Flame size={20} />
          </div>
          <div className="crm-metric-content">
            <span className="crm-metric-value">{summaryMetrics.hotLeads}</span>
            <span className="crm-metric-label">Hot Leads</span>
          </div>
        </div>

        <div
          className="crm-metric-card"
          onClick={onOpenMetrics}
          title="Open conversion funnel and monthly deal report"
        >
          <div className="crm-metric-icon blue">
            <TrendingUp size={20} />
          </div>
          <div className="crm-metric-content">
            <span className="crm-metric-value">{summaryMetrics.closedThisMonth}</span>
            <span className="crm-metric-label">Closed This Month</span>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR: SEARCH, QUICK FILTER PILLS, BUTTONS */}
      <div className="crm-control-bar">
        <div className="crm-control-top-row">
          {/* Search box */}
          <div className="crm-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by buyer name, phone, project name, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="crm-action-buttons">
            <button type="button" className="crm-btn crm-btn-secondary" aria-expanded={showColumns} aria-controls={columnPanelId} onClick={() => setShowColumns((value) => !value)}>
              <Columns3 size={15} /> Columns
            </button>
            <button
              type="button"
              className={`crm-btn ${showAdvancedFilters ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter size={15} /> Filters
            </button>

            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              onClick={onOpenMetrics}
            >
              <TrendingUp size={15} /> Pipeline Metrics
            </button>

            {leads.length === 0 && onLoadSampleData && (
              <button
                type="button"
                className="crm-btn crm-btn-secondary"
                onClick={onLoadSampleData}
                title="Populate realistic Maharashtra / Chakan sample leads for testing"
              >
                <Sparkles size={15} color="#2563eb" /> Load Demo Leads
              </button>
            )}

            <button
              type="button"
              className="crm-btn crm-btn-primary"
              onClick={onOpenAddModal}
            >
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>

        {showColumns && <fieldset id={columnPanelId} className="crm-column-picker">
          <legend>Show columns</legend>
          {TABLE_COLUMNS.map((column) => <label key={column}>
            <input type="checkbox" checked={!hiddenColumns.includes(column)} disabled={!hiddenColumns.includes(column) && hiddenColumns.length === TABLE_COLUMNS.length - 1}
              onChange={() => setHiddenColumns((previous) => previous.includes(column) ? previous.filter((item) => item !== column) : [...previous, column])} />
            {column}
          </label>)}
          <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setHiddenColumns([])}>Show all</button>
          <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowColumns(false)}>Done</button>
        </fieldset>}
        {/* Quick Filter Chips */}
        <div className="crm-quick-filters">
          {[
            { key: 'all', label: 'All Leads', count: summaryMetrics.totalLeads },
            { key: 'today_fu', label: 'Today Follow-ups', count: summaryMetrics.followUpsToday },
            { key: 'overdue_fu', label: 'Overdue Follow-ups', count: summaryMetrics.overdueFollowUps },
            { key: 'new', label: 'New Leads', count: summaryMetrics.newLeads },
            { key: 'hot', label: 'Hot Leads', count: summaryMetrics.hotLeads },
            { key: 'visits_today', label: 'Site Visits Today', count: summaryMetrics.siteVisitsToday },
            { key: 'unassigned', label: 'Unassigned', count: summaryMetrics.unassignedLeads }
          ].map((chip) => (
            <button
              type="button"
              key={chip.key}
              className={`crm-chip ${quickFilter === chip.key ? 'active' : ''}`}
              onClick={() => {
                setQuickFilter(chip.key);
                setCurrentPage(1);
              }}
            >
              <span>{chip.label}</span>
              <span className="crm-chip-badge">{chip.count}</span>
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              className="crm-chip"
              style={{ color: '#be123c', borderColor: '#fecdd3', background: '#fff1f2' }}
              onClick={handleClearFilters}
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          )}
        </div>

        {/* Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="crm-filters-drawer">
            <div className="crm-filter-group">
              <label>Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Stages</option>
                {LEAD_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="crm-filter-group">
              <label>Assigned Agent</label>
              <select
                value={agentFilter}
                onChange={(e) => { setAgentFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent.id || agent.uid} value={agent.id || agent.uid}>
                    {agent.displayName || agent.name || agent.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-filter-group">
              <label>Lead Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Sources</option>
                {LEAD_SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div className="crm-filter-group">
              <label>Temperature</label>
              <select
                value={tempFilter}
                onChange={(e) => { setTempFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Temperatures</option>
                {LEAD_TEMPERATURES.map((t) => (
                  <option key={t.key} value={t.key}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            <div className="crm-filter-group">
              <label>Preferred Area</label>
              <select
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Areas</option>
                {PREFERRED_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. LEADS TABLE (DESKTOP) & CARDS (MOBILE) */}
      <div className="crm-table-surface">
        {filteredLeads.length === 0 ? (
          <div className="crm-empty-state">
            <UserCheck size={40} />
            <h3>No leads found</h3>
            <p>
              {hasActiveFilters
                ? 'Try clearing some search or filter options to see matching leads.'
                : 'Get started by creating your first buyer lead or load demo fixtures.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                className="crm-btn crm-btn-secondary"
                style={{ marginTop: 10 }}
                onClick={handleClearFilters}
              >
                Reset Filters
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                {onLoadSampleData && (
                  <button
                    type="button"
                    className="crm-btn crm-btn-secondary"
                    onClick={onLoadSampleData}
                  >
                    <Sparkles size={14} color="#2563eb" /> Load Demo Leads
                  </button>
                )}
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  onClick={onOpenAddModal}
                >
                  <Plus size={14} /> Add First Lead
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th hidden={hiddenColumns.includes('Customer Name')}>Customer Name</th>
                    <th hidden={hiddenColumns.includes('Uploaded Date')}>Uploaded Date</th>
                    <th hidden={hiddenColumns.includes('Phone / Contact')}>Phone / Contact</th>
                    <th hidden={hiddenColumns.includes('Source')}>Source</th>
                    <th hidden={hiddenColumns.includes('Budget')}>Budget</th>
                    <th hidden={hiddenColumns.includes('Location & Size')}>Location & Size</th>
                    <th hidden={hiddenColumns.includes('Assigned Agent')}>Assigned Agent</th>
                    <th hidden={hiddenColumns.includes('Stage')}>Stage</th>
                    <th hidden={hiddenColumns.includes('Temp')}>Temp</th>
                    <th hidden={hiddenColumns.includes('Next Follow-up')}>Next Follow-up</th>
                    <th hidden={hiddenColumns.includes('Notes')}>Notes</th>
                    <th hidden={hiddenColumns.includes('Actions')} style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead) => {
                    const stageObj = LEAD_STAGES.find((s) => s.key === lead.stage) || LEAD_STAGES[0];
                    const tempObj = LEAD_TEMPERATURES.find((t) => t.key === lead.temperature) || LEAD_TEMPERATURES[1];
                    const phoneDigits = lead.phone ? String(lead.phone).replace(/\D/g, '') : '';
                    const waDigits = lead.whatsapp ? String(lead.whatsapp).replace(/\D/g, '') : phoneDigits;
                    const waUrl = waDigits ? `https://wa.me/${waDigits.startsWith('91') ? waDigits : `91${waDigits}`}` : '';
                    const callUrl = lead.phone ? `tel:${lead.phone}` : '';

                    return (
                      <tr key={lead.id}>
                        <td hidden={hiddenColumns.includes('Customer Name')}>
                          <div className="crm-lead-name-cell">
                            <span
                              className="crm-lead-title"
                              onClick={() => onSelectLead(lead.id)}
                            >
                              {lead.name || 'Unnamed Lead'}
                            </span>
                          </div>
                        </td>

                        <td hidden={hiddenColumns.includes('Uploaded Date')} style={{ whiteSpace: 'nowrap' }}>{uploadedDate(lead)}</td>
                        <td hidden={hiddenColumns.includes('Phone / Contact')}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {lead.phone || 'No phone'}
                          </span>
                        </td>

                        <td hidden={hiddenColumns.includes('Source')}>
                          <span className="crm-source-tag">{lead.source || 'Website'}</span>
                        </td>

                        <td hidden={hiddenColumns.includes('Budget')}>
                          <LeadBudgetSelect lead={lead} onUpdateLead={onUpdateLead} currentUser={currentUser} />
                        </td>

                        <td hidden={hiddenColumns.includes('Location & Size')}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12 }}>
                              {Array.isArray(lead.preferredLocations) && lead.preferredLocations.length > 0
                                ? lead.preferredLocations.slice(0, 2).join(', ')
                                : 'Chakan'}
                            </span>
                            {lead.plotSize && (
                              <span style={{ fontSize: 11, color: '#64748b' }}>{lead.plotSize}</span>
                            )}
                          </div>
                        </td>

                        <td hidden={hiddenColumns.includes('Assigned Agent')}>
                          <span style={{ fontSize: 12, color: lead.assignedUserName ? '#0f172a' : '#94a3b8' }}>
                            {lead.assignedUserName || 'Unassigned'}
                          </span>
                        </td>

                        <td hidden={hiddenColumns.includes('Stage')}>
                          {fieldSelect(lead, 'stage', LEAD_STAGES, stageObj)}
                        </td>

                        <td hidden={hiddenColumns.includes('Temp')}>
                          {fieldSelect(lead, 'temperature', LEAD_TEMPERATURES, tempObj)}
                        </td>

                        <td hidden={hiddenColumns.includes('Next Follow-up')}>
                          {lead.nextFollowUpAt ? (
                            <span
                              className={`crm-followup-pill ${
                                isOverdue(lead.nextFollowUpAt)
                                  ? 'overdue'
                                  : isToday(lead.nextFollowUpAt)
                                  ? 'today'
                                  : ''
                              }`}
                            >
                              <Clock size={12} />
                              {new Date(lead.nextFollowUpAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>None set</span>
                          )}
                        </td>

                        <td hidden={hiddenColumns.includes('Notes')}><LeadQuickNote lead={lead} currentUser={currentUser} onUpdateLead={onUpdateLead} /></td>
                        <td hidden={hiddenColumns.includes('Actions')}>
                          <div className="crm-quick-actions" style={{ justifyContent: 'flex-end' }}>
                            {callUrl && (
                              <a
                                href={callUrl}
                                className="crm-icon-btn phone"
                                title={`Call ${lead.name}`}
                              >
                                <Phone size={14} />
                              </a>
                            )}
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="crm-icon-btn whatsapp"
                                title={`WhatsApp ${lead.name}`}
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}
                            <button
                              type="button"
                              className="crm-btn crm-btn-secondary"
                              style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                              onClick={() => onSelectLead(lead.id)}
                            >
                              View <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List */}
            <div className="crm-mobile-card-list">
              {paginatedLeads.map((lead) => {
                const stageObj = LEAD_STAGES.find((s) => s.key === lead.stage) || LEAD_STAGES[0];
                const tempObj = LEAD_TEMPERATURES.find((t) => t.key === lead.temperature) || LEAD_TEMPERATURES[1];
                const phoneDigits = lead.phone ? String(lead.phone).replace(/\D/g, '') : '';
                const waDigits = lead.whatsapp ? String(lead.whatsapp).replace(/\D/g, '') : phoneDigits;
                const waUrl = waDigits ? `https://wa.me/${waDigits.startsWith('91') ? waDigits : `91${waDigits}`}` : '';
                const callUrl = lead.phone ? `tel:${lead.phone}` : '';

                return (
                  <div key={lead.id} className="crm-mobile-card">
                    <div className="crm-mobile-card-header">
                      <div>
                        <div
                          style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                          onClick={() => onSelectLead(lead.id)}
                        >
                          {lead.name || 'Unnamed Lead'}
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                          {lead.phone} • <span className="crm-source-tag">{lead.source || 'Website'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        {fieldSelect(lead, 'stage', LEAD_STAGES, stageObj)}
                        {fieldSelect(lead, 'temperature', LEAD_TEMPERATURES, tempObj)}
                      </div>
                    </div>

                    <div className="crm-mobile-card-body"><div className="crm-mobile-card-row"><span>Uploaded Date</span><strong>{uploadedDate(lead)}</strong></div>
                      <div className="crm-mobile-card-row">
                        <span>Budget</span>
                        <LeadBudgetSelect lead={lead} onUpdateLead={onUpdateLead} currentUser={currentUser} />
                      </div>
                      <div className="crm-mobile-card-row">
                        <span>Location</span>
                        <strong>
                          {Array.isArray(lead.preferredLocations) && lead.preferredLocations.length > 0
                            ? lead.preferredLocations.join(', ')
                            : 'Chakan'}
                        </strong>
                      </div>
                      <div className="crm-mobile-card-row">
                        <span>Agent</span>
                        <strong>{lead.assignedUserName || 'Unassigned'}</strong>
                      </div>
                      <div className="crm-mobile-card-row">
                        <span>Next Follow-up</span>
                        <strong>
                          {lead.nextFollowUpAt
                            ? new Date(lead.nextFollowUpAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                            : 'None set'}
                        </strong>
                      </div>
                    </div>

                    <div className="crm-mobile-card-footer">
                      <LeadQuickNote lead={lead} currentUser={currentUser} onUpdateLead={onUpdateLead} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        {callUrl && (
                          <a href={callUrl} className="crm-icon-btn phone">
                            <Phone size={15} />
                          </a>
                        )}
                        {waUrl && (
                          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="crm-icon-btn whatsapp">
                            <MessageCircle size={15} />
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        className="crm-btn crm-btn-primary"
                        style={{ height: 34, fontSize: 12 }}
                        onClick={() => onSelectLead(lead.id)}
                      >
                        Open Workspace <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="crm-pagination-bar">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
                </span>
                <div className="crm-pagination-controls">
                  <button
                    type="button"
                    className="crm-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .slice(Math.max(0, currentPage - 3), currentPage + 2)
                    .map((pNum) => (
                      <button
                        type="button"
                        key={pNum}
                        className={`crm-page-btn ${currentPage === pNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pNum)}
                      >
                        {pNum}
                      </button>
                    ))}
                  <button
                    type="button"
                    className="crm-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
