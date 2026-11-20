// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from "react";
import type { MissionDetailsCardProps, MissionStatus } from "../types/missions";
import { StatusBadge } from "./statusBadge";
import { formatDateTime, formatAltitudeMode } from "../utils/formatters";

export const MissionDetailsCard: React.FC<MissionDetailsCardProps> = ({
  mission,
  isAdmin,
  onPlanNewRoute,
  onStatusChange,
}) => {
  const takeoffPoint = mission.waypoints[0];

  return (
    <div className="space-y-2.5 border-b border-[#2e333d] pb-3.5">
      {/* Header Row: Back Button + Mission Title + Badges */}
      <div className="flex justify-between items-center bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPlanNewRoute}
            className="text-[#d1d5db] hover:text-white px-2 py-1 rounded bg-[#232730] hover:bg-[#2e333d] border border-[#343946] text-[11px] cursor-pointer transition"
            title="Return to Route Planning"
          >
            ←
          </button>
          <div>
            <div className="font-bold text-sm text-white leading-tight">{mission.name}</div>
            <div className="text-[10px] text-[#9ca3af] mt-0.5">
              Created: {formatDateTime(mission.created_at)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#232730] text-[#d1d5db] border border-[#343946]">
            {mission.mission_type}
          </span>
          <StatusBadge status={mission.status} />
        </div>
      </div>

      {mission.description && (
        <p className="text-[11px] text-[#9ca3af] px-1">{mission.description}</p>
      )}

      {/* Compact 2x2 Technical Specs Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">Flight Altitude</span>
          <span className="font-mono font-semibold text-white text-xs mt-0.5 block">
            {mission.flight_altitude}m {formatAltitudeMode(mission.altitude_mode)}
          </span>
        </div>
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">Horizontal Speed</span>
          <span className="font-mono font-semibold text-[#38bdf8] text-xs mt-0.5 block">
            {mission.horizontal_speed} m/s ({Math.round(mission.horizontal_speed * 3.6)} km/h)
          </span>
        </div>
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">Assigned Pilot</span>
          <span className="font-medium text-[#60a5fa] text-xs mt-0.5 block truncate">
            {mission.assigned_to ? mission.assigned_to.email : "Unassigned"}
          </span>
        </div>
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">Takeoff Point</span>
          <span className="font-mono font-semibold text-[#d1d5db] text-xs mt-0.5 block">
            {takeoffPoint
              ? `${takeoffPoint.lat.toFixed(4)}, ${takeoffPoint.lng.toFixed(4)}`
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Admin Controls: Plan New Route & Status Select on a single compact 2-column row! */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={onPlanNewRoute}
            className="bg-[#232730] hover:bg-[#2e333d] active:scale-95 text-[#e5e7eb] py-1.5 px-2.5 rounded-lg font-semibold border border-[#343946] transition cursor-pointer flex items-center justify-center gap-1.5"
            title="Return to Route Planning Mode"
          >
            <svg className="w-3.5 h-3.5 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Plan New Route</span>
          </button>

          <select
            className="bg-[#12141a] hover:bg-[#181b22] text-[#e5e7eb] border border-[#2e333d] focus:border-[#2b85e4] rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition outline-none"
            value={mission.status}
            onChange={(e) => onStatusChange(mission.id, e.target.value as MissionStatus)}
          >
            <option className="bg-[#1c1f26] text-white" value="ASSIGNED">ASSIGNED</option>
            <option className="bg-[#1c1f26] text-white" value="IN_PROGRESS">IN PROGRESS</option>
            <option className="bg-[#1c1f26] text-white" value="COMPLETED">COMPLETED</option>
            <option className="bg-[#1c1f26] text-white" value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      )}

      {!isAdmin && mission.status === "ASSIGNED" && (
        <button
          className="w-full bg-[#2b85e4] hover:bg-[#3b93f0] active:scale-95 text-white py-2 rounded-lg font-semibold transition cursor-pointer shadow-sm"
          type="button"
          onClick={() => onStatusChange(mission.id, "IN_PROGRESS")}
        >
          Start Mission
        </button>
      )}

      {!isAdmin && mission.status === "IN_PROGRESS" && (
        <button
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-2 rounded-lg font-semibold transition cursor-pointer shadow-sm"
          type="button"
          onClick={() => onStatusChange(mission.id, "COMPLETED")}
        >
          Complete Mission
        </button>
      )}
    </div>
  );
};