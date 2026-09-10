import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import SearchBar from '../../ui/SearchBar';
import BuyerSearchSuggestions from './BuyerSearchSuggestions';
import BuyerSearchDiscovery from './BuyerSearchDiscovery';

const RECENT_SEARCHES_KEY = 'zinoo.recent-searches';

function readRecentSearches() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

export default function BuyerSearchHeader({
  homeSearchQuery,
  voiceSearchActive,
  searchableProjects,
  placeSuggestions,
  placeSearchError,
  onQueryChange,
  onSearchKeyDown,
  onActivateMap,
  onClearSearch,
  onStartVoiceSearch,
  onProjectSelect,
  onPlaceSelect,
  showSearchOverlays = true
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(readRecentSearches);

  useEffect(() => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const rememberSearch = (query) => {
    const normalized = query.trim();
    if (!normalized) return;
    setRecentSearches((current) => [
      normalized,
      ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
    ].slice(0, 6));
  };

  const chooseDiscoverySearch = (query) => {
    rememberSearch(query);
    onQueryChange({ target: { value: query } });
  };

  return (
    <div
      className="buyer-workspace-search-shell"
      onFocusCapture={() => { setSearchFocused(true); onActivateMap?.(); }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setSearchFocused(false);
      }}
    >
      <SearchBar
        className="buyer-workspace-search"
        leadingIcon={(
          <img
            src="/brand/zinoo-logo.png"
            alt=""
            width="24"
            height="24"
            style={{ display: 'block', width: 24, height: 24, maxWidth: 24, objectFit: 'contain' }}
          />
        )}
        value={homeSearchQuery}
        onChange={onQueryChange}
        onKeyDown={(event) => {
            if (event.key === 'Enter') rememberSearch(homeSearchQuery);
            onSearchKeyDown(event);
        }}
        ariaLabel="Search projects, layouts or locations"
        trailingWidget={homeSearchQuery ? (
          <button type="button" className="buyer-search-clear" onClick={onClearSearch} aria-label="Clear search">
            <X size={16} />
          </button>
        ) : null}
      />
      {showSearchOverlays && searchFocused && !homeSearchQuery.trim() && (
        <BuyerSearchDiscovery
          recentSearches={recentSearches}
          onSearch={chooseDiscoverySearch}
          onRemoveRecent={(query) => setRecentSearches((current) => current.filter((item) => item !== query))}
          onClearRecent={() => setRecentSearches([])}
        />
      )}
      {showSearchOverlays && (homeSearchQuery.trim().length >= 2) && (
        <BuyerSearchSuggestions
          searchableProjects={searchableProjects}
          placeSuggestions={placeSuggestions}
          placeSearchError={placeSearchError}
          onProjectSelect={(project) => {
            rememberSearch(project.name || homeSearchQuery);
            onProjectSelect(project);
          }}
          onPlaceSelect={(place) => {
            rememberSearch(place.placePrediction?.mainText?.toString() || homeSearchQuery);
            onPlaceSelect(place);
          }}
        />
      )}
    </div>
  );
}
