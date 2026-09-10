import { BadgeCheck, Building2, MapPin } from 'lucide-react';
import { getDisplayLocation } from '../buyerPresentation';
import { getProjectPublicPath } from '../../../utils/projectPublicUrl';

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
        <a key={`project-${project.id}`} href={getProjectPublicPath(project) || '#'} onClick={(event) => { event.preventDefault(); onProjectSelect(project); }}>
          <Building2 size={18} /><span><strong>{project.name}{project.showVerifiedNameBadge && <BadgeCheck className="property-name-verified-badge" aria-label="Verified property" />}</strong><small>{getDisplayLocation(project) || 'Zinoo active project'}</small></span>
        </a>
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
