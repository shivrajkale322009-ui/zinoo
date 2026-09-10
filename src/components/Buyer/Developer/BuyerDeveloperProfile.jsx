import { useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Building2, ExternalLink, Globe2, MapPin, Phone, Route } from 'lucide-react';
import PropertyCard from '../../PropertyCard';
import { getPropertyDisplayModel } from '../../../utils/propertyDisplayModel';

export default function BuyerDeveloperProfile({ profile, projects = [], loading, error, fallbackName, onBack, onProjectSelect, onDeveloperSelect, onViewProjectsOnMap, previewMode = false }) {
  const [tab, setTab] = useState('projects');
  const name = profile?.name || fallbackName || 'Developer';
  const officeMapUrl = profile?.officeLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.officeLocation)}` : '';
  const phoneHref = profile?.publicPhone ? `tel:${String(profile.publicPhone).replace(/[^\d+]/g, '')}` : '';
  const cover = useMemo(() => {
    for (const project of projects) {
      const display = getPropertyDisplayModel(project);
      if (display.media?.heroImage) return display.media.heroImage;
    }
    return '';
  }, [projects]);
  const completedCount = Number(profile?.completedProjects) || 0;
  const tabs = ['projects', ...(completedCount > 0 ? ['completed'] : []), 'about'];

  return <main className="buyer-primary-screen buyer-developer-profile-screen" aria-label={`${name} developer profile`}>
    <div className="buyer-developer-profile-inner">
      <header className="buyer-developer-profile-bar"><button type="button" onClick={onBack} aria-label={previewMode ? 'Back to editor' : 'Back to properties'}><ArrowLeft size={21} /></button><strong>{previewMode ? 'Buyer Preview' : 'Developer Profile'}</strong><span /></header>
      {loading ? <div className="buyer-profile-skeleton" aria-hidden="true"><i /><div><span /><span /><span /></div></div> : error ? <div className="buyer-developer-profile-state"><Building2 size={28} /><p>{error}</p></div> : <>
        <section className={`buyer-developer-profile-cover${cover ? ' has-image' : ''}`} style={cover ? { backgroundImage: `linear-gradient(180deg, rgba(17,24,39,.04), rgba(17,24,39,.38)), url(${cover})` } : undefined}><span>{cover ? 'Project portfolio' : 'Zinoo Developer'}</span></section>
        <section className="buyer-developer-profile-hero">
          <div className="buyer-developer-profile-logo">{profile?.logo ? <img src={profile.logo} alt={`${name} logo`} /> : <Building2 size={42} />}</div>
          <div className="buyer-developer-profile-identity"><div className="buyer-developer-name-line"><h1>{name}</h1>{profile?.verified && <strong title="Verified by Zinoo"><BadgeCheck size={21} /> <span>Verified</span></strong>}</div><p>{profile?.description || 'Business information has not been added yet.'}</p><div className="buyer-developer-meta">{profile?.officeLocation && <span><MapPin size={15} /> {profile.officeLocation}</span>}{profile?.publicWebsite && <a href={profile.publicWebsite} target="_blank" rel="noreferrer"><Globe2 size={15} /> Website <ExternalLink size={12} /></a>}</div></div>
          <div className="buyer-developer-profile-actions">{phoneHref && <a className="primary" href={phoneHref}><Phone size={17} /> Contact</a>}{officeMapUrl && <a href={officeMapUrl} target="_blank" rel="noreferrer"><MapPin size={17} /> View on Map</a>}<button type="button" onClick={onViewProjectsOnMap}><Route size={17} /> View All Projects on Map</button></div>
        </section>
        <section className="buyer-developer-profile-stats" aria-label="Developer statistics"><div><strong>{projects.length}</strong><span>Projects</span></div><div><strong>{profile?.yearsInBusiness ?? '—'}</strong><span>Years in Business</span></div><div><strong>{completedCount}</strong><span>Completed</span></div></section>
        <nav className="buyer-developer-profile-tabs" aria-label="Developer profile sections">{tabs.map((item) => <button type="button" key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
        {tab === 'projects' && <section className="buyer-developer-projects"><header><div><span>Project Portfolio</span><h2>Active Projects by {name}</h2></div><strong>{projects.length} project{projects.length === 1 ? '' : 's'}</strong></header>{projects.length ? <div className="feed-listings-grid buyer-developer-project-grid">{projects.map((project) => <PropertyCard key={project.id} project={project} display={getPropertyDisplayModel(project)} onViewDetails={onProjectSelect} onDeveloperSelect={onDeveloperSelect} />)}</div> : <div className="buyer-developer-profile-state compact"><Building2 size={28} /><p>No active projects yet.</p></div>}</section>}
        {tab === 'completed' && completedCount > 0 && <section className="buyer-developer-about-card"><span>Completed Projects</span><h2>{completedCount} delivered project{completedCount === 1 ? '' : 's'}</h2><p>Zinoo currently publishes the verified completed-project count. Completed project cards are not exposed by the existing public project read model.</p></section>}
        {tab === 'about' && <section className="buyer-developer-about-card"><span>About</span><h2>About {name}</h2><p>{profile?.description || 'This developer has not added a business story yet.'}</p>{profile?.officeLocation && <div><MapPin size={17} /><span><strong>Office</strong><small>{profile.officeLocation}</small></span></div>}{profile?.publicPhone && <div><Phone size={17} /><span><strong>Public contact</strong><small>{profile.publicPhone}</small></span></div>}{profile?.publicWebsite && <div><Globe2 size={17} /><span><strong>Website</strong><small>{profile.publicWebsite}</small></span></div>}</section>}
      </>}
    </div>
  </main>;
}
