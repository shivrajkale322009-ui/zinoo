import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon references in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Component to update map center dynamically
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function BuyerMap({ projects, onSelectProject, selectedProject }) {
  // Chakan coordinates
  const chakanCenter = [18.7889, 73.8568];
  
  // Decide map center
  const mapCenter = selectedProject && selectedProject.coords 
    ? selectedProject.coords 
    : chakanCenter;
    
  const mapZoom = selectedProject ? 14 : 12;

  // Custom marker creation
  const createCustomIcon = (project) => {
    const isActive = project.status === 'Active';
    const markerColorClass = isActive ? 'marker-active' : 'marker-sold';
    const pulseHtml = isActive ? '<div class="marker-pulse"></div>' : '';

    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px;">
          ${pulseHtml}
          <div class="marker-pin ${markerColorClass}"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false} // Custom placing zoom controls later
      >
        <ChangeMapView center={mapCenter} zoom={mapZoom} />
        
        {/* Sleek Dark Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {projects.map((project) => (
          <Marker
            key={project.id}
            position={project.coords}
            icon={createCustomIcon(project)}
            eventHandlers={{
              click: () => {
                // Short timeout to let popup animation finish if needed, or directly open detail
                setTimeout(() => onSelectProject(project), 100);
              },
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {project.name}
                </strong>
                <span style={{ fontSize: '10px', color: 'var(--brand-primary)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  Starting ₹{(project.startingPrice / 100000).toFixed(1)} Lakh
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(project);
                  }}
                  style={{
                    background: 'var(--brand-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom Zoom Control Indicator on Map */}
      <div 
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '16px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '4px 10px',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)'
        }}
      >
        Chakan, Pune (10km Radius)
      </div>
    </div>
  );
}

export default BuyerMap;
