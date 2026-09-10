import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Undo2, Redo2, Check, X, ShieldAlert,
  MapPin, Eye, Share2, Trash2,
  Layers, CheckSquare, Square, Maximize2, Minimize2,
  Building2, Map as MapIcon, Satellite
} from 'lucide-react';
import { loadGoogleMaps } from './googleMaps';
import { getGoogleMapsErrorMessage, googleMapsConfig, googleMapsMissingMessage } from './googleMapsConfig';
import { getProjectCoordinates, isProjectPublishable } from '../utils/projectVisibility';
import { matchesProjectFilters } from '../utils/projectLand';
import {
  createProjectLayout,
  saveProjectLayout,
  updateProjectBoundary,
  loadProjectsInBounds
} from './projectMapService';
import { buildProjectGeometry, normalizeProjectPolygon } from '../utils/projectGeometry';
import { CHAKAN_MAP_POSITION } from '../utils/chakanLocation';
import { calculateMarkerPriority, getProjectMarkerState, MAP_MARKER_ZOOM, MARKER_COLLISION_PIXELS } from './mapZoom';
import { createProjectPopupElement } from './projectPopupOverlay';
import ZoomBadge from '../components/ZoomBadge';
import './mapScreen.css';

const DEFAULT_CENTER = CHAKAN_MAP_POSITION;
const DEFAULT_ZOOM = 12;
const PROJECT_FOCUS_DURATION = 600;
const DEFAULT_FILTERS = Object.freeze({ budgetMax: 3000000, naPlot: false, bankLoan: false, minScore: 0 });
const pointFor = (project) => getProjectCoordinates(project);

const priceLabel = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on request';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1).replace('.0', '')}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1).replace('.0', '')}L`;
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
};

function markerContent(project, state) {
  const marker = document.createElement('div');
  const markerKinds = [
    project.verified !== false && 'zinoo-project-marker-verified',
    Number(project.cashbackAmount || project.cashbackPerGuntha) > 0 && 'zinoo-project-marker-cashback',
    project.premium === true && 'zinoo-project-marker-premium'
  ].filter(Boolean).join(' ');
  marker.className = `zinoo-project-marker zinoo-project-marker-${state.mode}${state.selectedStyle ? ' zinoo-project-marker-selected' : ''} ${markerKinds}`;
  if (state.mode === 'full-label') {
    const price = document.createElement('strong');
    price.className = 'zinoo-project-marker-price';
    price.textContent = priceLabel(project.priceFrom || project.startingPrice);
    marker.append(price);
  } else if (state.mode === 'price-only') {
    marker.classList.add('zinoo-project-marker-price-only');
    marker.textContent = priceLabel(project.priceFrom || project.startingPrice);
  } else {
    marker.classList.add('zinoo-project-marker-pin');
    marker.innerHTML = `
      <svg class="zinoo-location-pin-icon" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
        <circle cx="9" cy="9" r="7.75" />
      </svg>`;
  }
  marker.setAttribute('role', 'button');
  marker.setAttribute('tabindex', '0');
  marker.setAttribute('aria-label', `${project.name || 'Project'}, starting at ${priceLabel(project.priceFrom || project.startingPrice)}`);
  const anchor = document.createElement('div');
  anchor.className = 'zinoo-project-marker-anchor';
  anchor.appendChild(marker);
  if (state.mode !== 'pin' && state.mode !== 'cluster') {
    const tail = document.createElement('i');
    tail.className = 'zinoo-project-marker-tail';
    tail.setAttribute('aria-hidden', 'true');
    anchor.appendChild(tail);
  }
  return anchor;
}

const toBoundaryPoint = (point, geoJsonOrder = false) => {
  if (Array.isArray(point) && point.length >= 2) {
    const first = Number(point[0]);
    const second = Number(point[1]);
    return geoJsonOrder ? { lat: second, lng: first } : { lat: first, lng: second };
  }
  const lat = Number(point?.lat ?? point?.latitude);
  const lng = Number(point?.lng ?? point?.longitude);
  return { lat, lng };
};

const normalizeBoundaryPath = (value) => {
  const geoJsonCoordinates = value?.type === 'Polygon' ? value.coordinates?.[0] : null;
  const source = geoJsonCoordinates || value;
  if (!Array.isArray(source)) return [];
  return source
    .map((point) => toBoundaryPoint(point, Boolean(geoJsonCoordinates)))
    .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
};

