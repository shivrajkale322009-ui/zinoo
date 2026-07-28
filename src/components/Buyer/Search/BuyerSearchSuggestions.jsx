import { Building2, MapPin } from 'lucide-react';
import { getDisplayLocation } from '../buyerPresentation';

export default function BuyerSearchSuggestions({
  searchableProjects,
  placeSuggestions,
  placeSearchError,
  onProjectSelect,
  onPlaceSelect
}) {
  return (
    <div className="buyer-map-search-results" role="listbox" aria-label="Search suggestions">
      {searchableProjects.map((project) => (
        <button key={`project-${project.id}`} type="button" onClick={() => onProjectSelect(project)}>
          <Building2 size={18} /><span><strong>{project.name}</strong><small>{getDisplayLocation(project) || 'Druvio active project'}</small></span>
        </button>
      ))}
      {placeSuggestions.map((suggestion) => (
        <button key={suggestion.placePrediction.placeId} type="button" onClick={() => onPlaceSelect(suggestion)}>
          <MapPin size={18} /><span><strong>{suggestion.placePrediction.mainText?.toString() || suggestion.placePrediction.text.toString()}</strong><small>{suggestion.placePrediction.secondaryText?.toString() || 'Location'}</small></span>
        </button>
      ))}
      {placeSearchError && <p>{placeSearchError}</p>}
      {!placeSearchError && searchableProjects.length === 0 && placeSuggestions.length === 0 && <p>Searching locations…</p>}
    </div>
  );
}
