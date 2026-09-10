import { useEffect, useMemo, useRef, useState } from 'react';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import {
  ArrowLeft, Building2, Check, ChevronRight, CloudUpload, Eye, FileText,
  FolderKanban, Image, Info, MapPin, Phone, RotateCcw, Save, UserRound, X
} from 'lucide-react';
import { functions, storage } from '../firebaseConfig';
import BuyerDeveloperProfile from './Buyer/Developer/BuyerDeveloperProfile';

const EMPTY = {
  businessName: '', publicDescription: '', publicLogo: '', publicOfficeLocation: '',
  publicPhone: '', publicWebsite: '', yearsInBusiness: 0, developerProfileVisible: true
};
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storagePathFromUrl = (url) => {
  try { return decodeURIComponent(new URL(url).pathname.split('/o/')[1] || ''); } catch { return ''; }
};

export default function SellerDeveloperProfile({ user, projects = [], onBack, onOpenAccount, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [serverProfile, setServerProfile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [removeLogo, setRemoveLogo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);
  const fileInput = useRef(null);

  const activeProjects = useMemo(() => projects.filter((project) => project.ownerId === user.uid && project.status === 'active'), [projects, user.uid]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    httpsCallable(functions, 'getDeveloperProfile')({ sellerId: user.uid })
      .then(({ data }) => {
        if (!active) return;
        const profile = data.profile || {};
        setServerProfile(profile);
        setForm({
          businessName: profile.name || user.businessName || '',
          publicDescription: profile.description || '', publicLogo: profile.logo || '',
          publicOfficeLocation: profile.officeLocation || '', publicPhone: profile.publicPhone || '',
          publicWebsite: profile.publicWebsite || '', yearsInBusiness: Number(profile.yearsInBusiness) || 0,
          developerProfileVisible: profile.visible !== false
        });
      })
      .catch((loadError) => setError(loadError?.message || 'Unable to load your developer profile.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.businessName, user.uid]);

  useEffect(() => () => { if (logoPreview) URL.revokeObjectURL(logoPreview); }, [logoPreview]);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const chooseLogo = (file) => {
    setError('');
    if (!file) return;
    if (!MIME_TYPES.has(file.type)) return setError('Logo must be a JPG, PNG, or WebP image.');
    if (file.size > MAX_LOGO_BYTES) return setError('Logo must be 5 MB or smaller.');
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); setRemoveLogo(false);
  };

  const resetLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null); setLogoPreview(''); setRemoveLogo(true);
    if (fileInput.current) fileInput.current.value = '';
  };

  const save = async (event) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (form.businessName.trim().length < 2) return setError('Developer / Company Name is required.');
    if (form.publicWebsite && !/^https:\/\//i.test(form.publicWebsite.trim())) return setError('Website must begin with https://');
    setSaving(true);
    let uploadedRef = null;
    try {
      let publicLogo = removeLogo ? '' : form.publicLogo;
      if (logoFile) {
        const extension = logoFile.type === 'image/webp' ? 'webp' : logoFile.type === 'image/png' ? 'png' : 'jpg';
        uploadedRef = ref(storage, `developer-profile-logos/${user.uid}/${Date.now()}.${extension}`);
        const snapshot = await uploadBytes(uploadedRef, logoFile, { contentType: logoFile.type, customMetadata: { ownerId: user.uid } });
        publicLogo = await getDownloadURL(snapshot.ref);
      }
      const payload = {
        ...form, businessName: form.businessName.trim(), publicDescription: form.publicDescription.trim(),
        publicLogo, publicOfficeLocation: form.publicOfficeLocation.trim(), publicPhone: form.publicPhone.trim(),
        publicWebsite: form.publicWebsite.trim(), yearsInBusiness: Number(form.yearsInBusiness),
        developerProfileVisible: Boolean(form.developerProfileVisible)
      };
      const { data } = await httpsCallable(functions, 'updateDeveloperProfile')(payload);
      const oldPath = storagePathFromUrl(form.publicLogo);
      if ((logoFile || removeLogo) && oldPath.startsWith(`developer-profile-logos/${user.uid}/`)) {
        await deleteObject(ref(storage, oldPath)).catch(() => undefined);
      }
      setForm(payload); setLogoFile(null); setLogoPreview(''); setRemoveLogo(false);
      setServerProfile((current) => ({ ...current, ...data.profile, name: payload.businessName, logo: payload.publicLogo, description: payload.publicDescription, officeLocation: payload.publicOfficeLocation, visible: payload.developerProfileVisible }));
      onSaved?.(data.profile); setSuccess('Developer profile saved.');
    } catch (saveError) {
      if (uploadedRef) await deleteObject(uploadedRef).catch(() => undefined);
      setError(saveError?.message || 'Unable to save your developer profile.');
    } finally { setSaving(false); }
  };

  const previewProfile = {
    ...serverProfile, name: form.businessName || 'Developer', description: form.publicDescription,
    logo: logoPreview || (removeLogo ? '' : form.publicLogo), officeLocation: form.publicOfficeLocation,
    publicPhone: form.publicPhone, publicWebsite: form.publicWebsite,
    yearsInBusiness: Number(form.yearsInBusiness) || 0, visible: form.developerProfileVisible
  };
  if (preview) return <BuyerDeveloperProfile profile={previewProfile} projects={activeProjects} loading={false} error="" onBack={() => setPreview(false)} onProjectSelect={() => {}} onViewProjectsOnMap={() => {}} previewMode />;

  const sections = [
    [Info, 'About', 'Business story and overview'], [FolderKanban, 'Projects Portfolio', 'Active projects'],
    [Check, 'Completed Projects', 'Delivered project count'], [Image, 'Gallery', 'Managed inside each project'],
    [FileText, 'Documents', 'Project documents stay protected']
  ];

  return <section className="seller-developer-profile-page" aria-label="Developer profile management">
    <header className="seller-developer-profile-header"><button type="button" onClick={onBack} aria-label="Back"><ArrowLeft size={21} /></button><div><span>Profile</span><h1>Developer Profile</h1><p>Your public presence on Zinoo</p></div><button type="button" className="seller-profile-preview-button" onClick={() => setPreview(true)} disabled={loading}><Eye size={17} /> Preview as Buyer</button></header>
    <nav className="seller-profile-mode-tabs" aria-label="Profile areas"><button type="button" className="active"><Building2 size={19} /><span><strong>Developer Profile</strong><small>Your public presence on Zinoo</small></span></button><button type="button" onClick={onOpenAccount}><UserRound size={19} /><span><strong>Account</strong><small>Personal account information</small></span><ChevronRight size={18} /></button></nav>
    {loading ? <div className="seller-developer-profile-loading">Loading developer profile…</div> : <form className="seller-developer-profile-layout" onSubmit={save}>
      <div className="seller-developer-profile-editor">
        {error && <div className="seller-profile-message error">{error}</div>}{success && <div className="seller-profile-message success">{success}</div>}
        <section className="seller-profile-editor-card"><header><div><span>01</span><h2>Basic Information</h2></div><p>The identity buyers see across Zinoo.</p></header>
          <div className="seller-profile-logo-field"><div className="seller-profile-logo-preview">{logoPreview || (!removeLogo && form.publicLogo) ? <img src={logoPreview || form.publicLogo} alt="Developer logo preview" /> : <Building2 size={34} />}</div><div><strong>{logoPreview || (!removeLogo && form.publicLogo) ? 'Developer logo' : 'Add your developer logo'}</strong><p>JPG, PNG or WebP. Maximum 5 MB.</p><div><button type="button" onClick={() => fileInput.current?.click()}><CloudUpload size={16} /> {form.publicLogo || logoFile ? 'Replace' : 'Upload logo'}</button>{(form.publicLogo || logoFile) && <button type="button" className="quiet" onClick={resetLogo}><X size={16} /> Remove</button>}</div><input ref={fileInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseLogo(event.target.files?.[0])} /></div></div>
          <label>Developer / Company Name *<input required maxLength={120} value={form.businessName} onChange={(event) => update('businessName', event.target.value)} placeholder="Your registered business name" /></label>
          <label>Business Description<textarea maxLength={600} rows={5} value={form.publicDescription} onChange={(event) => update('publicDescription', event.target.value)} placeholder="Tell buyers about your business, expertise, and approach." /><small>{form.publicDescription.length}/600</small></label>
        </section>
        <section className="seller-profile-editor-card"><header><div><span>02</span><h2>Business Details</h2></div><p>Established experience, without fabricated statistics.</p></header><label>Years in Business<input type="number" min="0" max="150" step="1" value={form.yearsInBusiness} onChange={(event) => update('yearsInBusiness', event.target.value)} /></label></section>
        <section className="seller-profile-editor-card"><header><div><span>03</span><h2>Location &amp; Contact</h2></div><p>Only these business contact details are public.</p></header><div className="seller-profile-field-grid"><label><span><MapPin size={15} /> Office Location</span><input maxLength={200} value={form.publicOfficeLocation} onChange={(event) => update('publicOfficeLocation', event.target.value)} placeholder="Chakan, Pune" /></label><label><span><Phone size={15} /> Public Phone</span><input maxLength={30} type="tel" value={form.publicPhone} onChange={(event) => update('publicPhone', event.target.value)} placeholder="+91 98765 43210" /></label></div><label>Website<input maxLength={1000} type="url" value={form.publicWebsite} onChange={(event) => update('publicWebsite', event.target.value)} placeholder="https://yourcompany.com" /></label></section>
        <section className="seller-profile-editor-card seller-profile-visibility"><div><strong>Profile Visibility</strong><p>Make your developer profile visible on Zinoo.</p></div><label className="seller-profile-switch"><input type="checkbox" checked={form.developerProfileVisible} onChange={(event) => update('developerProfileVisible', event.target.checked)} /><span><i /></span><b>{form.developerProfileVisible ? 'Visible to buyers' : 'Hidden from buyers'}</b></label></section>
        <footer className="seller-developer-profile-actions"><button type="button" onClick={onBack}><RotateCcw size={16} /> Cancel</button><button type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}</button></footer>
      </div>
      <aside className="seller-profile-sections"><span>Developer Profile Sections</span>{sections.map(([Icon, title, detail], index) => <div key={title}><b>{index + 1}</b><Icon size={18} /><span><strong>{title}</strong><small>{detail}</small></span></div>)}<p>Reviews are not shown because Zinoo does not currently have a reliable developer-review relationship.</p></aside>
    </form>}
  </section>;
}