export default function MapScreen({
  projects = [],
  selectedProject = null,
  onSelectProject = null,
  onViewProjectDetails = null,
  showProjectPopup = true,
  activeLayout = null,
  onActiveLayoutChange = null,
  onVisibleProjectsChange = null,
  externalOverlayOpen = false,
  onLayersOpen = null,
  onMapReady = null,
  loadVisibleProjects = true,
  filters = DEFAULT_FILTERS
}) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const projectPopupRef = useRef(null);
  const polygonRef = useRef(null);
  const nearbyPolygonRefs = useRef([]);
  const handleBoundsIdleRef = useRef(null);
  const onMapReadyRef = useRef(onMapReady);
  const projectCountRef = useRef(projects.length);
  const lastVisibleBoundsKeyRef = useRef('');
  const visibleBoundsRequestRef = useRef(0);
  const focusAnimationFrameRef = useRef(null);
  const popupRevealTimerRef = useRef(null);
  const pendingPopupProjectIdRef = useRef(null);

  // Drawing overlays
  const draftLineRef = useRef(null);

  // States
  const [mapError, setMapError] = useState('');
  const [mapStatus, setMapStatus] = useState(googleMapsConfig.isConfigured ? 'loading' : 'configuration-missing');
  const [mapReady, setMapReady] = useState(false);
  const [mapType, setMapType] = useState('roadmap');
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [zoomTier, setZoomTier] = useState(Math.floor(DEFAULT_ZOOM));
  const [popupProjectId, setPopupProjectId] = useState(null);
  // Layer toggles
  const [showLayers, setShowLayers] = useState(false);
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    markers: true,
    layouts: true,
    roads: true,
    villageBoundaries: false
  });

  const selectProjectFromMarker = useCallback((project) => {
    if (popupRevealTimerRef.current) clearTimeout(popupRevealTimerRef.current);
    pendingPopupProjectIdRef.current = project.id;
    setPopupProjectId(null);
    onSelectProject?.(project);
    popupRevealTimerRef.current = window.setTimeout(() => {
      setPopupProjectId(project.id);
      pendingPopupProjectIdRef.current = null;
      popupRevealTimerRef.current = null;
    }, PROJECT_FOCUS_DURATION);
  }, [onSelectProject]);

  useEffect(() => () => {
    if (popupRevealTimerRef.current) clearTimeout(popupRevealTimerRef.current);
  }, []);

  const villageBoundaryRefs = useRef([]);
  const villageBoundaries = useMemo(() => projects.map((project) => {
    const boundarySource = project.villageBoundary
      || project.villageBoundaryCoordinates
      || project.boundaryCoordinates
      || project.location?.boundary;
    return {
      id: project.id,
      label: project.village || project.name || 'Village boundary',
      path: normalizeBoundaryPath(boundarySource)
    };
  }).filter((boundary) => boundary.path.length >= 3), [projects]);

  // Drawing state
  const [drawing, setDrawing] = useState(false);
  const [drawingFinished, setDrawingFinished] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [saving, setSaving] = useState(false);
  const [draftLayoutName, setDraftLayoutName] = useState('');

  // Undo/Redo stack for polygon edits
  const pathHistoryRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isUndoingRedoingRef = useRef(false);

  // Fetch only visible projects on idle bounds
  const handleBoundsIdle = useCallback(async () => {
    if (!loadVisibleProjects) return;
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const sw = bounds.getSouthWest().toJSON();
    const ne = bounds.getNorthEast().toJSON();
    const boundsKey = [sw.lat, sw.lng, ne.lat, ne.lng].map((value) => Number(value).toFixed(5)).join(':');
    if (boundsKey === lastVisibleBoundsKeyRef.current) return;
    lastVisibleBoundsKeyRef.current = boundsKey;
    const requestId = ++visibleBoundsRequestRef.current;

    try {
      const visible = await loadProjectsInBounds(sw, ne);
      if (requestId !== visibleBoundsRequestRef.current) return;

      // Apply Home-panel filters to visible projects.
      const finalVisible = visible.filter(p => {
        if (!isProjectPublishable(p)) return false;

        return matchesProjectFilters(p, filters);
      });

      if (onVisibleProjectsChange) {
        onVisibleProjectsChange(finalVisible);
      }
    } catch (err) {
      console.error('[Zinoo] Visible bounds load error:', err);
    }
  }, [filters, loadVisibleProjects, onVisibleProjectsChange]);
  handleBoundsIdleRef.current = handleBoundsIdle;
  onMapReadyRef.current = onMapReady;
  projectCountRef.current = projects.length;

  const markerStates = useMemo(() => {
    const map = mapRef.current;
    const states = new Map();
    if (!map || !mapReady) return states;
    const zoom = Number(zoomLevel) || 0;
    const projection = map.getProjection();
    if (!projection) return states;
    const center = map.getCenter();
    if (!center) return states;
    const scale = 2 ** zoom;
    const worldCenter = projection.fromLatLngToPoint(center);
    const mapSize = map.getDiv();
    const isMobileMap = mapSize.clientWidth < 768;
    const collisionWidth = isMobileMap ? MARKER_COLLISION_PIXELS.MOBILE_LABEL_WIDTH : MARKER_COLLISION_PIXELS.LABEL_WIDTH;
    const collisionHeight = isMobileMap ? MARKER_COLLISION_PIXELS.MOBILE_LABEL_HEIGHT : MARKER_COLLISION_PIXELS.LABEL_HEIGHT;
    const visible = projects
      .filter((project) => isProjectPublishable(project) && pointFor(project))
      .map((project) => {
        const position = pointFor(project);
        const world = projection.fromLatLngToPoint(new window.google.maps.LatLng(position));
        return {
          project,
          x: (world.x - worldCenter.x) * scale + mapSize.clientWidth / 2,
          y: (world.y - worldCenter.y) * scale + mapSize.clientHeight / 2,
          priority: calculateMarkerPriority(project, { isSelected: project.id === selectedProject?.id })
        };
      })
      .sort((left, right) => right.priority - left.priority || String(left.project.id).localeCompare(String(right.project.id)));
    const acceptedLabels = [];
    visible.forEach((entry) => {
      const collision = acceptedLabels.some((accepted) => Math.abs(accepted.x - entry.x) < collisionWidth && Math.abs(accepted.y - entry.y) < collisionHeight);
      const selected = entry.project.id === selectedProject?.id;
      const state = getProjectMarkerState({
        zoom,
        project: entry.project,
        selectedProjectId: selectedProject?.id,
        collisionGroup: collision && !selected,
        visibleRank: collision ? 1 : 0
      });
      states.set(entry.project.id, state);
      if (state.mode === 'full-label') acceptedLabels.push(entry);
    });
    return states;
  }, [projects, selectedProject?.id, mapReady, zoomLevel]);

  // Keep one Zinoo basemap and expose only useful discovery overlays.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Set Roads visibility
    const hideRoadsStyle = [
      { featureType: "road", elementType: "geometry", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] }
    ];
    map.setOptions({ styles: layerVisibility.roads ? [] : hideRoadsStyle });
  }, [layerVisibility.roads]);

  useEffect(() => {
    if (externalOverlayOpen || selectedProject) setShowLayers(false);
  }, [externalOverlayOpen, selectedProject]);

  // Render only verified boundary coordinates stored with project data.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    villageBoundaryRefs.current.forEach((polygon) => polygon.setMap(null));
    villageBoundaryRefs.current = [];
    if (!layerVisibility.villageBoundaries) return;

    villageBoundaryRefs.current = villageBoundaries.map((boundary) => {
      const polygon = new window.google.maps.Polygon({
        paths: boundary.path,
        map,
        strokeColor: '#059669',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.1,
        clickable: true,
        zIndex: 1
      });
      polygon.addListener('mouseover', () => polygon.setOptions({ fillOpacity: 0.2 }));
      polygon.addListener('mouseout', () => polygon.setOptions({ fillOpacity: 0.1 }));
      return polygon;
    });

    return () => {
      villageBoundaryRefs.current.forEach((polygon) => polygon.setMap(null));
      villageBoundaryRefs.current = [];
    };
  }, [layerVisibility.villageBoundaries, villageBoundaries]);

  // Clear polygon on layout change
  const clearPolygon = useCallback(() => {
    polygonRef.current?.setMap(null);
    polygonRef.current = null;
  }, []);

  useEffect(() => {
    const focusLocation = (event) => {
      const { location, viewport, zoom = 15, useDefaultZoom = false } = event.detail || {};
      const map = mapRef.current;
      if (!map || !location) return;
      if (viewport) map.fitBounds(viewport, 48);
      else {
        map.panTo(location);
        map.setZoom(useDefaultZoom ? DEFAULT_ZOOM : zoom);
      }
    };
    window.addEventListener('flinok-focus-location', focusLocation);
    return () => window.removeEventListener('flinok-focus-location', focusLocation);
  }, []);

  // History stack triggers
  const pushHistory = useCallback(() => {
    if (!polygonRef.current || isUndoingRedoingRef.current) return;
    const coords = polygonRef.current.getPath().getArray().map(pt => pt.toJSON());

    // Compare with current history index to avoid double saves
    const currentIndex = historyIndexRef.current;
    if (currentIndex >= 0) {
      const prev = pathHistoryRef.current[currentIndex];
      if (JSON.stringify(prev) === JSON.stringify(coords)) return;
    }

    const truncated = pathHistoryRef.current.slice(0, currentIndex + 1);
    pathHistoryRef.current = [...truncated, coords];
    historyIndexRef.current = pathHistoryRef.current.length - 1;
  }, []);

  const handleUndo = useCallback(() => {
    if (!polygonRef.current || historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const coords = pathHistoryRef.current[historyIndexRef.current];
    isUndoingRedoingRef.current = true;

    const path = polygonRef.current.getPath();
    path.clear();
    coords.forEach(pt => path.push(new window.google.maps.LatLng(pt)));
    isUndoingRedoingRef.current = false;
  }, []);

  const handleRedo = useCallback(() => {
    if (!polygonRef.current || historyIndexRef.current >= pathHistoryRef.current.length - 1) return;
    historyIndexRef.current++;
    const coords = pathHistoryRef.current[historyIndexRef.current];
    isUndoingRedoingRef.current = true;

    const path = polygonRef.current.getPath();
    path.clear();
    coords.forEach(pt => path.push(new window.google.maps.LatLng(pt)));
    isUndoingRedoingRef.current = false;
  }, []);

  // Draw polygon layout
  const drawPolygon = useCallback((coordinates, editable = false, color = '#2563eb') => {
    const map = mapRef.current;
    if (!map || coordinates.length < 3 || !layerVisibility.layouts) return;
    clearPolygon();

    polygonRef.current = new window.google.maps.Polygon({
      paths: coordinates,
      map,
      strokeColor: color,
      strokeOpacity: 0,
      strokeWeight: 3,
      fillColor: color,
      fillOpacity: 0,
      editable,
      draggable: editable,
      zIndex: 4
    });

    const startedAt = performance.now();
    const fadePolygon = (now) => {
      if (!polygonRef.current) return;
      const progress = Math.min(1, (now - startedAt) / 200);
      polygonRef.current.setOptions({
        strokeOpacity: progress,
        fillOpacity: 0.18 * progress
      });
      if (progress < 1) requestAnimationFrame(fadePolygon);
    };
    requestAnimationFrame(fadePolygon);

    if (editable) {
      // Attach history listeners
      const path = polygonRef.current.getPath();
      path.addListener('insert_at', () => pushHistory());
      path.addListener('remove_at', () => pushHistory());
      path.addListener('set_at', () => pushHistory());

      // Save initial path to history
      pathHistoryRef.current = [coordinates];
      historyIndexRef.current = 0;

      // Right-click vertex deletion
      polygonRef.current.addListener('rightclick', (event) => {
        if (typeof event.vertex === 'number') {
          polygonRef.current.getPath().removeAt(event.vertex);
        }
      });
    }
  }, [clearPolygon, layerVisibility.layouts, pushHistory]);

  // Load layout from prop activeLayout
  useEffect(() => {
    const activePath = normalizeBoundaryPath(activeLayout?.polygonCoordinates);
    const projectPath = normalizeProjectPolygon(selectedProject?.layoutPolygon);
    const path = activePath.length >= 3 ? activePath : projectPath;
    if (path.length >= 3) {
      drawPolygon(path, editingLayout, editingLayout ? activeLayout?.color : '#2563eb');
    } else {
      clearPolygon();
    }
  // The map instance is created asynchronously. Re-run once it is ready so a
  // layout already selected on first render is not skipped.
  }, [activeLayout, editingLayout, drawPolygon, clearPolygon, selectedProject, mapReady]);

  // Google Maps can detach overlays while it recomputes a camera transition.
  // Keep the selected layout attached across every zoom/idle cycle.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layerVisibility.layouts || !polygonRef.current) return undefined;
    const keepSelectedLayoutVisible = () => polygonRef.current?.setMap(map);
    keepSelectedLayoutVisible();
    const idleListener = map.addListener('idle', keepSelectedLayoutVisible);
    return () => idleListener.remove();
  }, [layerVisibility.layouts, mapReady, selectedProject?.id]);

  // Keep published project layouts visible as persistent map context. The
  // selected layout is rendered separately above this secondary layer.
  useEffect(() => {
    const map = mapRef.current;
    nearbyPolygonRefs.current.forEach((polygon) => polygon.setMap(null));
    nearbyPolygonRefs.current = [];
    if (!map || !mapReady || !layerVisibility.layouts) return;
    nearbyPolygonRefs.current = projects
      .filter((project) => project.id !== selectedProject?.id && isProjectPublishable(project))
      .map((project) => {
        const path = normalizeProjectPolygon(project.layoutPolygon);
        if (path.length < 3) return null;
        return new window.google.maps.Polygon({
          paths: path,
          map,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.48,
          strokeWeight: 1.5,
          fillColor: '#93c5fd',
          fillOpacity: 0.07,
          clickable: true,
          zIndex: 2
        });
      })
      .filter(Boolean);
    return () => {
      nearbyPolygonRefs.current.forEach((polygon) => polygon.setMap(null));
      nearbyPolygonRefs.current = [];
    };
  }, [layerVisibility.layouts, mapReady, projects, selectedProject]);

  // Listen to the custom sidebar layout-adding event
  useEffect(() => {
    const handleStartAddLayout = (event) => {
      const { layoutName } = event.detail;
      clearPolygon();
      setDraftLayoutName(layoutName);
      setDraftPoints([]);
      setDrawingFinished(false);
      setEditingLayout(false);
      setDrawing(true);
    };

    const handleEditLayout = () => {
      if (!activeLayout?.polygonCoordinates) return;
      setDraftPoints([]);
      setDrawing(false);
      setDrawingFinished(false);
      setEditingLayout(true);
    };

    window.addEventListener('flinok-start-add-layout', handleStartAddLayout);
    window.addEventListener('flinok-edit-layout', handleEditLayout);
    return () => {
      window.removeEventListener('flinok-start-add-layout', handleStartAddLayout);
      window.removeEventListener('flinok-edit-layout', handleEditLayout);
    };
  }, [activeLayout, clearPolygon]);

  // Map initialization
  useEffect(() => {
    let disposed = false;
    let resizeObserver;
    let tilesLoadedListener;
    let idleListener;
    let captureAuthCamera;

    if (!googleMapsConfig.isConfigured) {
      setMapStatus('configuration-missing');
      setMapError(googleMapsMissingMessage);
      return () => { disposed = true; };
    }

    setMapStatus('loading');
    loadGoogleMaps().then(() => {
      if (disposed) return;
      const container = mapElement.current;
      if (!container) return;

      try {
        let preservedCamera = null;
        try {
          preservedCamera = JSON.parse(window.sessionStorage.getItem('zinooMapAuthContext') || 'null');
          window.sessionStorage.removeItem('zinooMapAuthContext');
        } catch {
          window.sessionStorage.removeItem('zinooMapAuthContext');
        }
        const center = Number.isFinite(preservedCamera?.lat) && Number.isFinite(preservedCamera?.lng)
          ? { lat: preservedCamera.lat, lng: preservedCamera.lng }
          : { lat: Number(DEFAULT_CENTER.lat), lng: Number(DEFAULT_CENTER.lng) };
        const map = new window.google.maps.Map(container, {
          center,
          zoom: Number.isFinite(preservedCamera?.zoom) ? preservedCamera.zoom : DEFAULT_ZOOM,
          minZoom: 11,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: false,
          zoomControl: false,
          gestureHandling: 'greedy',
          isFractionalZoomEnabled: true
        });

        mapRef.current = map;
        map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
        const settleZoomState = () => {
          const zoom = map.getZoom() ?? DEFAULT_ZOOM;
          const nextDisplayZoom = Math.round(zoom * 10) / 10;
          const nextZoomTier = Math.floor(zoom);
          setZoomLevel((currentZoom) => currentZoom === nextDisplayZoom ? currentZoom : nextDisplayZoom);
          setZoomTier((currentTier) => currentTier === nextZoomTier ? currentTier : nextZoomTier);
        };
        settleZoomState();

        captureAuthCamera = () => {
          const currentCenter = map.getCenter();
          if (!currentCenter) return;
          window.sessionStorage.setItem('zinooMapAuthContext', JSON.stringify({
            lat: currentCenter.lat(),
            lng: currentCenter.lng(),
            zoom: map.getZoom() ?? DEFAULT_ZOOM
          }));
        };
        window.addEventListener('zinoo:capture-map-auth-context', captureAuthCamera);
        idleListener = map.addListener('idle', () => {
          // Let Google Maps own the active pinch/pan animation. React state and
          // marker work are updated only after the camera has settled.
          settleZoomState();
          handleBoundsIdleRef.current?.();
        });

        const resizeMap = () => {
          window.google.maps.event.trigger(map, 'resize');
        };

        resizeObserver = new ResizeObserver(resizeMap);
        resizeObserver.observe(container);

        setMapReady(true);
        setMapStatus('ready');
        onMapReadyRef.current?.();
      } catch (error) {
        console.error('[Zinoo Maps] Buyer map initialization failed', {
          code: error?.code,
          message: error?.message,
          projectCount: projectCountRef.current
        });
        setMapStatus('load-error');
        setMapError(getGoogleMapsErrorMessage(error));
      }
    }).catch((loadError) => {
      if (disposed) return;
      console.error('[Zinoo Maps] Buyer map loader failed', {
        code: loadError?.code,
        message: loadError?.message,
        projectCount: projectCountRef.current
      });
      setMapStatus('load-error');
      setMapError(getGoogleMapsErrorMessage(loadError));
    });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      tilesLoadedListener?.remove();
      idleListener?.remove();
      if (captureAuthCamera) window.removeEventListener('zinoo:capture-map-auth-context', captureAuthCamera);
      // Clusters are AdvancedMarkerElements stored in markersRef; there is no
      // MarkerClusterer instance in this component.
      markersRef.current.forEach((marker) => { marker.map = null; });
      markersRef.current = [];
      selectedMarkerRef.current && (selectedMarkerRef.current.map = null);
      projectPopupRef.current?.setMap(null);
      polygonRef.current?.setMap(null);
      nearbyPolygonRefs.current.forEach((polygon) => polygon.setMap(null));
      nearbyPolygonRefs.current = [];
      villageBoundaryRefs.current.forEach((polygon) => polygon.setMap(null));
    };
  }, []);

  useEffect(() => {
    const focusProject = (event) => {
      const { project, layout, bottomInsetPx = 0, animated = false, requestId = '' } = event.detail || {};
      if (!project) return;
      const position = pointFor(project);
      const map = mapRef.current;
      if (!position || !map || !window.google?.maps) return;
      const layoutPath = normalizeBoundaryPath(layout?.polygonCoordinates);
      const projectPath = normalizeProjectPolygon(project.layoutPolygon);
      const path = layoutPath.length >= 3 ? layoutPath : projectPath;
      // Render the boundary immediately as well as through React state. This
      // covers a project-focus event that arrives while its layout is loading.
      if (path.length >= 3 && !editingLayout && layerVisibility.layouts) {
        drawPolygon(path, false, layout?.color || '#2563eb');
      }
      const bounds = new window.google.maps.LatLngBounds();
      if (path.length >= 3) path.forEach((point) => bounds.extend(point));
      else {
        const neighborhoodRadius = 0.0022;
        bounds.extend({ lat: position.lat - neighborhoodRadius, lng: position.lng - neighborhoodRadius });
        bounds.extend({ lat: position.lat + neighborhoodRadius, lng: position.lng + neighborhoodRadius });
      }
      const padding = {
        top: 48,
        right: 32,
        bottom: 48,
        left: 32
      };
      let settled = false;
      let cameraStage = 'fit';
      let idleListener;
      const finish = () => {
        if (settled) return;
        settled = true;
        idleListener?.remove?.();
        window.setTimeout(() => window.dispatchEvent(new CustomEvent('flinok-project-focus-complete', { detail: { requestId, projectId: project.id } })), 120);
      };
      const advanceCamera = () => {
        if (cameraStage === 'fit') {
          cameraStage = 'offset';
          const zoom = map.getZoom() || 16;
          if (zoom < 15) map.setZoom(15);
          else if (zoom > 17) map.setZoom(17);
          const upwardOffset = Math.max(0, Math.round(Number(bottomInsetPx) / 2));
          if (upwardOffset) map.panBy(0, upwardOffset);
          else finish();
          return;
        }
        finish();
      };
      window.setTimeout(() => {
        idleListener = map.addListener('idle', advanceCamera);
        map.fitBounds(bounds, padding);
      }, animated ? 60 : 0);
      window.setTimeout(finish, 1800);
    };
    window.addEventListener('flinok-focus-project', focusProject);
    return () => window.removeEventListener('flinok-focus-project', focusProject);
  }, [drawPolygon, editingLayout, layerVisibility.layouts]);

  useEffect(() => {
    const viewLayout = (event) => {
      if (event.detail?.projectId && event.detail.projectId !== selectedProject?.id) return;
      const layoutPath = normalizeBoundaryPath(activeLayout?.polygonCoordinates);
      const projectPath = normalizeProjectPolygon(selectedProject?.layoutPolygon);
      const path = layoutPath.length >= 3 ? layoutPath : projectPath;
      if (path.length < 3 || !mapRef.current) return;
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      mapRef.current.fitBounds(bounds, 64);
      if (event.detail?.preserveMap) return;
      const container = mapElement.current?.parentElement;
      if (container && !document.fullscreenElement) container.requestFullscreen?.();
    };
    window.addEventListener('flinok-view-project-layout', viewLayout);
    return () => window.removeEventListener('flinok-view-project-layout', viewLayout);
  }, [activeLayout, selectedProject]);

  // Render every marker at its saved coordinate. Markers must never be moved,
  // fanned out, or replaced by a cluster whose position is an approximation.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps || !mapReady) return;

    markersRef.current.forEach((marker) => { marker.map = null; });

    if (!layerVisibility.markers) return;

    const collisionBehavior = window.google.maps.CollisionBehavior?.REQUIRED;
    const visibleProjects = projects.filter((project) => isProjectPublishable(project) && pointFor(project) && project.id !== selectedProject?.id);
    markersRef.current = visibleProjects.map((project) => {
        const position = pointFor(project);
        const state = markerStates.get(project.id) || getProjectMarkerState({ zoom: zoomLevel, project, selectedProjectId: selectedProject?.id });
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position,
          title: project.name,
          content: markerContent(project, state),
          gmpClickable: true,
          gmpDraggable: false,
          zIndex: state.zIndex,
          ...(collisionBehavior ? { collisionBehavior } : {})
        });

        marker.addEventListener('gmp-click', () => selectProjectFromMarker(project));
        marker.map = map;
        return marker;
    });
  }, [projects, mapReady, selectProjectFromMarker, layerVisibility.markers, zoomLevel, markerStates, selectedProject?.id]);

  useEffect(() => {
    const map = mapRef.current;
    selectedMarkerRef.current && (selectedMarkerRef.current.map = null);
    projectPopupRef.current?.setMap(null);
    selectedMarkerRef.current = null;
    projectPopupRef.current = null;
    if (!selectedProject || !map || !window.google?.maps?.marker?.AdvancedMarkerElement) return undefined;
    const position = pointFor(selectedProject);
    if (!position) return undefined;

    const selectedState = getProjectMarkerState({ zoom: zoomLevel, project: selectedProject, selectedProjectId: selectedProject.id });
    const content = markerContent(selectedProject, selectedState);
    const selectedUsesCircularAnchor = selectedState.mode === 'pin' || selectedState.mode === 'cluster';
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title: selectedProject.name,
      content,
      gmpClickable: true,
      zIndex: 9999
    });
    selectedMarkerRef.current = marker;
    const popupIsPending = pendingPopupProjectIdRef.current === selectedProject.id;
    if (!showProjectPopup || (popupIsPending && popupProjectId !== selectedProject.id)) return () => { marker.map = null; };

    class ProjectPopupOverlay extends window.google.maps.OverlayView {
      constructor() {
        super();
        this.focusReturnTarget = document.activeElement;
        this.shouldRestoreFocus = false;
        this.requestClose = () => {
          this.shouldRestoreFocus = true;
          onSelectProject?.(null);
        };
        this.element = createProjectPopupElement(selectedProject, {
          onViewDetails: onViewProjectDetails,
          onClose: this.requestClose
        });
      }
      onAdd() {
        this.getPanes().floatPane.appendChild(this.element);
        if (window.ResizeObserver) {
          this.resizeObserver = new window.ResizeObserver(() => this.draw());
          this.resizeObserver.observe(this.element);
        }
        requestAnimationFrame(() => {
          this.draw();
          this.element.focusPrimaryAction?.();
        });
      }
      draw() {
        const point = this.getProjection().fromLatLngToDivPixel(new window.google.maps.LatLng(position));
        if (!point) return;
        const mapSize = map.getDiv();
        const popupWidth = this.element.offsetWidth || this.element.getBoundingClientRect().width;
        const popupHeight = this.element.offsetHeight || this.element.getBoundingClientRect().height;
        if (!popupWidth || !popupHeight) return;
        const edge = 12;
        const markerGap = 18;
        const flipLeft = point.x + markerGap + popupWidth > mapSize.clientWidth - edge;
        const placeBelow = point.y - popupHeight < edge;
        const preferredX = flipLeft ? point.x - popupWidth - markerGap : point.x + markerGap;
        const preferredY = placeBelow ? point.y + markerGap : point.y - popupHeight;
        const maxX = Math.max(edge, mapSize.clientWidth - popupWidth - edge);
        const maxY = Math.max(edge, mapSize.clientHeight - popupHeight - edge);
        const x = Math.min(Math.max(preferredX, edge), maxX);
        const y = Math.min(Math.max(preferredY, edge), maxY);
        this.element.classList.toggle('flip-left', flipLeft);
        this.element.classList.toggle('flip-below', placeBelow);
        this.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      onRemove() {
        this.resizeObserver?.disconnect();
        this.element.remove();
        if (this.shouldRestoreFocus && this.focusReturnTarget?.isConnected) {
          requestAnimationFrame(() => this.focusReturnTarget.focus?.({ preventScroll: true }));
        }
      }
    }
    const popup = new ProjectPopupOverlay();
    popup.setMap(map);
    projectPopupRef.current = popup;

    return () => { marker.map = null; popup.setMap(null); };
  }, [selectedProject, mapReady, onViewProjectDetails, onSelectProject, showProjectPopup, zoomLevel, popupProjectId]);

  // Click listeners for placing projects or drawing polygons
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    const clickListener = map.addListener('click', (event) => {
      const point = event.latLng.toJSON();
      if (drawing && !drawingFinished) {
        setDraftPoints((points) => [...points, point]);
      } else if (onSelectProject) {
        onSelectProject(null);
      }
    });

    return () => clickListener.remove();
  }, [drawing, drawingFinished, onSelectProject]);

  useEffect(() => {
    if (!selectedProject) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (projectPopupRef.current?.requestClose) projectPopupRef.current.requestClose();
        else onSelectProject?.(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedProject, onSelectProject]);

  // Live preview polyline/polygon drawing
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    draftLineRef.current?.setMap(null);

    if (draftPoints.length >= 3) {
      draftLineRef.current = new window.google.maps.Polygon({
        map,
        paths: draftPoints,
        strokeColor: '#facc15',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: '#facc15',
        fillOpacity: 0.22,
        clickable: false,
        zIndex: 4
      });
    } else if (draftPoints.length) {
      draftLineRef.current = new window.google.maps.Polyline({
        map,
        path: draftPoints,
        strokeColor: '#facc15',
        strokeOpacity: 1,
        strokeWeight: 3
      });
    }
  }, [draftPoints]);

  // Admin button actions
  const beginLayoutDrawing = () => {
    if (!selectedProject) return alert('Select a project from explore or map first.');
    setDraftPoints([]);
    setDrawingFinished(false);
    setDrawing(true);
  };

  const handleFinishDrawing = () => {
    if (draftPoints.length < 3) return alert('Click at least three points on the map.');
    setDrawing(false);
    setDrawingFinished(true);
    // Draw draft points as editable polygon
    drawPolygon(draftPoints, true, '#facc15');
    setEditingLayout(true);
  };

  const handleSavePolygon = async () => {
    if (!polygonRef.current) return;
    const coordinates = polygonRef.current.getPath().getArray().map(pt => pt.toJSON());
    setSaving(true);

    try {
      const geometry = buildProjectGeometry(coordinates, window.google.maps);
      await updateProjectBoundary(selectedProject.id, geometry);
      if (activeLayout) {
        // Edit existing layout
        await saveProjectLayout(activeLayout.id, coordinates);
        if (onActiveLayoutChange) onActiveLayoutChange({ ...activeLayout, polygonCoordinates: coordinates });
        alert('Layout polygon updated.');
        window.dispatchEvent(new CustomEvent('flinok-layout-saved', {
          detail: { projectId: selectedProject?.id, layoutId: activeLayout.id, mode: 'update' }
        }));
      } else {
        // Create new layout layer
        const layoutId = await createProjectLayout(selectedProject.id, {
          name: draftLayoutName || 'New Phase Layout',
          polygonCoordinates: coordinates,
          color: '#22c55e'
        });
        alert(`Layout '${draftLayoutName || 'Phase Layout'}' saved.`);
        window.dispatchEvent(new CustomEvent('flinok-layout-saved', {
          detail: { projectId: selectedProject?.id, layoutId, mode: 'create' }
        }));
      }
      setEditingLayout(false);
      setDrawingFinished(false);
      setDraftLayoutName('');
      clearPolygon();
    } catch (err) {
      alert('Failed to save layout: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDrawing = () => {
    setDrawing(false);
    setDrawingFinished(false);
    setEditingLayout(false);
    setDraftPoints([]);
    clearPolygon();
  };

  useEffect(() => {
    const updateFullscreenState = () => setIsMapMaximized(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  const toggleMapSize = async () => {
    const container = mapElement.current?.parentElement;
    if (!container) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else await container.requestFullscreen?.();
    } catch (error) {
      console.error('Unable to change map size:', error);
    }
  };

  const changeMapType = (nextMapType) => {
    const map = mapRef.current;
    if (!map || nextMapType === mapType) return;
    map.setMapTypeId(nextMapType === 'satellite'
      ? window.google.maps.MapTypeId.HYBRID
      : window.google.maps.MapTypeId.ROADMAP);
    setMapType(nextMapType);
  };

  return (
    <div className="zinoo-map-screen-wrapper">

      {/* MAP CANVAS */}
      <div ref={mapElement} className="zinoo-google-map" />
      <ZoomBadge zoom={zoomLevel} />
      {mapStatus !== 'ready' && mapStatus !== 'loading' && (
        <div className="map-availability-state" role="alert">
          <MapPin size={24} />
          <span>{mapError}</span>
        </div>
      )}

      {/* FLOATING GLASSMORPHISM CONTROLS */}
      <div className="map-floating-overlay-container">

        <div className="map-type-switcher" role="group" aria-label="Map view">
          <button type="button" className={mapType === 'roadmap' ? 'active' : ''} onClick={() => changeMapType('roadmap')} aria-pressed={mapType === 'roadmap'} aria-label="Normal map view" title="Normal map view"><MapIcon size={19} /></button>
          <button type="button" className={mapType === 'satellite' ? 'active' : ''} onClick={() => changeMapType('satellite')} aria-pressed={mapType === 'satellite'} aria-label="Satellite map view" title="Satellite map view"><Satellite size={19} /></button>
        </div>

        <div className="map-top-right-controls">
          <button className={`floating-circle-btn ${showLayers ? 'active' : ''}`} onClick={() => { const nextOpen = !showLayers; setShowLayers(nextOpen); if (nextOpen) onLayersOpen?.(); }} title="Map layers" aria-label="Map layers"><Layers size={19} /></button>
          <button type="button" className="floating-circle-btn" onClick={toggleMapSize} title={isMapMaximized ? 'Minimize map' : 'Maximize map'} aria-label={isMapMaximized ? 'Minimize map' : 'Maximize map'}>
            {isMapMaximized ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
        </div>

        {/* FLOATING LAYERS POPDOWN */}
        {showLayers && (
          <div className="floating-layers-popdown">
            <div className="layers-header">
              <div><span>Map display</span><h4>Layers</h4><p>Control project and location overlays.</p></div>
              <button onClick={() => setShowLayers(false)} className="close-panel-btn" aria-label="Close layers"><X size={16} /></button>
            </div>

            <div className="layers-body">
              <span className="layers-section-title">Project overlays</span>
              <div className="gis-toggles">
                {[
                  { key: 'markers', label: 'Project markers', description: 'Active projects on the map', icon: MapPin },
                  { key: 'layouts', label: 'Project layouts', description: 'Plot and phase outlines', icon: Building2 }
                ].map(({ key, label, description, icon: Icon }) => (
                  <button key={key} type="button" className="layer-toggle-row" role="switch" aria-checked={layerVisibility[key]} onClick={() => setLayerVisibility({ ...layerVisibility, [key]: !layerVisibility[key] })}>
                    <Icon size={18} /><span><strong>{label}</strong><small>{description}</small></span><i className={layerVisibility[key] ? 'on' : ''} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {(drawing || editingLayout) && (
        <section className="map-layout-editor-controls" aria-label="Layout editor controls">
          <div>
            <strong>{drawing ? 'Drawing layout' : 'Editing layout'}</strong>
            <span>{drawing ? `${draftPoints.length} points placed` : 'Adjust the polygon handles, then save your changes.'}</span>
          </div>
          <div className="map-layout-editor-actions">
            {drawing ? (
              <button type="button" className="map-layout-editor-primary" onClick={handleFinishDrawing} disabled={draftPoints.length < 3}>
                <Check size={16} /> Finish drawing
              </button>
            ) : (
              <>
                <button type="button" className="map-layout-editor-icon" onClick={handleUndo} title="Undo" aria-label="Undo"><Undo2 size={16} /></button>
                <button type="button" className="map-layout-editor-icon" onClick={handleRedo} title="Redo" aria-label="Redo"><Redo2 size={16} /></button>
                <button type="button" className="map-layout-editor-primary" onClick={handleSavePolygon} disabled={saving}>
                  <Check size={16} /> {saving ? 'Saving…' : 'Save layout'}
                </button>
              </>
            )}
            <button type="button" className="map-layout-editor-cancel" onClick={handleCancelDrawing}><X size={16} /> Cancel</button>
          </div>
        </section>
      )}

      {/* MAP ALERTS */}
      {mapError && mapStatus === 'ready' && (
        <div className="map-alert-card" role="alert">
          <ShieldAlert size={18} />
          <span>{mapError}</span>
          <button onClick={() => setMapError('')}><X size={14} /></button>
        </div>
      )}

    </div>
  );
}
