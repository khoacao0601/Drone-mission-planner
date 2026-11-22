// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState, useEffect } from "react";
import {
  PathLayer,
  ScatterplotLayer,
  LineLayer,
  PolygonLayer,
  DeckGL,
  FlyToInterpolator,
  TextLayer,
} from "deck.gl";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { useAuthStore } from "../store/useAuthStore";
import { useMissionStore } from "../store/useMissionStore";
import type { Waypoint } from "../types/missions";
import type { MapViewState } from "deck.gl";

import {
  sortWaypointsByAngle,
  generateSurveyGrid,
  generateGridDots,
  generateDirectionArrows,
} from "../utils/generateGridforFlighPath";

const INITIAL_VIEW = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 15,
  pitch: 55,
  bearing: -20,
};

const getWaypointLabel = (
  w: Waypoint,
  index: number,
  firstWaypoint: Waypoint | undefined,
  totalCount: number,
  isAreaMission: boolean,
): string => {
  if (w === firstWaypoint) return "START";
  if (!isAreaMission && index === totalCount - 1) return "END";
  return String(index + 1);
};

export const MapViewer: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const {
    waypoints,
    addWayPoint,
    altitude,
    selectedMission,
    missionType,
    gridSpacing,
  } = useMissionStore();
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW);

  useEffect(() => {
    if (!selectedMission || selectedMission.waypoints.length === 0) {
      return;
    }

    const points = selectedMission.waypoints;
    const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
    const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;

    setViewState(() => ({
      longitude: centerLng,
      latitude: centerLat,
      zoom: 16,
      pitch: 55,
      bearing: -20,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator(),
    }));
  }, [selectedMission]);

  // Add waypoint when Admin clicks on the map
  const handleMapClick = (info: any) => {
    if (user?.role !== "ADMIN" || selectedMission || !info.coordinate) return;
    const [lng, lat] = info.coordinate;
    addWayPoint({ lng, lat, alt: altitude });
  };

  // Automatically order waypoints around perimeter regardless of user click sequence
  const activeMissionType = selectedMission
    ? selectedMission.mission_type
    : missionType;
  const isAreaMission = activeMissionType === "AREA";

  const orderedWaypoints = isAreaMission
    ? sortWaypointsByAngle(waypoints)
    : waypoints;
  const coordinates = orderedWaypoints.map((w) => [w.lng, w.lat, w.alt]);
  const surveyGridWaypoints = isAreaMission
    ? generateSurveyGrid(orderedWaypoints, gridSpacing)
    : [];
  const surveyGridCoordinates = surveyGridWaypoints.map((w) => [
    w.lng,
    w.lat,
    w.alt,
  ]);
  const surveyDots = isAreaMission
    ? generateGridDots(surveyGridWaypoints, gridSpacing * 0.6)
    : [];
  const surveyArrows = isAreaMission
    ? generateDirectionArrows(surveyGridWaypoints)
    : [];
  const displayLat = orderedWaypoints[0]?.lat ?? viewState.latitude;
  const displayLng = orderedWaypoints[0]?.lng ?? viewState.longitude;
  const displayAlt = selectedMission
    ? selectedMission.flight_altitude
    : altitude;
  const surveyArrowsLayer = new PolygonLayer({
    id: "survey-direction-arrows",
    data: surveyArrows,
    getPolygon: (d: any) => d,
    getFillColor: [250, 204, 21, 255], // High-contrast tactical yellow/gold arrowhead
    stroked: true,
    getLineColor: [15, 23, 42, 255], // Dark slate outline so it pops on any satellite map
    getLineWidth: 1.5,
    lineWidthUnits: "pixels",
  });

  // 1. Semi-transparent area fill (>= 3 points, AREA only)
  const polygonLayer = new PolygonLayer({
    id: "area-fill",
    data:
      isAreaMission && orderedWaypoints.length >= 3
        ? [{ polygon: coordinates }]
        : [],
    getPolygon: (d: any) => d.polygon,
    getFillColor: [0, 240, 255, 35],
    stroked: false, // Disable default black outline of Deck.gl PolygonLayer
  });

  // 2. Vertical drop lines down to the ground (both AREA and LINEAR)
  const dropLinesLayer = new LineLayer({
    id: "drop-lines",
    data: orderedWaypoints,
    getSourcePosition: (w) => [w.lng, w.lat, 0],
    getTargetPosition: (w) => [w.lng, w.lat, w.alt],
    getColor: (w: Waypoint) =>
      w === waypoints[0] ? [16, 185, 129] : [255, 215, 0],
    updateTriggers: { getColor: [waypoints] },
    getWidth: 2.5,
  });

  // 3. 3D Flight path trajectory: Close loop around perimeter for complete circuit
  const flightPathCoordinates =
    isAreaMission && orderedWaypoints.length >= 3
      ? [...coordinates, coordinates[0]]
      : coordinates;

  const flightPathLayer = new PathLayer({
    id: "flight-path",
    data: orderedWaypoints.length >= 2 ? [{ path: flightPathCoordinates }] : [],
    getPath: (d: any) => d.path,
    getColor: isAreaMission ? [16, 185, 129, 255] : [0, 240, 255, 255],
    widthUnits: "pixels",
    getWidth: isAreaMission ? 3.5 : 8.5,
    capRounded: true,
    jointRounded: true,
  });

  // 3b. Internal Lawnmower Survey Grid Path (Blue zigzag inside AREA polygon)
  const surveyGridLayer = new PathLayer({
    id: "survey-grid-path",
    data: surveyGridCoordinates.length >= 2 ? [{ path: surveyGridCoordinates }] : [],
    getPath: (d: any) => d.path,
    getColor: [37, 99, 235, 255], // Vibrant tactical blue
    widthUnits: "pixels",
    getWidth: 3.5,
    capRounded: true,
    jointRounded: true,
  });

  // 3c. White camera trigger dots along the blue survey lines
  const surveyDotsLayer = new ScatterplotLayer({
    id: "survey-grid-dots",
    data: surveyDots,
    getPosition: (w: Waypoint) => [w.lng, w.lat, w.alt],
    radiusUnits: "pixels",
    getRadius: 2.5,
    getFillColor: [255, 255, 255, 230],
  });

  // 4. Waypoint markers: Tactical high-visibility amber-gold bullseye points
  const markersLayer = new ScatterplotLayer({
    id: "markers",
    data: orderedWaypoints,
    getPosition: (w) => [w.lng, w.lat, w.alt],
    radiusUnits: "pixels", // Fixed pixel size on screen across zoom levels
    getRadius: (w: Waypoint) => (w === waypoints[0] ? 10 : 7),
    getFillColor: (w: Waypoint) =>
      w === waypoints[0] ? [16, 185, 129, 255] : [245, 158, 11, 255], // Luminous amber-gold center core
    stroked: true,
    getLineColor: [255, 255, 255, 255], // Crisp white outer ring
    getLineWidth: 2,
    lineWidthUnits: "pixels",
    updateTriggers: { getRadius: [waypoints], getFillColor: [waypoints] },
  });

  const labelsLayer = new TextLayer({
    id: "waypoint-labels",
    data: orderedWaypoints,
    getPosition: (w: Waypoint) => [w.lng, w.lat, w.alt],
    getText: (w: Waypoint, { index }: { index: number }) =>
      getWaypointLabel(
        w,
        index,
        waypoints[0],
        orderedWaypoints.length,
        isAreaMission,
      ),
    getSize: 13,
    fontWeight: "bold",
    getColor: [255, 255, 255, 255],
    getPixelOffset: [0, -18],
    background: true,
    backgroundPadding: [4, 2],
    getBackgroundColor: (w: Waypoint) =>
      w === waypoints[0] ? [6, 95, 70, 220] : [18, 12, 8, 180],
    updateTriggers: { getText: [waypoints], getBackgroundColor: [waypoints] },
  });

  return (
    <div className="relative w-full h-full bg-slate-950">
      {/* Top Map Telemetry Strip (Flyby Prototype UI Style) */}
      <div className="absolute top-3 left-[408px] right-3 z-10 flex justify-between items-center bg-[#181a1f]/85 backdrop-blur-md border border-[#2e333d] px-3.5 py-1.5 rounded-lg text-[11px] font-mono text-[#9ca3af] select-none pointer-events-none shadow-lg">
        <div className="flex items-center gap-4">
          <span>
            LAT:{" "}
            <strong className="text-[#e5e7eb]">{displayLat.toFixed(4)}</strong>
          </span>
          <span>
            LNG:{" "}
            <strong className="text-[#e5e7eb]">{displayLng.toFixed(4)}</strong>
          </span>
          <span>
            MODE: <strong className="text-[#60a5fa]">REL_TAKEOFF</strong>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#38bdf8] font-semibold">
            ALT: {displayAlt}m
          </span>
          <span>WGS 84</span>
        </div>
      </div>
      <DeckGL
        viewState={viewState}
        controller={true}
        layers={[
          dropLinesLayer,
          polygonLayer,
          flightPathLayer,
          surveyGridLayer,
          surveyDotsLayer,
          markersLayer,
          labelsLayer,
          surveyArrowsLayer,
        ]}
        onClick={handleMapClick}
        getCursor={() =>
          user?.role === "ADMIN" && !selectedMission ? "crosshair" : "default"
        }
        onViewStateChange={({ viewState: nextViewState }) =>
          setViewState(nextViewState as MapViewState)
        }
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
