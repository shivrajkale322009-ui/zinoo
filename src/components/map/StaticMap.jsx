import React, { useMemo, useState } from 'react';
import { Layers, MapPin } from 'lucide-react';
import { getProjectCoordinates, isProjectPublishable } from '../../utils/projectVisibility';
import { CHAKAN_MAP_POSITION } from '../../utils/chakanLocation';
import '../../maps/mapScreen.css';

const LATITUDE_SPAN = 0.18;
const LONGITUDE_SPAN = 0.22;

const markerPosition = (project) => {
  const point = getProjectCoordinates(project);
  if (!point) return null;
  const left = 50 + ((point.lng - CHAKAN_MAP_POSITION.lng) / LONGITUDE_SPAN) * 100;
  const top = 50 - ((point.lat - CHAKAN_MAP_POSITION.lat) / LATITUDE_SPAN) * 100;
  return { left: `${Math.max(5, Math.min(95, left))}%`, top: `${Math.max(7, Math.min(93, top))}%` };
};

export default function StaticMap({ projects = [], onActivate, onSelectProject }) {
  const [imageFailed, setImageFailed] = useState(false);
  const markers = useMemo(() => projects.filter(isProjectPublishable).map((project) => ({ project, position: markerPosition(project) })).filter((item) => item.position).slice(0, 30), [projects]);

  const activate = () => onActivate?.();
  return <div
    className="zinoo-map-screen-wrapper zinoo-static-map"
    role="application"
    aria-label="Static map of the Chakan service area. Interact to open the live map."
    tabIndex={0}
    onPointerDown={activate}
    onWheel={activate}
    onKeyDown={(event) => { if (['Enter', ' ', '+', '-'].includes(event.key)) activate(); }}
  >
    {!imageFailed && <img src="/maps/chakan-map.webp" alt="Satellite view of the Zinoo Chakan service area" draggable="false" loading="eager" decoding="async" onError={() => setImageFailed(true)} />}
    {imageFailed && <div className="zinoo-static-map-fallback"><MapPin size={28} /><span>Chakan service area</span></div>}
    <div className="zinoo-static-markers" aria-label="Projects on map">
      {markers.map(({ project, position }) => <button
        key={project.id || project.name}
        type="button"
        className="zinoo-static-marker"
        style={position}
        aria-label={`Open ${project.name || 'project'} on interactive map`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => { onSelectProject?.(project); activate(); }}
      ><MapPin size={18} /></button>)}
    </div>
    <div className="map-floating-overlay-container" aria-hidden="true">
      <div className="map-top-right-controls">
        <button type="button" className="floating-circle-btn" tabIndex={-1}><Layers size={19} /></button>
      </div>
    </div>
  </div>;
}
