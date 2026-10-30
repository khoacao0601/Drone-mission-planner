// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from 'react';
import { PathLayer, ScatterplotLayer, LineLayer, PolygonLayer, DeckGL } from 'deck.gl';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useAuthStore } from '../store/useAuthStore';
import { useMissionStore } from '../store/useMissionStore';
import type { Waypoint } from '../types/missions';

const INITIAL_VIEW = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 15,
  pitch: 55,
  bearing: -20,
};

// Helper: Normalize input waypoints by sorting them circularly around their centroid
// This guarantees a clean convex perimeter polygon without self-intersecting hourglass shapes
const sortWaypointsByAngle = (points: Waypoint[]): Waypoint[] => {
  if (points.length < 3) return points;

  // 1. Calculate centroid (center point) of all waypoints
  const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;

  // 2. Sort points by polar angle using Math.atan2
  return [...points].sort((a, b) => {
    const angleA = Math.atan2(a.lat - centerLat, a.lng - centerLng);
    const angleB = Math.atan2(b.lat - centerLat, b.lng - centerLng);
    return angleA - angleB;
  });
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

  // Automatically order waypoints around perimeter regardless of user click sequence
  const orderedWaypoints = sortWaypointsByAngle(waypoints);
  const coordinates = orderedWaypoints.map((w) => [w.lng, w.lat, w.alt]);

  // 1. Semi-transparent area fill (>= 3 points)
  const polygonLayer = new PolygonLayer({
    id: 'area-fill',
    data: orderedWaypoints.length >= 3 ? [{ polygon: coordinates }] : [],
    getPolygon: (d: any) => d.polygon,
    getFillColor: [0, 240, 255, 35],
    stroked: false, // Disable default black outline of Deck.gl PolygonLayer
  });

  // 2. Vertical drop lines down to the ground
  const dropLinesLayer = new LineLayer({
    id: 'drop-lines',
    data: orderedWaypoints,
    getSourcePosition: (w) => [w.lng, w.lat, 0],
    getTargetPosition: (w) => [w.lng, w.lat, w.alt],
    getColor: [255, 215, 0],
    getWidth: 2.5,
  });

  // 3. 3D Flight path trajectory: Close loop around perimeter for complete circuit
  const closedFlightPath =
    orderedWaypoints.length >= 3 ? [...coordinates, coordinates[0]] : coordinates;

  const flightPathLayer = new PathLayer({
    id: 'flight-path',
    data: orderedWaypoints.length >= 2 ? [{ path: closedFlightPath }] : [],
    getPath: (d: any) => d.path,
    getColor: [0, 240, 255],
    getWidth: 4,
  });

  // 4. Waypoint markers: Tactical high-visibility amber-gold bullseye points
  const markersLayer = new ScatterplotLayer({
    id: 'markers',
    data: orderedWaypoints,
    getPosition: (w) => [w.lng, w.lat, w.alt],
    radiusUnits: 'pixels', // Fixed pixel size on screen across zoom levels
    getRadius: 7,
    getFillColor: [245, 158, 11, 255], // Luminous amber-gold center core
    stroked: true,
    getLineColor: [255, 255, 255, 255], // Crisp white outer ring
    getLineWidth: 2,
    lineWidthUnits: 'pixels',
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