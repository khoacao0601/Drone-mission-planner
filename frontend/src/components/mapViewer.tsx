// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from 'react';
import { PathLayer, ScatterplotLayer, LineLayer, PolygonLayer, DeckGL} from 'deck.gl';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useAuthStore } from '../store/useAuthStore';
import { useMissionStore } from '../store/useMissionStore';

const INITIAL_VIEW = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 15,
  pitch: 55,
  bearing: -20,
};

export const MapViewer: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { waypoints, addWayPoint, altitude } = useMissionStore();

  // Add waypoint when Admin clicks on the map
  const handleMapClick = (info: any) => {
    if (user?.role !== 'ADMIN' || !info.coordinate) return;
    const [lng, lat] = info.coordinate;
    addWayPoint({ lng, lat, alt: altitude });
  };

  // 1. Semi-transparent area fill (>= 3 points)
  const polygonLayer = new PolygonLayer({
    id: 'area-fill',
    data: waypoints.length >= 3 ? [{ polygon: waypoints.map((w) => [w.lng, w.lat, w.alt]) }] : [],
    getPolygon: (d: any) => d.polygon,
    getFillColor: [0, 240, 255, 40],
  });

  // 2. Vertical drop lines down to the ground
  const dropLinesLayer = new LineLayer({
    id: 'drop-lines',
    data: waypoints,
    getSourcePosition: (w) => [w.lng, w.lat, 0],
    getTargetPosition: (w) => [w.lng, w.lat, w.alt],
    getColor: [255, 215, 0],
    getWidth: 3,
  });

  // 3. 3D Flight path trajectory
  const flightPathLayer = new PathLayer({
    id: 'flight-path',
    data: waypoints.length >= 2 ? [{ path: waypoints.map((w) => [w.lng, w.lat, w.alt]) }] : [],
    getPath: (d: any) => d.path,
    getColor: [0, 240, 255],
    getWidth: 4,
  });

  // 4. Waypoint spherical markers
  const markersLayer = new ScatterplotLayer({
    id: 'markers',
    data: waypoints,
    getPosition: (w) => [w.lng, w.lat, w.alt],
    getFillColor: [255, 255, 255],
    getRadius: 8,
  });

  return (
    <div className="relative w-full h-full bg-slate-950">
      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller={true}
        layers={[dropLinesLayer, polygonLayer, flightPathLayer, markersLayer]}
        onClick={handleMapClick}
        getCursor={() => (user?.role === 'ADMIN' ? 'crosshair' : 'default')}
      >
        <Map
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          attributionControl={false}
        />
      </DeckGL>
    </div>
  );
};