import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Clock3, Hammer } from 'lucide-react';
import { functions } from '../../../firebaseConfig';
import { readStartupCache, scheduleIdleWork, writeStartupCache } from '../../../utils/startupCache';

export default function TopDevelopersSection({ onViewDeveloper }) {
  const [developers, setDevelopers] = useState(() => readStartupCache('featured-developers', []));

  useEffect(() => {
    let active = true;
    const cancelIdle = scheduleIdleWork(() => {
      httpsCallable(functions, 'listFeaturedDevelopers')().then((result) => {
        if (!active) return;
        const nextDevelopers = result.data.developers || [];
        setDevelopers(nextDevelopers);
        writeStartupCache('featured-developers', nextDevelopers);
      }).catch((error) => console.error('[Zinoo Developers] Load failed.', error));
    }, 1800);
    return () => { active = false; cancelIdle(); };
  }, []);

  if (!developers.length) return null;

  return (
    <section className="buyer-top-developers" aria-labelledby="top-developers-title">
      <header className="buyer-top-developers-head">
        <div><h4 id="top-developers-title">Top Developers in Chakan</h4><p>Trusted plotting developers building premium communities around Chakan.</p></div>
        <button type="button" onClick={() => document.querySelector('.buyer-developer-rail')?.scrollTo({ left: 0, behavior: 'smooth' })}>View All <ArrowRight size={15} /></button>
      </header>
      <div className="buyer-developer-rail">
        {developers.map((developer) => (
          <article className="buyer-developer-card" key={developer.id}>
            <div className="buyer-developer-identity">
              <div className="buyer-developer-logo">{developer.logo ? <img src={developer.logo} alt={`${developer.developerName} logo`} /> : <Building2 />}</div>
              <div><h5>{developer.sellerName}</h5><span>{developer.experienceYears} Years Experience</span>{developer.verified && <small><BadgeCheck size={13} /> Verified Developer</small>}</div>
            </div>
            <div className="buyer-developer-total"><span>Total Projects</span><strong>{developer.completedProjects + developer.activeProjects + developer.upcomingProjects}</strong></div>
            <div className="buyer-developer-stats">
              <div className="completed"><CheckCircle2 /><strong>{developer.completedProjects}</strong><span>Completed</span></div>
              <div className="active"><Hammer /><strong>{developer.activeProjects}</strong><span>Active</span></div>
              <div className="upcoming"><Clock3 /><strong>{developer.upcomingProjects}</strong><span>Upcoming</span></div>
            </div>
            <button type="button" className="buyer-developer-action" onClick={() => onViewDeveloper?.(developer)}>View Projects <ArrowRight size={15} /></button>
          </article>
        ))}
      </div>
    </section>
  );
}
