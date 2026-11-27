// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState, useEffect } from "react";
import type { MissionDetailsCardProps, MissionStatus } from "../types/missions";
import { useAuthStore } from "../store/useAuthStore";
import { StatusBadge } from "./statusBadge";
import { formatDateTime, formatAltitudeMode } from "../utils/formatters";

export const MissionDetailsCard: React.FC<MissionDetailsCardProps> = ({
  mission,
  isAdmin,
  drones = [],
  onPlanNewRoute,
  onStatusChange,
}) => {
  const user = useAuthStore((s) => s.user);
  const takeoffPoint = mission.waypoints[0];

  // Drones currently picked up from the depot by this operator
  const myPickedUpDrones = drones.filter(
    (d) =>
      d.status === "IN_MISSION" &&
      (isAdmin || d.current_operator_id === user?.id),
  );

  // Check if the mission's assigned drone is already in the operator's picked-up list
  const isAssignedDronePickedUp = mission.drone_id
    ? myPickedUpDrones.some((d) => d.id === mission.drone_id)
    : false;

  const [selectedDroneId, setSelectedDroneId] = useState<string>("");

  useEffect(() => {
    if (isAssignedDronePickedUp && mission.drone_id) {
      setSelectedDroneId(String(mission.drone_id));
    } else if (myPickedUpDrones.length > 0) {
      setSelectedDroneId(String(myPickedUpDrones[0].id));
    } else {
      setSelectedDroneId("");
    }
  }, [mission.id, mission.drone_id, isAssignedDronePickedUp, drones.length]);

  const isAlternativeLog = mission.description?.startsWith("Assigned Drone:");

  return (
    <div className="space-y-3.5 border-b border-white/15 pb-4">
      {/* 1. Header Row: Back Button + Mission Title + Badges */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onPlanNewRoute}
            className="text-[#d1d5db] hover:text-white w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs cursor-pointer transition flex items-center justify-center shrink-0 mt-0.5"
            title="Return to Route Planning"
          >
            ←
          </button>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-white leading-tight truncate">
              {mission.name}
            </h3>
            <div className="text-[11px] text-slate-200 mt-0.5">
              Created: {formatDateTime(mission.created_at)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-white/15 text-white border border-white/20">
            {mission.mission_type}
          </span>
          <StatusBadge status={mission.status} />
        </div>
      </div>

      {/* Audit Note if Alternative Drone was used, otherwise normal description */}
      {mission.description && (
        <div
          className={`text-[11px] rounded-xl border px-3 py-2 ${
            isAlternativeLog
              ? "bg-amber-500/10 border-amber-500/30 text-amber-200 space-y-1"
              : "text-slate-200 border-white/10 bg-white/5"
          }`}
        >
          {isAlternativeLog
            ? mission.description.split(" | ").map((line) => (
                <div key={line} className="font-medium">
                  • {line}
                </div>
              ))
            : mission.description}
        </div>
      )}

      {/* 2. Flat 2x2 Technical Specs Grid with Hairline Dividers */}
      <div className="border-y border-white/15 divide-y divide-white/15">
        <div className="grid grid-cols-2">
          <div className="py-2.5 pr-3">
            <span className="text-[11px] font-medium text-slate-200 block">Altitude</span>
            <span className="font-mono tabular-nums font-semibold text-amber-400 text-xs mt-0.5 block">
              {mission.flight_altitude}m{" "}
              {formatAltitudeMode(mission.altitude_mode)}
            </span>
          </div>
          <div className="py-2.5 pl-3 border-l border-white/15">
            <span className="text-[11px] font-medium text-slate-200 block">Speed</span>
            <span className="font-mono tabular-nums font-semibold text-[#38bdf8] text-xs mt-0.5 block whitespace-nowrap">
              {mission.horizontal_speed} m/s (
              {Math.round(mission.horizontal_speed * 3.6)} km/h)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="py-2.5 pr-3 min-w-0">
            <span className="text-[11px] font-medium text-slate-200 block">Pilot</span>
            <span className="font-medium text-white text-xs mt-0.5 block truncate">
              {mission.assigned_to ? mission.assigned_to.email : "Unassigned"}
            </span>
          </div>
          <div className="py-2.5 pl-3 border-l border-white/15">
            <span className="text-[11px] font-medium text-slate-200 block">Takeoff</span>
            <span className="font-mono tabular-nums text-white text-xs mt-0.5 block whitespace-nowrap">
              {takeoffPoint
                ? `${takeoffPoint.lat.toFixed(4)}, ${takeoffPoint.lng.toFixed(4)}`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Assigned Drone Row */}
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-medium text-slate-300 block">
            {isAlternativeLog ? "Active Alternative Drone" : "Assigned Drone"}
          </span>
          <span className="font-semibold text-white text-sm mt-1 block truncate">
            {mission.drone ? mission.drone.name : "Any Drone (Pilot Choice)"}
          </span>
        </div>
        {mission.drone && (
          <span className="font-mono tabular-nums text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap shrink-0">
            {mission.drone.battery_level}% • {mission.drone.serial_number}
          </span>
        )}
      </div>

      {/* 4. Compact Drone Readiness / Selection Callout */}
      {mission.status === "ASSIGNED" && (
        <div className="space-y-2">
          {myPickedUpDrones.length === 0 ? (
            <div className="flex items-start gap-2 text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/25 px-3 py-2 rounded-xl leading-relaxed">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>
                No drone picked up yet. Check out a unit in{" "}
                <strong className="text-white">Fleet Dispatch</strong> before
                starting.
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#9ca3af] block">
                {mission.drone && !isAssignedDronePickedUp
                  ? "Alternative Picked-Up Drone (Notify Admin)"
                  : "Deploy With Picked-Up Drone"}
              </label>
              <select
                value={selectedDroneId}
                onChange={(e) => setSelectedDroneId(e.target.value)}
                className="w-full bg-[#0b0d12]/60 px-2.5 py-1.5 rounded-lg border border-white/15 focus:border-[#2563eb] text-[#e5e7eb] text-xs outline-none cursor-pointer"
              >
                {myPickedUpDrones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.serial_number}) • {d.battery_level}%
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* 5. Admin Controls */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={onPlanNewRoute}
            className="bg-white/10 hover:bg-white/15 active:scale-[0.99] text-[#e5e7eb] py-1.5 px-2.5 rounded-lg text-xs font-medium border border-white/15 transition cursor-pointer flex items-center justify-center gap-1"
          >
            <span>+ New Route</span>
          </button>

          <select
            className="bg-[#0b0d12]/60 hover:bg-[#0b0d12]/80 text-[#e5e7eb] border border-white/15 focus:border-[#2563eb] rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition outline-none"
            value={mission.status}
            onChange={(e) =>
              onStatusChange(
                mission.id,
                e.target.value as MissionStatus,
                selectedDroneId ? Number(selectedDroneId) : undefined,
              )
            }
          >
            <option className="bg-[#111622] text-white" value="ASSIGNED">
              ASSIGNED
            </option>
            <option className="bg-[#111622] text-white" value="IN_PROGRESS">
              IN PROGRESS
            </option>
            <option className="bg-[#111622] text-white" value="COMPLETED">
              COMPLETED
            </option>
            <option className="bg-[#111622] text-white" value="CANCELLED">
              CANCELLED
            </option>
          </select>
        </div>
      )}

      {!isAdmin && mission.status === "ASSIGNED" && (
        <button
          disabled={!selectedDroneId}
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white py-2 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
          onClick={() =>
            onStatusChange(mission.id, "IN_PROGRESS", Number(selectedDroneId))
          }
        >
          Start Mission
        </button>
      )}

      {!isAdmin && mission.status === "IN_PROGRESS" && (
        <button
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
          type="button"
          onClick={() => onStatusChange(mission.id, "COMPLETED")}
        >
          Complete Mission
        </button>
      )}
    </div>
  );
};