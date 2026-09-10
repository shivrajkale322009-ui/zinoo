import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Banknote, Gift, SlidersHorizontal } from 'lucide-react';
import MapScreen from '../maps/MapScreen';
import PropertyPreviewCard from './PropertyPreviewCard';
import SearchBar from './ui/SearchBar';
import { getProjectPublicPath } from '../utils/projectPublicUrl';

const FILTERS = [
  { id: 'verified', label: 'Verified', icon: BadgeCheck },
  { id: 'loan', label: 'Loan Available', icon: Banknote },
  { id: 'cashback', label: 'Cashback', icon: Gift },
  { id: 'budget', label: 'Below ₹15L', icon: SlidersHorizontal }
];

export default function PublicProjectMap({ projects: publicProjects = [], onOpenFullMap, onPropertyAction }) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = useMemo(() => publicProjects.filter((project) => {
    if (query && !`${project.name} ${project.locationLabel}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (activeFilters.has('verified') && !project.verified) return false;
    if (activeFilters.has('loan') && !project.bankLoan) return false;
    if (activeFilters.has('cashback') && !project.cashbackAmount) return false;
    if (activeFilters.has('budget') && project.startingPrice > 1500000) return false;
    return true;
  }), [activeFilters, publicProjects, query]);

  const toggleFilter = (filter) => {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  return (
    <section className="public-section public-live-map" aria-labelledby="public-live-map-title">
      <header>
        <div><span>Explore visually</span><h2 id="public-live-map-title">Explore Projects on the Map</h2><p>See verified plot projects around Chakan before visiting.</p></div>
        <button type="button" onClick={onOpenFullMap}>Open Full Map <ArrowRight /></button>
      </header>
      <div className="public-live-map-shell">
        <MapScreen
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          showProjectPopup={false}
          loadVisibleProjects={false}
        />
        <div className="public-map-search"><SearchBar value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="public-map-filters">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={activeFilters.has(id) ? 'active' : ''} onClick={() => toggleFilter(id)}><Icon /> {label}</button>
          ))}
        </div>
        {selectedProject && (
          <div className="public-map-preview">
            <button type="button" className="public-map-preview-close" onClick={() => setSelectedProject(null)} aria-label="Close property preview">×</button>
            <PropertyPreviewCard
              propertyId={selectedProject.id}
              projectHref={getProjectPublicPath(selectedProject)}
              image={selectedProject.thumbnail}
              projectName={selectedProject.name}
              location={selectedProject.locationLabel}
              startingPrice={selectedProject.startingPrice}
              cashback={selectedProject.cashbackAmount}
              showNameBadge={selectedProject.showVerifiedNameBadge}
              photoCount={selectedProject.images.length}
              onCall={() => onPropertyAction(selectedProject, 'Call Seller')}
              onWhatsApp={() => onPropertyAction(selectedProject, 'WhatsApp Seller')}
            />
          </div>
        )}
        <button type="button" className="public-map-cta" onClick={onOpenFullMap}>Explore All Projects on Map <ArrowRight /></button>
      </div>
    </section>
  );
}
