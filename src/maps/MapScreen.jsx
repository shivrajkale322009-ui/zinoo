import { MarkerClusterer } from '@googlemaps/markerclusterer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Undo2, Redo2, Check, X, ShieldAlert,
  MapPin, Eye, Navigation, Share2, Trash2,
  Layers, CheckSquare, Square, RefreshCw, ZoomIn, ZoomOut, RotateCw, Maximize2, PersonStanding,
  Route, Building2
} from 'lucide-react';
import { loadGoogleMaps } from './googleMaps';
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
import { getMarkerVisualState } from './mapZoom';
import { createProjectPopupElement } from './projectPopupOverlay';
import './mapScreen.css';

const DEFAULT_CENTER = CHAKAN_MAP_POSITION;
const DEFAULT_ZOOM = 12;
const pointFor = (project) => getProjectCoordinates(project);

const priceLabel = (value) =>
  value ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}` : 'View';

function markerContent(project, zoomTier = 'medium') {
  const price = project.priceFrom || project.startingPrice;
  const label = zoomTier === 'low'
    ? '●'
    : zoomTier === 'medium'
      ? '●'
      : priceLabel(price);
  const marker = document.createElement('div');
  marker.className = `druvio-project-marker druvio-project-marker-${zoomTier}`;
  marker.textContent = String(label || 'View');
  marker.setAttribute('role', 'button');
  marker.setAttribute('tabindex', '0');
  return marker;
}

function clusterContent(count) {
  const marker = document.createElement('div');
  marker.className = 'druvio-cluster-marker';
  marker.textContent = String(count);
  marker.setAttribute('aria-label', `${count} projects`);
  return marker;
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
  filters = { budgetMax: 3000000, distanceMax: 10, naPlot: false, bankLoan: false, minScore: 0 }
}) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const projectPopupRef = useRef(null);
  const clusterRef = useRef(null);
  const polygonRef = useRef(null);

  // Drawing overlays
  const draftLineRef = useRef(null);

  // States
  const [mapError, setMapError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [zoomTier, setZoomTier] = useState('low');
  // Layer toggles
  const [showLayers, setShowLayers] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    markers: true,
    layouts: true,
    roads: true,
    villageBoundaries: false
  });

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
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const sw = bounds.getSouthWest().toJSON();
    const ne = bounds.getNorthEast().toJSON();

    try {
      const visible = await loadProjectsInBounds(sw, ne);

      // Apply Home-panel filters to visible projects.
      const finalVisible = visible.filter(p => {
        if (!isProjectPublishable(p)) return false;

        return matchesProjectFilters(p, filters);
      });

      if (onVisibleProjectsChange) {
        onVisibleProjectsChange(finalVisible);
      }
    } catch (err) {
      console.error('[Druvio] Visible bounds load error:', err);
    }
  }, [filters, onVisibleProjectsChange]);

  // Keep one Druvio basemap and expose only useful discovery overlays.
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
      const { location, viewport } = event.detail || {};
      const map = mapRef.current;
      if (!map || !location) return;
      if (viewport) map.fitBounds(viewport, 48);
      else {
        map.panTo(location);
        map.setZoom(15);
      }
    };
    window.addEventListener('druvio-focus-location', focusLocation);
    return () => window.removeEventListener('druvio-focus-location', focusLocation);
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
  const drawPolygon = useCallback((coordinates, editable = false, color = '#22c55e') => {
    const map = mapRef.current;
    if (!map || coordinates.length < 3 || !layerVisibility.layouts) return;
    clearPolygon();

    polygonRef.current = new window.google.maps.Polygon({
      paths: coordinates,
      map,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: color,
      fillOpacity: 0.22,
      editable,
      draggable: editable,
      zIndex: 4
    });

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
    if (activeLayout && activeLayout.polygonCoordinates) {
      drawPolygon(activeLayout.polygonCoordinates, editingLayout, activeLayout.color);
    } else if (zoomTier === 'high' && selectedProject?.layoutPolygon) {
      const path = normalizeProjectPolygon(selectedProject.layoutPolygon);
      drawPolygon(path, editingLayout, '#2563eb');
      if (path.length >= 3 && mapRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((point) => bounds.extend(point));
        mapRef.current.fitBounds(bounds, 64);
      }
    } else {
      clearPolygon();
    }
  }, [activeLayout, editingLayout, drawPolygon, clearPolygon, selectedProject, zoomTier]);

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

    window.addEventListener('druvio-start-add-layout', handleStartAddLayout);
    window.addEventListener('druvio-edit-layout', handleEditLayout);
    return () => {
      window.removeEventListener('druvio-start-add-layout', handleStartAddLayout);
      window.removeEventListener('druvio-edit-layout', handleEditLayout);
    };
  }, [activeLayout, clearPolygon]);

  // Map initialization
  useEffect(() => {
    let disposed = false;
    let resizeObserver;
    let tilesLoadedListener;
    let idleListener;
    let zoomListener;

    loadGoogleMaps().then(() => {
      if (disposed) return;
      const container = mapElement.current;
      if (!container) return;

      try {
        const center = { lat: Number(DEFAULT_CENTER.lat), lng: Number(DEFAULT_CENTER.lng) };
        const map = new window.google.maps.Map(container, {
          center,
          zoom: DEFAULT_ZOOM,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          mapTypeId: window.google.maps.MapTypeId.HYBRID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: false,
          zoomControl: false,
          gestureHandling: 'greedy'
        });

        mapRef.current = map;
        map.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
        const updateZoomTier = () => {
          const zoom = map.getZoom() || DEFAULT_ZOOM;
          setZoomTier(getMarkerVisualState(zoom).tier);
        };
        updateZoomTier();
        zoomListener = map.addListener('zoom_changed', updateZoomTier);

        // Idle listener to fetch visible bounds markers
        idleListener = map.addListener('idle', handleBoundsIdle);

        const resizeMap = () => {
          window.google.maps.event.trigger(map, 'resize');
        };

        resizeObserver = new ResizeObserver(resizeMap);
        resizeObserver.observe(container);

        setMapReady(true);
      } catch (error) {
        console.error('[Druvio Maps] Initialization failed:', error);
        setMapError(error.message || 'Google Maps could not be initialized.');
      }
    }).catch((error) => setMapError(error.message));

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      tilesLoadedListener?.remove();
      idleListener?.remove();
      zoomListener?.remove();
      clusterRef.current?.clearMarkers();
      markersRef.current.forEach((marker) => { marker.map = null; });
      selectedMarkerRef.current && (selectedMarkerRef.current.map = null);
      projectPopupRef.current?.setMap(null);
      polygonRef.current?.setMap(null);
      villageBoundaryRefs.current.forEach((polygon) => polygon.setMap(null));
    };
  }, [handleBoundsIdle]);

  useEffect(() => {
    const focusProject = (event) => {
      const project = event.detail?.project;
      if (!project) return;
      const position = pointFor(project);
      if (!position) return;
      mapRef.current?.panTo(position);
      mapRef.current?.setZoom(15);
    };
    window.addEventListener('druvio-focus-project', focusProject);
    return () => window.removeEventListener('druvio-focus-project', focusProject);
  }, []);

  useEffect(() => {
    const viewLayout = (event) => {
      if (event.detail?.projectId && event.detail.projectId !== selectedProject?.id) return;
      const path = normalizeProjectPolygon(selectedProject?.layoutPolygon);
      if (path.length < 3 || !mapRef.current) return;
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      mapRef.current.fitBounds(bounds, 64);
      const container = mapElement.current?.parentElement;
      if (container && !document.fullscreenElement) container.requestFullscreen?.();
    };
    window.addEventListener('druvio-view-project-layout', viewLayout);
    return () => window.removeEventListener('druvio-view-project-layout', viewLayout);
  }, [selectedProject]);

  // Update projects markers and cluster
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps || !mapReady) return;

    clusterRef.current?.clearMarkers();
    markersRef.current.forEach((marker) => { marker.map = null; });

    if (!layerVisibility.markers) return;

    markersRef.current = projects.map((project) => {
      const position = pointFor(project);
      if (!isProjectPublishable(project) || !position) return null;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position,
        title: project.name,
        content: markerContent(project, zoomTier),
        gmpClickable: true,
        gmpDraggable: false
      });

      marker.addEventListener('gmp-click', () => {
        clearPolygon();
        if (onSelectProject) {
          onSelectProject(project);
        }
        map.panTo(position);
      });

      return marker;
    }).filter(Boolean);

    if (zoomTier === 'high') {
      markersRef.current.forEach((marker) => { marker.map = map; });
    } else {
      clusterRef.current = new MarkerClusterer({
        map,
        markers: markersRef.current,
        renderer: {
          render: ({ count, position }) => new window.google.maps.marker.AdvancedMarkerElement({
            position,
            content: clusterContent(count),
            title: `${count} projects`,
            zIndex: 1000 + count
          })
        }
      });
    }
  }, [projects, clearPolygon, mapReady, onSelectProject, layerVisibility.markers, zoomTier]);

  useEffect(() => {
    const map = mapRef.current;
    selectedMarkerRef.current && (selectedMarkerRef.current.map = null);
    projectPopupRef.current?.setMap(null);
    selectedMarkerRef.current = null;
    projectPopupRef.current = null;
    if (!selectedProject || !showProjectPopup || !map || !window.google?.maps?.marker?.AdvancedMarkerElement) return undefined;
    const position = pointFor(selectedProject);
    if (!position) return undefined;

    const content = markerContent(selectedProject, 'high');
    content.classList.add('druvio-project-marker-selected');
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title: selectedProject.name,
      content,
      gmpClickable: true,
      zIndex: 9999
    });
    selectedMarkerRef.current = marker;
    map.panTo(position);
    class ProjectPopupOverlay extends window.google.maps.OverlayView {
      constructor() {
        super();
        this.element = createProjectPopupElement(selectedProject, onViewProjectDetails);
      }
      onAdd() { this.getPanes().floatPane.appendChild(this.element); }
      draw() {
        const point = this.getProjection().fromLatLngToDivPixel(new window.google.maps.LatLng(position));
        if (!point) return;
        const popupWidth = 288;
        const flipLeft = point.x + popupWidth + 18 > map.getDiv().clientWidth;
        this.element.classList.toggle('flip-left', flipLeft);
        this.element.style.transform = `translate(${flipLeft ? point.x - popupWidth - 18 : point.x + 18}px, ${point.y - 148}px)`;
      }
      onRemove() { this.element.remove(); }
    }
    const popup = new ProjectPopupOverlay();
    popup.setMap(map);
    projectPopupRef.current = popup;

    return () => { marker.map = null; popup.setMap(null); };
  }, [selectedProject, mapReady, onViewProjectDetails, showProjectPopup]);

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
        window.dispatchEvent(new CustomEvent('druvio-layout-saved', {
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
        window.dispatchEvent(new CustomEvent('druvio-layout-saved', {
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

  const zoomMap = (amount) => mapRef.current?.setZoom((mapRef.current.getZoom() || DEFAULT_ZOOM) + amount);
  const rotateMap = () => mapRef.current?.setHeading(((mapRef.current?.getHeading() || 0) + 45) % 360);
  const locateUser = () => {
    mapRef.current?.panTo(CHAKAN_MAP_POSITION);
    mapRef.current?.setZoom(15);
  };
  const toggleFullscreen = () => {
    const container = mapElement.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else container.requestFullscreen?.();
  };
  const openStreetView = () => {
    const map = mapRef.current;
    if (!map) return;
    const panorama = map.getStreetView();
    panorama.setPosition(map.getCenter());
    panorama.setPov({ heading: map.getHeading() || 0, pitch: 0 });
    panorama.setVisible(true);
  };

  return (
    <div className="druvio-map-screen-wrapper">

      {/* MAP CANVAS */}
      <div ref={mapElement} className="druvio-google-map" />

      {/* FLOATING GLASSMORPHISM CONTROLS */}
      <div className="map-floating-overlay-container">

        <div className="map-top-right-controls">
          <button className={`floating-circle-btn ${showLayers ? 'active' : ''}`} onClick={() => { const nextOpen = !showLayers; setShowLayers(nextOpen); if (nextOpen) onLayersOpen?.(); }} title="Map layers" aria-label="Map layers"><Layers size={19} /></button>
          <button className="floating-circle-btn" onClick={locateUser} title="Your location" aria-label="Your location"><Navigation size={19} /></button>
          <button className="floating-circle-btn" onClick={openStreetView} title="Street View" aria-label="Open Street View"><PersonStanding size={19} /></button>
        </div>

        <div className="map-bottom-right-controls">
          <button className="floating-circle-btn" onClick={() => zoomMap(1)} title="Zoom in" aria-label="Zoom in"><ZoomIn size={19} /></button>
          <button className="floating-circle-btn" onClick={() => zoomMap(-1)} title="Zoom out" aria-label="Zoom out"><ZoomOut size={19} /></button>
          <button className="floating-circle-btn" onClick={rotateMap} title="Rotate map" aria-label="Rotate map"><RotateCw size={19} /></button>
          <button className="floating-circle-btn" onClick={toggleFullscreen} title="Fullscreen" aria-label="Toggle fullscreen"><Maximize2 size={19} /></button>
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
                  { key: 'markers', label: 'Project markers', description: 'Approved projects on the map', icon: MapPin },
                  { key: 'layouts', label: 'Project layouts', description: 'Plot and phase outlines', icon: Building2 },
                  { key: 'roads', label: 'Road network', description: 'Road geometry and labels', icon: Route }
                ].map(({ key, label, description, icon: Icon }) => (
                  <button key={key} type="button" className="layer-toggle-row" role="switch" aria-checked={layerVisibility[key]} onClick={() => setLayerVisibility({ ...layerVisibility, [key]: !layerVisibility[key] })}>
                    <Icon size={18} /><span><strong>{label}</strong><small>{description}</small></span><i className={layerVisibility[key] ? 'on' : ''} />
                  </button>
                ))}
                <button type="button" className="layer-toggle-row" role="switch" aria-checked={layerVisibility.villageBoundaries} disabled={villageBoundaries.length === 0} onClick={() => setLayerVisibility({ ...layerVisibility, villageBoundaries: !layerVisibility.villageBoundaries })}>
                  <Layers size={18} /><span><strong>Village boundaries</strong><small>{villageBoundaries.length ? `${villageBoundaries.length} verified boundary ${villageBoundaries.length === 1 ? 'area' : 'areas'}` : 'No verified boundary data available'}</small></span><i className={layerVisibility.villageBoundaries ? 'on' : ''} />
                </button>
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
      {mapError && (
        <div className="map-alert-card" role="alert">
          <ShieldAlert size={18} />
          <span>{mapError}</span>
          <button onClick={() => setMapError('')}><X size={14} /></button>
        </div>
      )}

    </div>
  );
}
