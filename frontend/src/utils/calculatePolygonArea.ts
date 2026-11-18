// Copyright (c) 2026 Khoa Cao. All rights reserved.

import type { Waypoint } from "../types/missions";

// Radius in meter
const EARTH_RADIUS_METERS = 6371000;

export const calculatePolygonArea = (waypoints: Waypoint[]): number => {
    if(waypoints.length < 3){
        return 0;
    }

    const origin = waypoints[0];

    // 1 degree to meter
    const metersPerDeg = EARTH_RADIUS_METERS * (Math.PI / 180);

    const originLatRad = origin.lat * (Math.PI / 180);

    const points = waypoints.map((wp) => { 
        const x = (wp.lng - origin.lng) * metersPerDeg * Math.cos(originLatRad); // * Math.cos(originLatRad) to cover the Earth Curve
        const y = (wp.lat - origin.lat) * metersPerDeg;
        return { x, y };
    })
    

    // Shoelace formular
    let sum = 0;
    for(let i = 0; i < points.length; i++){
        const current = points[i];
        const next = points[(i + 1) % points.length]; // % points.length so the last waypoint can connect with waypoint[0] to become a close area

        sum += current.x * next.y - next.x * current.y;
    }

    return Math.abs(sum) / 2;
}