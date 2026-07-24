import React, { useEffect, useRef, useState } from 'react';
import { Check, Expand, LocateFixed, MapPin, Pencil, RotateCcw, Undo2, X } from 'lucide-react';
import { loadGoogleMaps } from '../maps/googleMaps';
import { googleMapsConfig, googleMapsMissingMessage, googleMapsUnavailableMessage } from '../maps/googleMapsConfig';
import { buildProjectGeometry, normalizeProjectPolygon } from '../utils/projectGeometry';
import { CHAKAN_LOCATION, CHAKAN_MAP_POSITION } from '../utils/chakanLocation';

const validCoordinate = (value) => Number.isFinite(Number(value));

export default function ProjectLocationPicker({ latitude, longitude, layoutPolygon, onChange, onLayoutChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);
  const previewRef = useRef(null);
  const listenersRef = useRef([]);
  const drawingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [error, setError] = useState('');
  const [mapStatus, setMapStatus] = useState(googleMapsConfig.isConfigured ? 'loading' : 'configuration-missing');

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { drawingRef.current = drawing; }, [drawing]);

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
        gestureHandling: 'greedy'
      });
      map.setMapTypeId(maps.MapTypeId.HYBRID);
      const marker = new maps.marker.AdvancedMarkerElement({ map, position, gmpDraggable: true, title: 'Project entrance' });
      mapRef.current = map;
      setMapStatus('ready');
      markerRef.current = marker;
      const publish = (location) => onChangeRef.current?.({ latitude: location.lat(), longitude: location.lng() });
      listenersRef.current = [
        map.addListener('click', (event) => {
          if (drawingRef.current) setDraftPoints((points) => [...points, event.latLng.toJSON()]);
          else publish(event.latLng);
        }),
        marker.addListener('dragend', (event) => publish(event.latLng))
      ];
      const savedPath = normalizeProjectPolygon(layoutPolygon);
      if (savedPath.length >= 3) showPolygon(savedPath, false);
    }).catch(() => {
      if (cancelled) return;
      setError(googleMapsUnavailableMessage);
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

  const saveBoundary = () => {
    try {
      const path = polygonRef.current?.getPath().getArray().map((point) => point.toJSON()) || draftPoints;
      const geometry = buildProjectGeometry(path, window.google.maps);
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
    onChangeRef.current?.(CHAKAN_LOCATION);
    mapRef.current?.panTo(CHAKAN_MAP_POSITION);
    mapRef.current?.setZoom(17);
  };

  return (
    <div className={`project-location-picker ${fullscreen ? 'project-location-picker-fullscreen' : ''}`}>
      <div className="project-location-picker-heading">
        <div><MapPin size={18} /><span>Project entrance and boundary</span></div>
        <div className="project-location-actions">
          <button type="button" className="btn-secondary seller-inline-button" onClick={resetToChakan}><LocateFixed size={16} /> Reset to Chakan</button>
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
      {error && mapStatus === 'ready' && <p className="seller-document-error" role="alert">{error}</p>}
    </div>
  );
}
