// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from "react";
import type { MissionDetailsCardProps, MissionStatus } from "../types/missions";
import { StatusBadge } from "./statusBadge";

export const MissionDetailsCard: React.FC<MissionDetailsCardProps> = ({
  mission,
  isAdmin,
  onPlanNewRoute,
  onStatusChange,
}) => {
  return (
    <div className="space-y-3 border-b border-amber-500/30 pb-3.5">
      <div className="flex justify-between items-center">
        <div className="text-[11px] font-bold text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />{" "}
          <span>Viewing Route</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm">
          {mission.waypoints.length} WAYPOINTS
        </span>
      </div>

      {/* Mission Details Card */}
      <div className="bg-[#0a0705]/50 p-3 rounded-lg border border-amber-500/30 space-y-2">
        <div className="flex justify-between items-center gap-2">
          <span className="font-bold text-sm text-white">{mission.name}</span>
          <StatusBadge status={mission.status} />
        </div>

        {mission.description && (
          <p className="text-[11px] text-stone-400">{mission.description}</p>
        )}
        {/* Altitude & Speed Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300 pt-1.5 border-t border-stone-800">
          <div>
            <span className="text-stone-500 block text-[10px] uppercase">
              Altitude
            </span>
            <span className="font-mono font-semibold text-yellow-400">
              {mission.flight_altitude}m ASL
            </span>
          </div>
          <div>
            <span className="text-stone-500 block text-[10px] uppercase">
              Speed
            </span>
            <span className="font-mono font-semibold text-cyan-300">
              {mission.horizontal_speed} m/s (
              {Math.round(mission.horizontal_speed * 3.6)} km/h)
            </span>
          </div>
        </div>

        {/* Display assigned pilot (Placed outside the grid) */}
        <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-[11px]">
          <span className="text-stone-500 uppercase text-[10px]">
            Assigned Pilot
          </span>
          <span className="font-mono font-semibold text-amber-300">
            {mission.assigned_to ? mission.assigned_to.email : "Unassigned"}
          </span>
        </div>
      </div>

      {/* Switch back to Planning Mode Button (Admin Only) */}
      {isAdmin && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onPlanNewRoute}
            className="w-full bg-stone-800/80 hover:bg-stone-700/90 active:scale-95 text-amber-300 hover:text-white py-2 rounded-lg font-semibold tracking-wide border border-amber-500/40 hover:border-amber-400 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            title="Return to Route Planning Mode"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Plan New Route</span>
          </button>
          <select
            className="w-full bg-[#0a0705]/90 hover:bg-stone-900 text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-lg px-3 py-2 text-xs font-mono font-semibold cursor-pointer transition outline-none"
            value={mission.status}
            onChange={(e) =>
              onStatusChange(mission.id, e.target.value as MissionStatus)
            }
          >
            <option className="g-[#120c08] text-white" value="ASSIGNED">
              ASSIGNED
            </option>
            <option className="g-[#120c08] text-white" value="IN_PROGRESS">
              IN PROGRESS
            </option>
            <option className="g-[#120c08] text-white" value="COMPLETED">
              COMPLETED
            </option>
            <option className="g-[#120c08] text-white" value="CANCELLED">
              CANCELLED
            </option>
          </select>
        </div>
      )}

      {!isAdmin && mission.status === "ASSIGNED" && (
        <button
          className="w-full bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 hover:text-white py-2 rounded-lg font-semibold tracking-wide border border-amber-500/50 transition cursor-pointer shadow-sm"
          type="button"
          onClick={() => onStatusChange(mission.id, "IN_PROGRESS")}
        >
          Start Mission
        </button>
      )}

      {!isAdmin && mission.status === "IN_PROGRESS" && (
        <button
          className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 hover:text-white py-2 rounded-lg font-semibold tracking-wide border border-emerald-500/50 transition cursor-pointer shadow-sm"
          type="button"
          onClick={() => onStatusChange(mission.id, "COMPLETED")}
        >
          Complete Mission
        </button>
      )}
    </div>
  );
};
