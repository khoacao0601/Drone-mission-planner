// Copyright (c) 2026 Khoa Cao. All rights reserved.

// Calculate total distance from all waypoints

import type { Waypoint } from "../types/missions";

// Radius in meter
const EARTH_RADIUS_METERS = 6371000;

export const calculateDistanceMeters = (waypoints: Waypoint[]): number => {

    if(waypoints.length < 2){
        return 0;
    }

    let totalDistance = 0;

    for(let i = 0; i < waypoints.length - 1; i++){
        const p1 = waypoints[i];
        const p2 = waypoints[i + 1];

        const dLat = toRad(p2.lat - p1.lat);
        const dLng = toRad(p2.lng - p1.lng);

        const lat1 = toRad(p1.lat);
        const lat2 = toRad(p2.lat);

        // Haversine formula
        const a1 = Math.sin(dLat / 2) ** 2;
        const a2 = Math.cos(lat1) * Math.cos(lat2) * (Math.sin(dLng / 2) ** 2);
        const a = a1 + a2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Convert 2D to 3D
        const d2d = EARTH_RADIUS_METERS * c;
        const dAlt = p2.alt - p1.alt;
        const segmentDistance = Math.hypot(d2d, dAlt);
        totalDistance = segmentDistance + totalDistance;
    }
    return totalDistance;
}

const toRad = (deg: number) => {
    return deg * (Math.PI / 180);
}