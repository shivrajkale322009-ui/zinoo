import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  Heart,
  IndianRupee,
  Instagram,
  Landmark,
  Linkedin,
  MapPin,
  Search,
  ShieldCheck
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getProjectPublicPath } from '../utils/projectPublicUrl';
import LeadCaptureModal from './LeadCaptureModal';
import PropertyPreviewCard from './PropertyPreviewCard';
import PublicProjectMap from './PublicProjectMap';

const DEVELOPERS = [
  ['MD', 'Matoshri Developers', 8],
  ['SP', 'Shantai Properties', 6],
  ['JG', 'Jay Ganesh Group', 5],
  ['DP', 'Zinoo Partners', 12]
];

export default function PublicLandingPage({ onSignIn, onLeadCapture }) {
  const [leadIntent, setLeadIntent] = useState(null);
  const [projects, setProjects] = useState([]);
  const closeLeadCapture = useCallback(() => setLeadIntent(null), []);
  const requestPropertyAction = (project, action = 'View Property Details') => {
    setLeadIntent({ project: project.name, projectId: project.id || '', projectOwnerId: project.ownerId || '', action });
  };
  const submitSearch = (event) => {
    event.preventDefault();
    onSignIn();
  };
  useEffect(() => {
    let active = true;
    getDocs(query(collection(db, 'publicProjects'), where('status', '==', 'active'), orderBy('slug'), limit(12)))
      .then((snapshot) => snapshot.docs.map((document) => document.data()))
      .then((records) => { if (active) setProjects(records.map((project) => ({
        ...project,
        id: project.projectId,
        name: project.projectName,
        locationLabel: project.location,
        thumbnail: project.primaryImage,
        heroImage: project.primaryImage,
        images: [project.primaryImage, ...(project.galleryImages || [])].filter(Boolean),
        cashbackAmount: project.cashbackAmount || 0,
        verified: true
      }))); })
      .catch((error) => console.error('[Zinoo Public Projects] Load failed.', error));
    return () => { active = false; };
  }, []);

  return (
    <div className="public-landing">
      <header className="public-landing-nav">
        <a className="public-brand" href="#top" aria-label="Zinoo home">
          <img src="/brand/zinoo-logo.png" alt="Zinoo" />
        </a>
        <nav aria-label="Landing navigation">
          <a href="#projects">Projects</a>
          <a href="#developers">Developers</a>
          <a href="#why-zinoo">Why Zinoo</a>
          <a href="#resources">Resources</a>
        </nav>
        <div className="public-nav-actions">
          <button type="button" className="public-saved" onClick={onSignIn}><Heart /> Saved</button>
          <button type="button" className="public-sign-in" onClick={onSignIn}>Sign In <ArrowRight /></button>
        </div>
      </header>

      <main id="top">
        <section className="public-hero">
          <div className="public-hero-copy">
            <span className="public-eyebrow"><ShieldCheck /> Buyer-first plot discovery</span>
            <h1>Find Verified Plot Projects Around <em>Chakan</em></h1>
            <p>India&apos;s first buyer-first marketplace for verified plot projects.</p>
            <form className="public-hero-search" onSubmit={submitSearch}>
              <Search aria-hidden="true" />
              <input aria-label="Search projects, layouts or locations" placeholder="Search projects, layouts or locations..." />
              <button type="submit">Search <ArrowRight /></button>
            </form>
            <div className="public-trust-chips" id="why-zinoo" aria-label="Zinoo benefits">
              <span><Check /> GPS Verified</span>
              <span><Landmark /> Bank Loan Available</span>
              <span><IndianRupee /> Cashback</span>
            </div>
          </div>
          <div className="public-hero-visual">
            <img src="/zinoo-landing-township.png" alt="Luxury plotted township entrance with wide roads and landscaping at golden hour" />
            <div className="public-image-note"><BadgeCheck /><span><strong>Verified by Zinoo</strong>Location and project checks complete</span></div>
          </div>
        </section>

        <section className="public-section public-projects" id="projects">
          <header>
            <div><span>Curated for buyers</span><h2>Premium Plot Projects Near Chakan</h2><p>Handpicked &amp; verified projects.</p></div>
            <a className="public-projects-link" href="/projects">View All Projects <ArrowRight /></a>
          </header>
          <div className="public-project-grid">
            {projects.slice(0, 6).map((project) => (
              <PropertyPreviewCard
                key={project.name}
                propertyId={project.name}
                image={project.primaryImage}
                projectName={project.projectName}
                location={project.location}
                startingPrice={project.startingPrice}
                cashback={project.cashbackAmount || 0}
                projectHref={getProjectPublicPath(project)}
                showNameBadge={project.showVerifiedNameBadge}
                photoCount={12}
                callNumber=""
                whatsappNumber=""
                onCall={() => requestPropertyAction(project, 'Call Seller')}
                onWhatsApp={() => requestPropertyAction(project, 'WhatsApp Seller')}
              />
            ))}
          </div>
        </section>

        <section className="public-section public-developers" id="developers">
          <header>
            <div><span>Built on credibility</span><h2>Top Developers</h2><p>Trusted builders. Transparent deals.</p></div>
          </header>
          <div className="public-developer-row">
            {DEVELOPERS.map(([initials, name, activeProjects]) => (
              <button type="button" key={name} onClick={onSignIn}>
                <span>{initials}</span>
                <div>
                  <strong>{name}</strong>
                  <small><BadgeCheck /> Verified Developer</small>
                  <em>{activeProjects} Active Projects</em>
                  <b>View Projects <ArrowRight /></b>
                </div>
              </button>
            ))}
          </div>
        </section>

        <PublicProjectMap
          projects={projects}
          onOpenFullMap={onSignIn}
          onPropertyAction={(project, action) => requestPropertyAction(project, action)}
        />

        <section className="public-cta" id="resources">
          <div><span>Find your match</span><h2>Still looking for the right plot?</h2><p>Explore verified projects with transparent pricing, legal status, and cashback.</p></div>
          <button type="button" onClick={onSignIn}>Explore All Projects <ArrowRight /></button>
        </section>
      </main>

      <footer className="public-footer">
        <div className="public-footer-brand"><span><MapPin /></span><div><strong>Zinoo</strong><p>Buyer-first. Plot-focused. Verified.</p></div></div>
        <div><strong>Company</strong><a href="#why-zinoo">Why Zinoo</a><a href="#developers">Developers</a><a href="#projects">Projects</a></div>
        <div><strong>Legal</strong><a href="/privacy-policy.html">Privacy</a><a href="/terms-and-conditions">Terms</a><a href="/refund-policy">Refunds</a></div>
        <div><strong>Support</strong><button type="button" onClick={onSignIn}>Customer Support</button><button type="button" onClick={onSignIn}>Buyer Resources</button></div>
        <div className="public-social"><strong>Follow Zinoo</strong><span><a href="#" aria-label="Instagram"><Instagram /></a><a href="#" aria-label="LinkedIn"><Linkedin /></a><a href="#" aria-label="Zinoo"><Building2 /></a></span></div>
        <p className="public-copyright">© {new Date().getFullYear()} Zinoo. All rights reserved.</p>
      </footer>
      {leadIntent && <LeadCaptureModal intent={leadIntent} onClose={closeLeadCapture} onContinue={onLeadCapture} />}
    </div>
  );
}
