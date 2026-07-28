import { MapPin, Mic, X } from 'lucide-react';
import BuyerSearchSuggestions from './BuyerSearchSuggestions';

export default function BuyerSearchHeader({
  homeSearchQuery,
  voiceSearchActive,
  searchableProjects,
  placeSuggestions,
  placeSearchError,
  onQueryChange,
  onSearchKeyDown,
  onClearSearch,
  onStartVoiceSearch,
  onProjectSelect,
  onPlaceSelect
}) {
  return (
    <div className="buyer-workspace-search-shell">
      <label className="buyer-workspace-search">
        <span className="buyer-search-brand" aria-hidden="true"><MapPin size={19} /></span>
        <input
          type="search"
          placeholder="Search projects"
          value={homeSearchQuery}
          onChange={onQueryChange}
          onKeyDown={onSearchKeyDown}
          aria-label="Search plot projects"
        />
        {homeSearchQuery && (
          <button type="button" className="buyer-search-clear" onClick={onClearSearch} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
        <button type="button" className={`buyer-search-tool ${voiceSearchActive ? 'active' : ''}`} onClick={onStartVoiceSearch} aria-label="Search by voice" title="Search by voice">
          <Mic size={18} />
        </button>
      </label>
      {(homeSearchQuery.trim().length >= 2) && (
        <BuyerSearchSuggestions
          searchableProjects={searchableProjects}
          placeSuggestions={placeSuggestions}
          placeSearchError={placeSearchError}
          onProjectSelect={onProjectSelect}
          onPlaceSelect={onPlaceSelect}
        />
      )}
    </div>
  );
}
