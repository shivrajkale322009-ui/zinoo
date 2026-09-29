import React, { useEffect, useRef, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Check, Expand, LocateFixed, MapPin, Pencil, RotateCcw, Undo2, X } from 'lucide-react';
import { loadGeometryLibrary, loadGoogleMaps } from '../maps/googleMaps';
import { functions } from '../firebaseConfig';
import { getGoogleMapsErrorMessage, googleMapsConfig, googleMapsMissingMessage } from '../maps/googleMapsConfig';
import { buildProjectGeometry, normalizeProjectPolygon } from '../utils/projectGeometry';
import { CHAKAN_LOCATION, CHAKAN_MAP_POSITION } from '../utils/chakanLocation';
import ZoomBadge from './ZoomBadge';

const validCoordinate = (value) => Number.isFinite(Number(value));

export default function ProjectLocationPicker({
  latitude,
  longitude,
  layoutPolygon,
  onChange,
  onLayoutChange,
  autoDetectHighway = false,
  highwayName = '',
  highwayDistance = null,
  isHighwayTouch = false,
  onHighwayChange
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);
  const previewRef = useRef(null);
  const listenersRef = useRef([]);
  const drawingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const onHighwayChangeRef = useRef(onHighwayChange);
  const highwayRequestRef = useRef(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [error, setError] = useState('');
  const [mapStatus, setMapStatus] = useState(googleMapsConfig.isConfigured ? 'loading' : 'configuration-missing');
  const [zoomLevel, setZoomLevel] = useState(17);
  const [highwayStatus, setHighwayStatus] = useState('idle');
  const [detectedHighway, setDetectedHighway] = useState(() => highwayName ? { highwayName, highwayDistance, isHighwayTouch } : null);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onHighwayChangeRef.current = onHighwayChange; }, [onHighwayChange]);
  useEffect(() => { drawingRef.current = drawing; }, [drawing]);

  const publishLocation = (nextLatitude, nextLongitude) => {
    const nextLocation = { latitude: Number(nextLatitude), longitude: Number(nextLongitude) };
    onChangeRef.current?.(nextLocation);
    if (!autoDetectHighway) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setDetectedHighway(null);
      setHighwayStatus('unavailable');
      onHighwayChangeRef.current?.({ found: false, unavailable: true });
      return;
    }
    const requestId = ++highwayRequestRef.current;
    setHighwayStatus('checking');
    setDetectedHighway(null);
    httpsCallable(functions, 'detectNearestHighway')(nextLocation)
      .then(({ data }) => {
        if (requestId !== highwayRequestRef.current) return;
        const result = data?.found ? data : { found: false };
        setDetectedHighway(result.found ? result : null);
        setHighwayStatus(result.found ? 'ready' : result.unavailable ? 'unavailable' : 'empty');
        onHighwayChangeRef.current?.(result);
      })
      .catch((highwayError) => {
        if (requestId !== highwayRequestRef.current) return;
        if (import.meta.env.DEV) console.warn('[Zinoo Maps] Highway detection unavailable', highwayError?.code || highwayError?.message);
        setDetectedHighway(null);
        setHighwayStatus('unavailable');
        onHighwayChangeRef.current?.({ found: false });
      });
  };

  const clearOverlay = () => {
    polygonRef.current?.setMap(null);
    previewRef.current?.setMap(null);
    polygonRef.current = null;
    previewRef.current = null;
  };

  const showPolygon = (path, editable = false) => {
    const maps = window.google?.maps;
    if (!maps || !mapRef.current || path.length < 3) return;
    clearOverlay();
    const polygon = new maps.Polygon({
      map: mapRef.current,
      paths: path,
      strokeColor: '#2563eb',
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0.12,
      editable,
      draggable: editable,
      zIndex: 3
    });
    polygonRef.current = polygon;
    if (editable) {
      polygon.addListener('rightclick', (event) => {
        if (typeof event.vertex === 'number' && polygon.getPath().getLength() > 3) polygon.getPath().removeAt(event.vertex);
      });
    }
    const bounds = new maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    mapRef.current.fitBounds(bounds, 72);
  };

  useEffect(() => {
    let cancelled = false;
    if (!googleMapsConfig.isConfigured) {
      setError(googleMapsMissingMessage);
      setMapStatus('configuration-missing');
      return () => { cancelled = true; };
    }
    loadGoogleMaps().then((maps) => {
      if (cancelled || !containerRef.current) return;
      const position = validCoordinate(latitude) && validCoordinate(longitude)
        ? { lat: Number(latitude), lng: Number(longitude) }
        : CHAKAN_MAP_POSITION;
      const map = new maps.Map(containerRef.current, {
        center: position,
        zoom: 17,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        mapTypeId: maps.MapTypeId.HYBRID,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        rotateControl: false,
        gestureHandling: 'greedy',
        isFractionalZoomEnabled: true
      });
      map.setMapTypeId(maps.MapTypeId.HYBRID);
      const marker = new maps.marker.AdvancedMarkerElement({ map, position, gmpDraggable: true, title: 'Project entrance' });
      mapRef.current = map;
      setMapStatus('ready');
      markerRef.current = marker;
      listenersRef.current = [
        map.addListener('zoom_changed', () => {
          const nextZoom = Math.round((map.getZoom() ?? 17) * 10) / 10;
          setZoomLevel((currentZoom) => currentZoom === nextZoom ? currentZoom : nextZoom);
        }),
        map.addListener('click', (event) => {
          if (drawingRef.current) setDraftPoints((points) => [...points, event.latLng.toJSON()]);
          else publishLocation(event.latLng.lat(), event.latLng.lng());
        }),
        marker.addListener('dragend', (event) => publishLocation(event.latLng.lat(), event.latLng.lng()))
      ];
      const savedPath = normalizeProjectPolygon(layoutPolygon);
      if (savedPath.length >= 3) showPolygon(savedPath, false);
    }).catch((loadError) => {
      if (cancelled) return;
      console.error('[Zinoo Maps] Project location picker failed', {
        code: loadError?.code,
        message: loadError?.message,
        coordinates: { latitude, longitude }
      });
      setError(getGoogleMapsErrorMessage(loadError));
      setMapStatus('load-error');
    });
    return () => {
      cancelled = true;
      listenersRef.current.forEach((listener) => listener.remove());
      markerRef.current && (markerRef.current.map = null);
      clearOverlay();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !validCoordinate(latitude) || !validCoordinate(longitude)) return;
    const position = { lat: Number(latitude), lng: Number(longitude) };
    markerRef.current.position = position;
    if (!drawing && !layoutPolygon) mapRef.current.panTo(position);
  }, [drawing, latitude, layoutPolygon, longitude]);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    previewRef.current?.setMap(null);
    previewRef.current = null;
    if (!drawing || draftPoints.length === 0) return;
    const Overlay = draftPoints.length >= 3 ? window.google.maps.Polygon : window.google.maps.Polyline;
    previewRef.current = new Overlay({
      map: mapRef.current,
      ...(draftPoints.length >= 3 ? { paths: draftPoints, fillColor: '#3b82f6', fillOpacity: 0.12 } : { path: draftPoints }),
      strokeColor: '#60a5fa', strokeOpacity: 1, strokeWeight: 3, clickable: false
    });
  }, [draftPoints, drawing]);

  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => window.google.maps.event.trigger(mapRef.current, 'resize'), 0);
  }, [fullscreen]);

  const beginDrawing = () => {
    setError('');
    clearOverlay();
    setDraftPoints([]);
    setDrawing(true);
    setFullscreen(true);
  };

  const editSavedBoundary = () => {
    const path = normalizeProjectPolygon(layoutPolygon);
    if (path.length < 3) return beginDrawing();
    setFullscreen(true);
    setDrawing(false);
    showPolygon(path, true);
  };

  const finishDrawing = () => {
    if (draftPoints.length < 3) return setError('Add at least three boundary points.');
    setDrawing(false);
    previewRef.current?.setMap(null);
    showPolygon(draftPoints, true);
  };

  const saveBoundary = async () => {
    try {
      const path = polygonRef.current?.getPath().getArray().map((point) => point.toJSON()) || draftPoints;
      const maps = await loadGeometryLibrary();
      const geometry = buildProjectGeometry(path, maps);
      onLayoutChange?.(geometry);
      setDraftPoints([]);
      setDrawing(false);
      setFullscreen(false);
      showPolygon(normalizeProjectPolygon(geometry.layoutPolygon), false);
      setError('');
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const clearBoundary = () => {
    clearOverlay();
    setDraftPoints([]);
    setDrawing(false);
    onLayoutChange?.({ layoutPolygon: null, layoutCenter: null, layoutBounds: null, layoutAreaSqFt: null });
  };

  const resetToChakan = () => {
    setError('');
    publishLocation(CHAKAN_LOCATION.latitude, CHAKAN_LOCATION.longitude);
    mapRef.current?.panTo(CHAKAN_MAP_POSITION);
    mapRef.current?.setZoom(17);
  };

  return (
    <div className={`project-location-picker ${fullscreen ? 'project-location-picker-fullscreen' : ''}`}>
      <div className="project-location-picker-heading">
        <div><MapPin size={18} /><span>Project entrance and boundary</span></div>
        <div className="project-location-actions">
          <button type="button" className="btn-secondary seller-inline-button" onClick={editSavedBoundary}><Pencil size={16} /> Edit Boundary</button>
          <button type="button" className="btn-secondary seller-inline-button" onClick={() => setFullscreen(true)}><Expand size={16} /> Fullscreen</button>
          {fullscreen && <button type="button" className="btn-secondary seller-inline-button" onClick={() => setFullscreen(false)}><X size={16} /> Close</button>}
        </div>
      </div>
      {fullscreen && <div className="project-location-editor-toolbar">
        <button type="button" className="btn-primary seller-inline-button" onClick={beginDrawing}><Pencil size={16} /> Draw polygon</button>
        {layoutPolygon && <button type="button" className="btn-secondary seller-inline-button" onClick={editSavedBoundary}>Edit layout</button>}
        {drawing && <button type="button" className="btn-secondary seller-inline-button" disabled={draftPoints.length < 3} onClick={finishDrawing}><Check size={16} /> Finish</button>}
        {drawing && <button type="button" className="btn-secondary seller-inline-button" disabled={!draftPoints.length} onClick={() => setDraftPoints((points) => points.slice(0, -1))}><Undo2 size={16} /> Undo point</button>}
        <button type="button" className="btn-secondary seller-inline-button" onClick={clearBoundary}><RotateCcw size={16} /> Clear</button>
      </div>}
      <div className="project-location-map-frame">
        <div ref={containerRef} className="project-location-map" aria-label="Satellite map for the project entrance and boundary" />
        <ZoomBadge zoom={zoomLevel} />
        {mapStatus !== 'ready' && (
          <div className="project-location-map-state" role={mapStatus === 'loading' ? 'status' : 'alert'}>
            {mapStatus === 'loading' ? 'Loading map…' : error}
          </div>
        )}
      </div>
      <div className="project-location-editor-footer">
        <small>{drawing ? `Boundary points: ${draftPoints.length}. Click the satellite map to add points.` : 'The marker is the entrance. The polygon is the actual project boundary.'}</small>
        {fullscreen && polygonRef.current && <button type="button" className="btn-primary seller-inline-button" onClick={saveBoundary}><Check size={16} /> Save layout</button>}
      </div>
      {autoDetectHighway && highwayStatus === 'checking' && <div className="highway-detection-card" role="status">Checking nearest highway...</div>}
      {autoDetectHighway && highwayStatus === 'unavailable' && <div className="highway-detection-card" role="status">Nearest-highway lookup is currently unavailable.</div>}
      {autoDetectHighway && highwayStatus !== 'checking' && detectedHighway && (
        <section className="highway-detection-card" aria-label="Nearest highway">
          <div><span>Nearest Highway</span><strong>{detectedHighway.highwayName}</strong></div>
          <div><span>Distance</span><strong>{Math.round(Number(detectedHighway.highwayDistance))} m</strong></div>
          <div><span>Status</span><strong>{detectedHighway.isHighwayTouch ? 'Highway Touch' : 'Nearby'}</strong></div>
        </section>
      )}
      {error && mapStatus === 'ready' && <p className="seller-document-error" role="alert">{error}</p>}
    </div>
  );
}
