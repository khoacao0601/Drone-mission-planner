// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useMissionStore } from "../store/useMissionStore";
import { missionAPI } from "../services/api";
import type { MissionPlanningFormProps } from "../types/missions";

export const MissionPlanningForm: React.FC<MissionPlanningFormProps> = ({
  drones = [],
  onMissionCreated,
}) => {
  const {
    waypoints,
    clearWaypoint,
    altitude,
    setAltitude,
    missionType,
    setMissionType,
    speed,
    setSpeed,
    gridSpacing,
    setGridSpacing,
  } = useMissionStore();
  const [name, setName] = useState("");
  const [pilotId, setPilotId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [droneId, setDroneId] = useState<number | null>(null);
  const [showNoDroneConfirm, setShowNoDroneConfirm] = useState(false);

  const submitMission = async () => {
    setIsSaving(true);

    try {
      await missionAPI.createMission({
        name,
        horizontal_speed: speed,
        altitude_mode: "RELATIVE_TO_TAKEOFF",
        flight_altitude: altitude,
        assigned_to_id: pilotId,
        waypoints: waypoints,
        mission_type: missionType,
        drone_id: droneId,
      });

      setName("");
      setSpeed(15);
      clearWaypoint();
      onMissionCreated();
      setDroneId(null);
      setPilotId(null);
      setShowNoDroneConfirm(false);
      setPilotId(null);
    } catch (error) {
      console.error(error);
      alert(
        "Failed to deploy mission. Please check your connection or permissions.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Admin saves mission
  const handleSave = async (e: React.FormEvent) => {
    const minWaypoints = missionType === "AREA" ? 3 : 2;

    e.preventDefault();
    if (!name || waypoints.length < minWaypoints) {
      alert(
        `Please enter mission name and select at least ${minWaypoints} waypoints on the map.`,
      );
      return;
    }

    if (!droneId) {
      setShowNoDroneConfirm(true);
      return;
    }

    await submitMission();
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSave(e);
      }}
      className="space-y-3.5 border-b border-white/15 pb-4"
    >
      {/* Header + Subtle Clear Action */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Mission Planning</h3>
        {waypoints.length > 0 && (
          <button
            type="button"
            onClick={clearWaypoint}
            className="text-[11px] text-[#9ca3af] hover:text-red-400 transition cursor-pointer"
          >
            Clear ({waypoints.length})
          </button>
        )}
      </div>

      {/* 1. Mission Name */}
      <div className="space-y-1">
        <label
          htmlFor="mission-name-input"
          className="text-[11px] font-medium text-slate-200"
        >
          Mission Name
        </label>
        <input
          id="mission-name-input"
          placeholder="DTLA Sector 04"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#0b0d12]/60 px-3 py-2 rounded-lg border border-white/15 focus:border-[#2563eb] text-xs text-white placeholder-slate-400 outline-none transition"
        />
      </div>

      {/* 2. Flight Mode Segmented Toggle */}
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-slate-200">
          Flight Mode
        </span>
        <div className="grid grid-cols-2 gap-1 bg-[#0b0d12]/60 p-1 rounded-lg border border-white/15">
          <button
            type="button"
            onClick={() => setMissionType("LINEAR")}
            className={`py-1.5 px-2 rounded-md text-xs font-medium transition cursor-pointer ${
              missionType === "LINEAR"
                ? "bg-white/15 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Waypoint
          </button>
          <button
            type="button"
            onClick={() => setMissionType("AREA")}
            className={`py-1.5 px-2 rounded-md text-xs font-medium transition cursor-pointer ${
              missionType === "AREA"
                ? "bg-white/15 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Area Patrol
          </button>
        </div>
      </div>

      {/* 3. Altitude (Minimal Slider) */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-slate-200">Altitude</span>
          <span className="font-mono tabular-nums font-semibold text-amber-400">
            {altitude}m
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="300"
          step="10"
          value={altitude}
          onChange={(e) => setAltitude(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-1 bg-white/15 rounded-lg"
        />
      </div>

      {/* 4. Speed (Minimal Slider) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-slate-200">Speed</span>
          <span className="font-mono tabular-nums font-medium text-white">
            {speed} m/s{" "}
            <span className="text-slate-300 font-normal">
              ({Math.round(speed * 3.6)} km/h)
            </span>
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="20"
          step="1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-[#38bdf8] cursor-pointer h-1 bg-white/15 rounded-lg"
        />
      </div>

      {missionType === "AREA" && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-200">Grid Spacing</span>
            <span className="font-mono tabular-nums font-medium text-emerald-400">
              {gridSpacing} m
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={gridSpacing}
            onChange={(e) => setGridSpacing(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1 bg-white/15 rounded-lg"
          />
        </div>
      )}

      {/* 5. Drone & Pilot Selectors (2 Columns) */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <select
          value={droneId || ""}
          onChange={(e) =>
            setDroneId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full bg-[#0b0d12]/60 px-2.5 py-1.5 rounded-lg border border-white/15 focus:border-[#2563eb] text-xs text-[#d1d5db] outline-none transition cursor-pointer"
        >
          <option value="">Any Drone</option>
          {drones.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.battery_level}%)
            </option>
          ))}
        </select>

        <select
          value={pilotId || ""}
          onChange={(e) =>
            setPilotId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full bg-[#0b0d12]/60 px-2.5 py-1.5 rounded-lg border border-white/15 focus:border-[#2563eb] text-xs text-[#d1d5db] outline-none transition cursor-pointer"
        >
          <option value="">Unassigned</option>
          <option value="2">pilot1@flyby.com</option>
          <option value="3">pilot2@flyby.com</option>
        </select>
      </div>

      {/* 6. Primary CTA */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white py-2 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Deploying..." : "Deploy Mission"}
      </button>

      {showNoDroneConfirm &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
            <div className="bg-[#111622]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 text-[#e5e7eb]">
              <div className="flex items-center gap-2.5 text-amber-400">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h4 className="text-sm font-semibold text-white">
                  No Drone Assigned
                </h4>
              </div>

              <p className="text-xs text-[#d1d5db] leading-relaxed">
                If you do not pick a specific drone, the Pilot will have full
                authority to choose and pick up any available drone from the
                depot for this mission.
              </p>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNoDroneConfirm(false)}
                  disabled={isSaving}
                  className="flex-1 bg-white/10 hover:bg-white/15 border border-white/15 text-[#e5e7eb] py-2 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNoDroneConfirm(false);
                    void submitMission();
                  }}
                  disabled={isSaving}
                  className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  Agree
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </form>
  );
};
