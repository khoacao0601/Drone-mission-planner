// Copyright (c) 2026 Khoa Cao. All rights reserved.

import type { Waypoint } from "../types/missions";

// 1. Helper: Sort polygon vertices circularly around centroid
export const sortWaypointsByAngle = (points: Waypoint[]): Waypoint[] => {
  if (points.length < 3) return points;

  const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;

  const sorted = [...points].sort((a, b) => {
    const angleA = Math.atan2(a.lat - centerLat, a.lng - centerLng);
    const angleB = Math.atan2(b.lat - centerLat, b.lng - centerLng);
    return angleA - angleB;
  });

  const startIndex = sorted.indexOf(points[0]);
  if (startIndex > 0) {
    return [...sorted.slice(startIndex), ...sorted.slice(0, startIndex)];
  }
  return sorted;
};

// 2. Generate Edge-Aligned Lawnmower flight path (parallel to edge START -> 2)
export const generateSurveyGrid = (
  waypoints: Waypoint[],
  spacingMeters: number = 25,
): Waypoint[] => {
  if (waypoints.length < 3) return [];

  const polygon = sortWaypointsByAngle(waypoints);
  const alt = polygon[0].alt;
  const origin = polygon[0];

  // Conversion factors between degrees and meters at this latitude
  const metersPerLat = 111320;
  const metersPerLng = 111320 * Math.cos((origin.lat * Math.PI) / 180);

  // 1. Convert polygon vertices to local meter coordinates (x, y) relative to START
  const localPoly = polygon.map((p) => ({
    x: (p.lng - origin.lng) * metersPerLng,
    y: (p.lat - origin.lat) * metersPerLat,
  }));

  // 2. Find angle of the first edge (START -> point 2) so sweep lines run parallel to it
  const edgeDx = localPoly[1].x - localPoly[0].x;
  const edgeDy = localPoly[1].y - localPoly[0].y;
  const angle = Math.atan2(edgeDy, edgeDx);
  const cosA = Math.cos(-angle);
  const sinA = Math.sin(-angle);

  // 3. Rotate polygon by -angle so edge (START -> 2) becomes completely horizontal
  const rotatedPoly = localPoly.map((p) => ({
    u: p.x * cosA - p.y * sinA,
    v: p.x * sinA + p.y * cosA,
  }));

  const vs = rotatedPoly.map((p) => p.v);
  const minV = Math.min(...vs);
  const maxV = Math.max(...vs);
  const stepMeters = Math.max(5, spacingMeters);

  // Determine sweep direction away from START (v = 0)
  // If polygon body lies in positive v, sweep 0 -> maxV; otherwise sweep 0 -> minV
  const sweepDir = Math.abs(maxV) >= Math.abs(minV) ? 1 : -1;
  const maxDistV = sweepDir === 1 ? maxV : Math.abs(minV);

  // Always start the flight path directly at the START waypoint!
  const gridWaypoints: Waypoint[] = [{ ...origin, alt }];
  let rowIndex = 0;

  const cosBack = Math.cos(angle);
  const sinBack = Math.sin(angle);

  const toLngLat = (u: number, v: number): Waypoint => {
    const x = u * cosBack - v * sinBack;
    const y = u * sinBack + v * cosBack;
    return {
      lng: origin.lng + x / metersPerLng,
      lat: origin.lat + y / metersPerLat,
      alt,
    };
  };

  // Sweep outward from START edge (d = stepMeters * 0.5 up to maxDistV)
  for (let d = stepMeters * 0.5; d < maxDistV; d += stepMeters) {
    const v = d * sweepDir;
    const intersectionsU: number[] = [];

    for (let i = 0; i < rotatedPoly.length; i++) {
      const p1 = rotatedPoly[i];
      const p2 = rotatedPoly[(i + 1) % rotatedPoly.length];

      const isCrossing = (p1.v <= v && p2.v > v) || (p2.v <= v && p1.v > v);

      if (isCrossing) {
        const ratio = (v - p1.v) / (p2.v - p1.v);
        const intersectU = p1.u + ratio * (p2.u - p1.u);
        intersectionsU.push(intersectU);
      }
    }

    intersectionsU.sort((a, b) => a - b);

    if (intersectionsU.length >= 2) {
      const leftU = intersectionsU[0];
      const rightU = intersectionsU[intersectionsU.length - 1];

      // Row 0 starts near START (u = 0, which is on the leftU side) and flies toward Point 2 (rightU)
      if (rowIndex % 2 === 0) {
        gridWaypoints.push(toLngLat(leftU, v));
        gridWaypoints.push(toLngLat(rightU, v));
      } else {
        gridWaypoints.push(toLngLat(rightU, v));
        gridWaypoints.push(toLngLat(leftU, v));
      }
      rowIndex++;
    }
  }

  return gridWaypoints;
};

