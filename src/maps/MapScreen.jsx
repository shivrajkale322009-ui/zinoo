import { MarkerClusterer } from '@googlemaps/markerclusterer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus, Pencil, Undo2, Redo2, Check, X, ShieldAlert,
  MapPin, Eye, Compass, Navigation, Share2, Trash2,
  Layers, CheckSquare, Square, RefreshCw, ZoomIn, ZoomOut, RotateCw, Maximize2
} from 'lucide-react';
import { loadGoogleMaps } from './googleMaps';
import {
  createMapProject,
  updateProjectMarker,
  createProjectLayout,
  saveProjectLayout,
  loadProjectsInBounds
} from './projectMapService';
import './mapScreen.css';

const DEFAULT_CENTER = { lat: 18.7889, lng: 73.8568 };
const DEFAULT_ZOOM = 12;
const pointFor = (project) => ({
  lat: Number(project.latitude ?? project.coords?.[0]),
  lng: Number(project.longitude ?? project.coords?.[1])
});

const priceLabel = (value) =>
  value ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}` : 'View';

function markerIcon(project) {
  const price = project.priceFrom || project.startingPrice;
  const label = price ? priceLabel(price) : project.name;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="48"><rect x="2" y="2" width="124" height="34" rx="17" fill="#0c5c42" stroke="#d9f99d" stroke-width="2"/><text x="64" y="24" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="white">${String(label).replace(/[<>&]/g, '')}</text><path d="M56 36h16l-8 10z" fill="#0c5c42"/></svg>`)}`,
    scaledSize: new window.google.maps.Size(128, 48),
    anchor: new window.google.maps.Point(64, 46)
  };
}

export default function MapScreen({
  projects = [],
  isAdmin = false,
  selectedProject = null,
  onSelectProject = null,
  activeLayout = null,
  onActiveLayoutChange = null,
  onVisibleProjectsChange = null,
  filters = { budgetMax: 3000000, distanceMax: 10, naPlot: false, bankLoan: false, minScore: 0 }
}) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clusterRef = useRef(null);
  const polygonRef = useRef(null);

  // Drawing overlays
  const draftLineRef = useRef(null);
  const draftMarkerRef = useRef(null);

  // States
  const [mapError, setMapError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [mapHeading, setMapHeading] = useState(0);

  // Layer toggles
  const [showLayers, setShowLayers] = useState(false);
  const [mapType, setMapType] = useState('hybrid'); // hybrid, satellite, roadmap, terrain
  const [layerVisibility, setLayerVisibility] = useState({
    markers: true,
    layouts: true,
    roads: true,
    villageBoundaries: false
  });

  // Village boundary polygon helper
  const villageBoundaryRef = useRef(null);

  // Drawing state
  const [drawing, setDrawing] = useState(false);
  const [drawingFinished, setDrawingFinished] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [newPosition, setNewPosition] = useState(null);
  const [placingProject, setPlacingProject] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftLayoutName, setDraftLayoutName] = useState('');

  // Project creation form state
  const [form, setForm] = useState({
    name: '',
    developer: '',
    priceFrom: '',
    remainingPlots: '',
    village: '',
    taluka: '',
    area: '',
    description: '',
    thumbnail: '',
    amenities: '',
    cashbackAmount: '',
    whatsappNumber: '',
    siteVisitContact: '',
    googleMapsLink: '',
    website: '',
    reraNumber: '',
    status: 'approved'
  });

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
        const isApproved = p.status === 'approved' || p.status === 'Active';
        if (!isApproved) return false;

        const startingPrice = Number(p.priceFrom || p.startingPrice || 0);
        const matchesBudget = startingPrice <= filters.budgetMax;
        const matchesDistance = Number(p.distance || 0) <= filters.distanceMax;
        const matchesBankLoan = !filters.bankLoan || p.bankLoan;
        const matchesNaPlot = !filters.naPlot || p.naPlot;
        const matchesScore = Number(p.DruvioScore || p.plotItScore || 0) >= filters.minScore;

        return matchesBudget && matchesDistance && matchesBankLoan && matchesNaPlot && matchesScore;
      });

      if (onVisibleProjectsChange) {
        onVisibleProjectsChange(finalVisible);
      }
    } catch (err) {
      console.error('[Druvio] Visible bounds load error:', err);
    }
  }, [filters, onVisibleProjectsChange]);

  // Handle map type and styles (Roads toggling)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Set Map Type
    if (mapType === 'hybrid') map.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
    else if (mapType === 'satellite') map.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
    else if (mapType === 'roadmap') map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
    else if (mapType === 'terrain') map.setMapTypeId(window.google.maps.MapTypeId.TERRAIN);

    // Set Roads visibility
    const hideRoadsStyle = [
      { featureType: "road", elementType: "geometry", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] }
    ];
    map.setOptions({ styles: layerVisibility.roads ? [] : hideRoadsStyle });
  }, [mapType, layerVisibility.roads]);

  // Village Boundaries Simulated GIS layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layerVisibility.villageBoundaries) {
      if (!villageBoundaryRef.current) {
        // Draw a simulated village boundary around Chakan circle
        const circleCoords = [];
        const radius = 0.04; // ~4km
        for (let i = 0; i < 360; i += 10) {
          const angle = (i * Math.PI) / 180;
          circleCoords.push({
            lat: DEFAULT_CENTER.lat + radius * Math.sin(angle),
            lng: DEFAULT_CENTER.lng + radius * 1.5 * Math.cos(angle)
          });
        }
        villageBoundaryRef.current = new window.google.maps.Polygon({
          paths: circleCoords,
          map,
          strokeColor: '#38bdf8',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#38bdf8',
          fillOpacity: 0.1,
          clickable: false,
          zIndex: 1
        });
      } else {
        villageBoundaryRef.current.setMap(map);
      }
    } else {
      villageBoundaryRef.current?.setMap(null);
    }
  }, [layerVisibility.villageBoundaries]);

  // Clear polygon on layout change
  const clearPolygon = useCallback(() => {
    polygonRef.current?.setMap(null);
    polygonRef.current = null;
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
    } else {
      clearPolygon();
    }
  }, [activeLayout, editingLayout, drawPolygon, clearPolygon]);

  // Place project draft marker helper
  const placeDraftMarker = useCallback((position) => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    if (!draftMarkerRef.current) {
      draftMarkerRef.current = new window.google.maps.Marker({
        map,
        position,
        title: 'New Project Coordinates',
        draggable: true,
        zIndex: 6
      });
      draftMarkerRef.current.addListener('dragend', (event) => setNewPosition(event.latLng.toJSON()));
    } else {
      draftMarkerRef.current.setPosition(position);
      draftMarkerRef.current.setMap(map);
    }
  }, []);

  const clearDraftMarker = useCallback(() => {
    draftMarkerRef.current?.setMap(null);
    draftMarkerRef.current = null;
  }, []);

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

    loadGoogleMaps().then(() => {
      if (disposed) return;
      const container = mapElement.current;
      if (!container) return;

      try {
        const center = { lat: Number(DEFAULT_CENTER.lat), lng: Number(DEFAULT_CENTER.lng) };
        const map = new window.google.maps.Map(container, {
          center,
          zoom: DEFAULT_ZOOM,
          mapTypeId: window.google.maps.MapTypeId.HYBRID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: false,
          zoomControl: false,
          tilt: 45,
          gestureHandling: 'greedy'
        });

        mapRef.current = map;
        map.addListener('heading_changed', () => setMapHeading(map.getHeading() || 0));

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
      clusterRef.current?.clearMarkers();
      markersRef.current.forEach((marker) => marker.setMap(null));
      polygonRef.current?.setMap(null);
      draftMarkerRef.current?.setMap(null);
      villageBoundaryRef.current?.setMap(null);
    };
  }, [handleBoundsIdle]);

  useEffect(() => {
    const focusProject = (event) => {
      const project = event.detail?.project;
      if (!project) return;
      const position = pointFor(project);
      if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng)) return;
      mapRef.current?.panTo(position);
      mapRef.current?.setZoom(15);
    };
    window.addEventListener('druvio-focus-project', focusProject);
    return () => window.removeEventListener('druvio-focus-project', focusProject);
  }, []);

  // Update projects markers and cluster
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps || !mapReady) return;

    clusterRef.current?.clearMarkers();
    markersRef.current.forEach((marker) => marker.setMap(null));

    if (!layerVisibility.markers) return;

    markersRef.current = projects.map((project) => {
      const position = pointFor(project);
      const isApproved = project.status === 'approved' || project.status === 'Active';
      if (!isApproved || !position.lat || !position.lng) return null;

      const marker = new window.google.maps.Marker({
        position,
        title: project.name,
        icon: markerIcon(project),
        optimized: true
      });

      marker.addListener('click', () => {
        clearPolygon();
        if (onSelectProject) {
          onSelectProject(project);
        }
        map.panTo(position);
        map.setZoom(15);
      });

      if (isAdmin && adminMode) {
        marker.setDraggable(true);
        marker.addListener('dragend', async () => {
          try {
            await updateProjectMarker(project.id, marker.getPosition().toJSON());
            alert('Marker position updated.');
          } catch (error) {
            alert('Unable to move project marker: ' + error.message);
          }
        });
      }

      return marker;
    }).filter(Boolean);

    clusterRef.current = new MarkerClusterer({ map, markers: markersRef.current });
  }, [projects, adminMode, isAdmin, clearPolygon, mapReady, onSelectProject, layerVisibility.markers]);

  // Click listeners for placing projects or drawing polygons
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    const clickListener = map.addListener('click', (event) => {
      const point = event.latLng.toJSON();
      if (placingProject) {
        placeDraftMarker(point);
        setNewPosition(point);
        setPlacingProject(false);
        setFormOpen(true);
        return;
      }
      if (drawing && !drawingFinished) {
        setDraftPoints((points) => [...points, point]);
      }
    });

    return () => clickListener.remove();
  }, [placingProject, drawing, drawingFinished, placeDraftMarker]);

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

  const submitProject = async (event) => {
    event.preventDefault();
    if (!newPosition) return;
    setSaving(true);

    try {
      const id = await createMapProject({
        ...form,
        latitude: newPosition.lat,
        longitude: newPosition.lng
      });
      clearDraftMarker();
      setFormOpen(false);
      setNewPosition(null);
      setForm({
        name: '',
        developer: '',
        priceFrom: '',
        remainingPlots: '',
        village: '',
        taluka: '',
        area: '',
        description: '',
        thumbnail: '',
        amenities: '',
        cashbackAmount: '',
        whatsappNumber: '',
        siteVisitContact: '',
        googleMapsLink: '',
        website: '',
        reraNumber: '',
        status: 'approved'
      });
      alert('Project saved successfully. It is now visible on the map!');

      // Automatically pan to new project
      mapRef.current?.panTo(newPosition);
    } catch (error) {
      alert('Failed to save project: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const zoomMap = (amount) => mapRef.current?.setZoom((mapRef.current.getZoom() || DEFAULT_ZOOM) + amount);
  const resetHeading = () => mapRef.current?.setHeading(0);
  const rotateMap = () => mapRef.current?.setHeading(((mapRef.current?.getHeading() || 0) + 45) % 360);
  const locateUser = () => navigator.geolocation?.getCurrentPosition(
    ({ coords }) => { mapRef.current?.panTo({ lat: coords.latitude, lng: coords.longitude }); mapRef.current?.setZoom(15); },
    () => alert('Unable to access your current location. Please allow location permission.')
  );
  const toggleFullscreen = () => {
    const container = mapElement.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else container.requestFullscreen?.();
  };

  return (
    <div className="druvio-map-screen-wrapper">

      {/* MAP CANVAS */}
      <div ref={mapElement} className="druvio-google-map" />

      {/* FLOATING GLASSMORPHISM CONTROLS */}
      <div className="map-floating-overlay-container">

        <div className="map-top-left-controls">
          <div className="brand-badge">
            <Compass size={18} />
            <strong>Druvio</strong>
            <span>Hybrid</span>
          </div>
        </div>

        <div className="map-top-right-controls">
          {Math.abs(mapHeading) > 1 && <button className="floating-circle-btn map-compass-control" title="Reset north" onClick={resetHeading}><Compass size={17} style={{ transform: `rotate(${-mapHeading}deg)` }} /></button>}
          <button className={`floating-circle-btn ${showLayers ? 'active' : ''}`} onClick={() => setShowLayers(!showLayers)} title="Map Layers"><Layers size={16} /></button>
          <button className="floating-circle-btn" onClick={locateUser} title="Current Location"><Navigation size={16} /></button>
        </div>

        <div className="map-bottom-right-controls">
          <button className="floating-circle-btn" onClick={() => zoomMap(1)} title="Zoom in"><ZoomIn size={16} /></button>
          <button className="floating-circle-btn" onClick={() => zoomMap(-1)} title="Zoom out"><ZoomOut size={16} /></button>
          <button className="floating-circle-btn" onClick={rotateMap} title="Rotate map"><RotateCw size={16} /></button>
          <button className="floating-circle-btn" onClick={toggleFullscreen} title="Fullscreen"><Maximize2 size={16} /></button>
        </div>

        {/* FLOATING LAYERS POPDOWN */}
        {showLayers && (
          <div className="floating-layers-popdown glass">
            <div className="layers-header">
              <h4>Map Layers</h4>
              <button onClick={() => setShowLayers(false)} className="close-panel-btn"><X size={14} /></button>
            </div>

            <div className="layers-body">
              <span className="layers-section-title">Base Map</span>
              <div className="base-maps-grid">
                {['hybrid', 'satellite', 'roadmap', 'terrain'].map(type => (
                  <button
                    key={type}
                    className={`base-map-option-btn ${mapType === type ? 'active' : ''}`}
                    onClick={() => setMapType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <span className="layers-section-title" style={{ marginTop: '12px', display: 'block' }}>GIS Features</span>
              <div className="gis-toggles">
                <label className="checkbox-row">
                  <input type="checkbox" checked={layerVisibility.markers} onChange={e => setLayerVisibility({ ...layerVisibility, markers: e.target.checked })} />
                  <span>Project Markers</span>
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={layerVisibility.layouts} onChange={e => setLayerVisibility({ ...layerVisibility, layouts: e.target.checked })} />
                  <span>Project Layouts</span>
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={layerVisibility.roads} onChange={e => setLayerVisibility({ ...layerVisibility, roads: e.target.checked })} />
                  <span>Road Networks</span>
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={layerVisibility.villageBoundaries} onChange={e => setLayerVisibility({ ...layerVisibility, villageBoundaries: e.target.checked })} />
                  <span>Village Boundaries</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN TOOLBAR FLOATING OVER MAP */}
        {isAdmin && (
          <div className="map-floating-admin-toolbar glass">
            <button
              type="button"
              className={`toolbar-btn pencil-btn ${adminMode ? 'active' : ''}`}
              onClick={() => setAdminMode(!adminMode)}
            >
              <Pencil size={14} />
              <span>{adminMode ? 'Exit Admin' : 'Admin Toolbar'}</span>
            </button>

            {adminMode && (
              <div className="admin-sub-toolbar">
                {/* Regular actions */}
                {!drawing && !editingLayout && (
                  <>
                    <button
                      onClick={() => {
                        clearDraftMarker();
                        setNewPosition(null);
                        setPlacingProject(true);
                      }}
                      className="toolbar-btn"
                    >
                      <Plus size={14} /> New Project
                    </button>
                    {selectedProject && (
                      <button onClick={beginLayoutDrawing} className="toolbar-btn">
                        <Layers size={14} /> Draw Polygon
                      </button>
                    )}
                    {activeLayout && (
                      <button onClick={() => setEditingLayout(true)} className="toolbar-btn">
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                  </>
                )}

                {/* Drawing / Editing controls */}
                {drawing && (
                  <div className="drawing-actions">
                    <span className="drawing-status-badge">Drawing layout: Click map ({draftPoints.length})</span>
                    <button onClick={handleFinishDrawing} disabled={draftPoints.length < 3} className="toolbar-btn primary-btn"><Check size={13} /> Finish</button>
                    <button onClick={handleCancelDrawing} className="toolbar-btn danger-btn"><X size={13} /> Cancel</button>
                  </div>
                )}

                {editingLayout && (
                  <div className="editing-actions">
                    <span className="drawing-status-badge">Adjusting vertices</span>
                    <button onClick={handleUndo} className="icon-toolbar-btn" title="Undo"><Undo2 size={13} /></button>
                    <button onClick={handleRedo} className="icon-toolbar-btn" title="Redo"><Redo2 size={13} /></button>
                    <button onClick={handleSavePolygon} disabled={saving} className="toolbar-btn primary-btn"><Check size={13} /> Save Layout</button>
                    <button onClick={handleCancelDrawing} className="toolbar-btn danger-btn"><X size={13} /> Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Placing Project Hint Overlay */}
        {placingProject && (
          <div className="placing-hint-toast glass">
            <span>Click on the map to place the project marker.</span>
            <button onClick={() => setPlacingProject(false)}><X size={14} /></button>
          </div>
        )}

      </div>

      {/* NEW PROJECT DIALOG BACKDROP */}
      {formOpen && (
        <div className="map-modal-backdrop">
          <form className="map-project-form glass" onSubmit={submitProject}>
            <button
              type="button"
              className="map-card-close"
              onClick={() => {
                clearDraftMarker();
                setFormOpen(false);
                setNewPosition(null);
              }}
            >
              <X size={18} />
            </button>
            <h2>New project</h2>
            <p className="coords-subtitle">Coordinates: {newPosition?.lat.toFixed(6)}, {newPosition?.lng.toFixed(6)}</p>

            <div className="form-fields-grid">
              {[
                ['name', 'Project name'],
                ['developer', 'Projected by'],
                ['priceFrom', 'Price from (₹)'],
                ['remainingPlots', 'Remaining plots'],
                ['village', 'Village'],
                ['taluka', 'Taluka'],
                ['area', 'Area / landmark'],
                ['thumbnail', 'Thumbnail URL'],
                ['cashbackAmount', 'Cashback amount (₹)'],
                ['whatsappNumber', 'WhatsApp number'],
                ['siteVisitContact', 'Site visit contact'],
                ['googleMapsLink', 'Google Maps link'],
                ['website', 'Website'],
                ['reraNumber', 'RERA number']
              ].map(([key, label]) => (
                <label key={key}>
                  {label}{key === 'name' || key === 'developer' ? ' (Required)' : ''}
                  <input
                    required={key === 'name' || key === 'developer'}
                    type={['priceFrom', 'remainingPlots', 'cashbackAmount'].includes(key) ? 'number' : (key.includes('Link') || key === 'website' || key === 'thumbnail' ? 'url' : 'text')}
                    min={key === 'cashbackAmount' ? '0' : undefined}
                    value={form[key]}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  />
                </label>
              ))}
            </div>

            <label className="description-label">
              Amenities
              <input
                type="text"
                value={form.amenities}
                onChange={(event) => setForm({ ...form, amenities: event.target.value })}
                placeholder="Roads, Electricity, Water"
              />
            </label>

            <label className="description-label">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>

            <label className="description-label">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                <option value="approved">Active</option>
                <option value="pending_review">Pending Review</option>
                <option value="rejected">Rejected</option>
                <option value="Sold Out">Sold Out</option>
              </select>
            </label>

            <button className="map-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Create project'}
            </button>
          </form>
        </div>
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
