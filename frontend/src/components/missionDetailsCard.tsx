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
            <div className="font-bold text-sm text-white leading-tight">
              {mission.name}
            </div>
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

      {/* Audit Note if Alternative Drone was used, otherwise normal description */}
      {mission.description && (
        <div
          className={`text-[11px] px-2.5 py-2 rounded-lg border ${
            isAlternativeLog
              ? "bg-amber-500/10 border-amber-500/30 text-amber-200 space-y-1"
              : "text-[#9ca3af] border-transparent px-1"
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

      {/* Compact 2x2 Technical Specs Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">
            Flight Altitude
          </span>
          <span className="font-mono font-semibold text-white text-xs mt-0.5 block">
            {mission.flight_altitude}m{" "}
            {formatAltitudeMode(mission.altitude_mode)}
          </span>
        </div>
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">
            Horizontal Speed
          </span>
          <span className="font-mono font-semibold text-[#38bdf8] text-xs mt-0.5 block">
            {mission.horizontal_speed} m/s (
            {Math.round(mission.horizontal_speed * 3.6)} km/h)
          </span>
        </div>
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">
            Assigned Pilot
          </span>
          <span className="font-medium text-[#60a5fa] text-xs mt-0.5 block truncate">
            {mission.assigned_to ? mission.assigned_to.email : "Unassigned"}
          </span>
        </div>
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
          <span className="text-[10px] text-[#9ca3af] uppercase block">
            Takeoff Point
          </span>
          <span className="font-mono font-semibold text-[#d1d5db] text-xs mt-0.5 block">
            {takeoffPoint
              ? `${takeoffPoint.lat.toFixed(4)}, ${takeoffPoint.lng.toFixed(4)}`
              : "N/A"}
          </span>
        </div>
        <div className="col-span-2 bg-[#14171d] p-2.5 rounded-lg border border-[#282c35] flex justify-between items-center">
          <div>
            <span className="text-[10px] text-[#9ca3af] uppercase block">
              {isAlternativeLog ? "Active Alternative Drone" : "Assigned Drone"}
            </span>
            <span className="font-semibold text-white text-xs mt-0.5 block">
              {mission.drone
                ? `${mission.drone.name} (${mission.drone.model})`
                : "Not Assigned Yet (Pilot Choice)"}
            </span>
          </div>
          {mission.drone && (
            <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {mission.drone.battery_level}% • {mission.drone.serial_number}
            </span>
          )}
        </div>
      </div>

      {/* Drone Selection / Verification Box before Starting Mission */}
      {mission.status === "ASSIGNED" && (
        <div className="bg-[#14171d] p-2.5 rounded-lg border border-[#282c35] space-y-2">
          {mission.drone && !isAssignedDronePickedUp && (
            <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2 rounded">
              ⚠️ Assigned drone <b>{mission.drone.name} ({mission.drone.serial_number})</b> is not in your picked-up fleet. Please notify Admin before selecting an alternative drone below.
            </div>
          )}

          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] block">
            {mission.drone && !isAssignedDronePickedUp
              ? "Select Alternative Picked-Up Drone"
              : "Drone to Deploy (From Your Picked-Up Fleet)"}
          </label>

          {myPickedUpDrones.length === 0 ? (
            <div className="text-[11px] text-red-300 bg-red-500/10 border border-red-500/30 p-2 rounded">
              🚫 You have not picked up any drone yet. Go to the <b>Fleet Management</b> tab in the header to pick up a drone before starting this mission.
            </div>
          ) : (
            <select
              value={selectedDroneId}
              onChange={(e) => setSelectedDroneId(e.target.value)}
              className="w-full bg-[#12141a] px-2.5 py-1.5 rounded-lg border border-[#2e333d] focus:border-[#2b85e4] text-[#e5e7eb] text-xs outline-none cursor-pointer"
            >
              {myPickedUpDrones.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.serial_number}) • {d.battery_level}%
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Admin Controls */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={onPlanNewRoute}
            className="bg-[#232730] hover:bg-[#2e333d] active:scale-95 text-[#e5e7eb] py-1.5 px-2.5 rounded-lg font-semibold border border-[#343946] transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>+ Plan New Route</span>
          </button>

          <select
            className="bg-[#12141a] hover:bg-[#181b22] text-[#e5e7eb] border border-[#2e333d] focus:border-[#2b85e4] rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition outline-none"
            value={mission.status}
            onChange={(e) =>
              onStatusChange(
                mission.id,
                e.target.value as MissionStatus,
                selectedDroneId ? Number(selectedDroneId) : undefined,
              )
            }
          >
            <option className="bg-[#1c1f26] text-white" value="ASSIGNED">
              ASSIGNED
            </option>
            <option className="bg-[#1c1f26] text-white" value="IN_PROGRESS">
              IN PROGRESS
            </option>
            <option className="bg-[#1c1f26] text-white" value="COMPLETED">
              COMPLETED
            </option>
            <option className="bg-[#1c1f26] text-white" value="CANCELLED">
              CANCELLED
            </option>
          </select>
        </div>
      )}

      {!isAdmin && mission.status === "ASSIGNED" && (
        <button
          disabled={!selectedDroneId}
          className="w-full bg-[#2b85e4] hover:bg-[#3b93f0] active:scale-95 text-white py-2 rounded-lg font-semibold transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
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