// 3. Helper: Sample small white camera trigger dots along the survey lines (works for any angle)
export const generateGridDots = (
  gridWaypoints: Waypoint[],
  dotSpacingMeters: number = 15,
): Waypoint[] => {
  const dots: Waypoint[] = [];
  const stepDeg = Math.max(5, dotSpacingMeters) / 111320;

  for (let i = 1; i < gridWaypoints.length - 1; i += 2) {
    const start = gridWaypoints[i];
    const end = gridWaypoints[i + 1];
    const dLng = end.lng - start.lng;
    const dLat = end.lat - start.lat;
    const distDeg = Math.hypot(dLng, dLat);
    const numSteps = Math.floor(distDeg / stepDeg);

    for (let s = 1; s < numSteps; s++) {
      const ratio = s / numSteps;
      dots.push({
        lng: start.lng + ratio * dLng,
        lat: start.lat + ratio * dLat,
        alt: start.alt,
      });
    }
  }
  return dots;
};

// 4. Helper: Generate 3D chevron direction arrows (>) along the flight path
export const generateDirectionArrows = (
  gridWaypoints: Waypoint[],
  arrowSizeMeters: number = 9,
): [number, number, number][][] => {
  if (gridWaypoints.length < 2) return [];

  const arrows: [number, number, number][][] = [];
  const metersPerLat = 111320;
  const metersPerLng =
    111320 * Math.cos((gridWaypoints[0].lat * Math.PI) / 180);

  // Place direction arrows along each sweep segment (pairs: 1->2, 3->4, 5->6...)
  for (let i = 1; i < gridWaypoints.length - 1; i += 2) {
    const start = gridWaypoints[i];
    const end = gridWaypoints[i + 1];

    const dx = (end.lng - start.lng) * metersPerLng;
    const dy = (end.lat - start.lat) * metersPerLat;
    const segmentLength = Math.hypot(dx, dy);
    if (segmentLength < arrowSizeMeters * 3) continue;

    // Unit direction vector (ux, uy) and perpendicular vector (px, py)
    const ux = dx / segmentLength;
    const uy = dy / segmentLength;
    const px = -uy;
    const py = ux;

    // Place 2 arrows per sweep line (at 35% and 65% of the line)
    for (const ratio of [0.35, 0.65]) {
      const tipLng = start.lng + (end.lng - start.lng) * ratio;
      const tipLat = start.lat + (end.lat - start.lat) * ratio;
      const alt = start.alt;

      // Elongated narrow wings + swept-back tail notch (4-point tactical dart: ➢)
      const backX = -ux * arrowSizeMeters;
      const backY = -uy * arrowSizeMeters;
      const wingSpan = arrowSizeMeters * 0.35; // Narrow width so the front tip is unmistakably sharp

      // Indented tail notch (65% back from tip) so the back has a clear V-cutout
      const notchX = -ux * (arrowSizeMeters * 0.65);
      const notchY = -uy * (arrowSizeMeters * 0.65);

      const leftWing: [number, number, number] = [
        tipLng + (backX + px * wingSpan) / metersPerLng,
        tipLat + (backY + py * wingSpan) / metersPerLat,
        alt,
      ];
      const tip: [number, number, number] = [tipLng, tipLat, alt];
      const rightWing: [number, number, number] = [
        tipLng + (backX - px * wingSpan) / metersPerLng,
        tipLat + (backY - py * wingSpan) / metersPerLat,
        alt,
      ];
      const tailNotch: [number, number, number] = [
        tipLng + notchX / metersPerLng,
        tipLat + notchY / metersPerLat,
        alt,
      ];

      arrows.push([leftWing, tip, rightWing, tailNotch]);
    }
  }

  return arrows;
};
