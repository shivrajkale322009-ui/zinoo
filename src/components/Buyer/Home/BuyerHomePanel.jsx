import { ChevronRight, Compass, Gift } from 'lucide-react';
import PropertyCard from '../../PropertyCard';
import { getPropertyDisplayModel } from '../../../utils/propertyDisplayModel';
import { formatINR } from '../buyerPresentation';
import BuyerFilters from './BuyerFilters';
import TopDevelopersSection from './TopDevelopersSection';

export default function BuyerHomePanel({
  filtersOpen,
  activeFilterCount,
  filteredProjects,
  mapFilters,
  landZoneOptions,
  naStatusOptions,
  homeSearchQuery,
  searchableProjects,
  savedProjectIds,
  onToggleFilters,
  onCloseFilters,
  onBudgetChange,
  onLandZoneToggle,
  onNaStatusToggle,
  onInstallmentToggle,
  onResetFilters,
  onProjectSelect,
  onDeveloperSelect,
  onFavouriteToggle,
  onShare,
  onOpenCashback,
  projectsLoading = false
}) {
  return (
    <div className="buyer-side-panel-content">
      <BuyerFilters
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        filteredProjectCount={filteredProjects.length}
        mapFilters={mapFilters}
        landZoneOptions={landZoneOptions}
        naStatusOptions={naStatusOptions}
        onToggleFilters={onToggleFilters}
        onCloseFilters={onCloseFilters}
        onBudgetChange={onBudgetChange}
        onLandZoneToggle={onLandZoneToggle}
        onNaStatusToggle={onNaStatusToggle}
        onInstallmentToggle={onInstallmentToggle}
        onResetFilters={onResetFilters}
      />

      {homeSearchQuery && (
        <div className="buyer-panel-section">
          <div className="buyer-panel-section-head buyer-project-section-head">
            <h4>Search Results</h4>
            <span>{searchableProjects.length}</span>
          </div>
          {searchableProjects.length === 0 ? (
            <p className="buyer-empty-copy">No matching projects found.</p>
          ) : (
            <div className="buyer-search-results property-preview-results">
              {searchableProjects.map((project) => (
                <PropertyCard key={project.id} project={project} display={getPropertyDisplayModel(project)} onViewDetails={onProjectSelect} onDeveloperSelect={onDeveloperSelect} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="buyer-panel-section buyer-featured-projects-section">
        <button type="button" className="buyer-home-cashback-banner" onClick={onOpenCashback} aria-label="Open Cashback — Book through Zinoo and get rewarded">
          <img src="/home-cashback-banner.png" alt="Cashback on Your Plot — Book through Zinoo and get rewarded. Explore Plots" width="2225" height="707" />
        </button>
        {projectsLoading ? (
          <div className="buyer-project-skeleton-grid" aria-hidden="true">
            {[0, 1, 2, 3].map((item) => <article key={item}><div /><span /><span /><b /></article>)}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="feed-empty-state slim">
            <Compass size={24} color="var(--text-muted)" />
            <p>No active projects match these filters.</p>
          </div>
        ) : (
          <div className="feed-listings-grid buyer-panel-list">
            {filteredProjects.slice(0, 6).map((project) => {
              const display = getPropertyDisplayModel(project);

              return (
                <PropertyCard
                  key={project.id}
                  variant="home-featured"
                  project={project}
                  display={display}
                  formatPrice={formatINR}
                  isFavourite={savedProjectIds.has(project.id)}
                  onFavouriteToggle={onFavouriteToggle}
                  onShare={onShare}
                  onViewDetails={onProjectSelect}
                  onDeveloperSelect={onDeveloperSelect}
                />
              );
            })}
          </div>
        )}
      </div>
      <TopDevelopersSection onViewDeveloper={(developer) => onDeveloperSelect?.({ sellerId: developer.sellerId, developerName: developer.sellerName })} />
      <aside className="buyer-cashback-promo" aria-label="Cashback offer">
        <Gift />
        <div><small>Earn While You Buy</small><strong>Get 1% Cashback</strong><span>On every verified booking</span></div>
        <button type="button">Know More <ChevronRight /></button>
      </aside>
    </div>
  );
}

