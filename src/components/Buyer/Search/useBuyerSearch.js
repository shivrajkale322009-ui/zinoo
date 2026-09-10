import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAKAN_MAP_POSITION } from '../../../utils/chakanLocation';

const loadGoogleMapsOnIntent = async () => {
  const { loadGoogleMaps } = await import('../../../maps/googleMaps');
  return loadGoogleMaps();
};

export default function useBuyerSearch({
  filteredProjects,
  onProjectSelect,
  onLocationSelected,
  onVoiceResult
}) {
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [placeSearchError, setPlaceSearchError] = useState('');
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const placesSessionTokenRef = useRef(null);

  const searchableProjects = useMemo(() => {
    const query = homeSearchQuery.trim().toLowerCase();
    if (!query) return [];
    return filteredProjects
      .filter((project) => {
        const haystack = [project.name, project.village, project.taluka, project.developer]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [filteredProjects, homeSearchQuery]);

  useEffect(() => {
    const queryText = homeSearchQuery.trim();
    if (queryText.length < 2) {
      setPlaceSuggestions([]);
      setPlaceSearchError('');
      return undefined;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        await loadGoogleMapsOnIntent();
        const { AutocompleteSessionToken, AutocompleteSuggestion } = await window.google.maps.importLibrary('places');
        if (!placesSessionTokenRef.current) placesSessionTokenRef.current = new AutocompleteSessionToken();
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: queryText,
          includedRegionCodes: ['in'],
          locationBias: { center: CHAKAN_MAP_POSITION, radius: 60000 },
          sessionToken: placesSessionTokenRef.current
        });
        if (!cancelled) {
          setPlaceSuggestions(response.suggestions.filter((suggestion) => suggestion.placePrediction).slice(0, 5));
          setPlaceSearchError('');
        }
      } catch (error) {
        const apiBlocked = String(error?.message || error).includes('blocked');
        if (!apiBlocked) console.error('[Zinoo Places] Autocomplete failed:', error);
        if (!cancelled) {
          setPlaceSuggestions([]);
          setPlaceSearchError(apiBlocked
            ? 'Location autocomplete needs Places API (New) enabled for Zinoo.'
            : 'Location suggestions are temporarily unavailable.');
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [homeSearchQuery]);

  const selectPlaceSuggestion = async (suggestion) => {
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'viewport'] });
      if (!place.location) return;
      setHomeSearchQuery(place.displayName || place.formattedAddress || 'Selected location');
      setPlaceSuggestions([]);
      placesSessionTokenRef.current = null;
      window.dispatchEvent(new CustomEvent('flinok-focus-location', {
        detail: {
          location: place.location.toJSON(),
          viewport: place.viewport?.toJSON?.() || null
        }
      }));
      onLocationSelected();
    } catch (error) {
      console.error('[Zinoo Places] Place selection failed:', error);
      setPlaceSearchError('Unable to open that location. Please try again.');
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPlaceSearchError('Voice search is not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceSearchActive(true);
    recognition.onend = () => setVoiceSearchActive(false);
    recognition.onerror = () => {
      setVoiceSearchActive(false);
      setPlaceSearchError('Voice search could not hear you. Please try again.');
    };
    recognition.onresult = (event) => {
      setHomeSearchQuery(event.results[0][0].transcript);
      onVoiceResult();
    };
    recognition.start();
  };

  const searchEnteredLocation = async (event) => {
    if (event.key !== 'Enter' || !homeSearchQuery.trim()) return;
    event.preventDefault();
    if (searchableProjects.length > 0) {
      onProjectSelect(searchableProjects[0]);
      setPlaceSuggestions([]);
      return;
    }
    try {
      await loadGoogleMapsOnIntent();
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ address: homeSearchQuery.trim(), region: 'IN' });
      const result = response.results?.[0];
      if (!result?.geometry?.location) throw new Error('No matching location found.');
      window.dispatchEvent(new CustomEvent('flinok-focus-location', {
        detail: {
          location: result.geometry.location.toJSON(),
          viewport: result.geometry.viewport?.toJSON?.() || null
        }
      }));
      onLocationSelected();
      setPlaceSuggestions([]);
      setPlaceSearchError('');
    } catch {
      setPlaceSearchError('No matching project or location was found.');
    }
  };

  return {
    homeSearchQuery,
    setHomeSearchQuery,
    placeSuggestions,
    setPlaceSuggestions,
    placeSearchError,
    voiceSearchActive,
    searchableProjects,
    selectPlaceSuggestion,
    startVoiceSearch,
    searchEnteredLocation
  };
}
