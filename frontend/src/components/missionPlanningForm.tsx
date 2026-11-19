// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState } from "react";
import { useMissionStore } from "../store/useMissionStore";
import { missionAPI } from "../services/api";
import type { MissionPlanningFormProps } from "../types/missions";

export const MissionPlanningForm: React.FC<MissionPlanningFormProps> = ({
  onMissionCreated,
}) => {
  const {
    waypoints,
    clearWaypoint,
    altitude,
    setAltitude,
    missionType,
    setMissionType,
  } = useMissionStore();
  const [name, setName] = useState("");
  const [pilotId, setPilotId] = useState<number | null>(2);
  const [speed, setSpeed] = useState<number>(15);
  const [isSaving, setIsSaving] = useState(false);

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
      });

      setName("");
      setSpeed(15);
      clearWaypoint();
      onMissionCreated();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSave(e);
      }}
      className="space-y-3 border-b border-[#2e333d] pb-4"
    >
      {/* 1. Segmented Flight Mode Selector */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
          Route Mode
        </span>
        <div className="grid grid-cols-2 gap-1.5 bg-[#12141a] p-1 rounded-lg border border-[#282c35]">
          <button
            type="button"
            onClick={() => setMissionType("AREA")}
            className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition cursor-pointer ${
              missionType === "AREA"
                ? "bg-[#2b85e4] text-white shadow-sm"
                : "text-[#9ca3af] hover:text-white"
            }`}
          >
            Area Patrol
          </button>
          <button
            type="button"
            onClick={() => setMissionType("LINEAR")}
            className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition cursor-pointer ${
              missionType === "LINEAR"
                ? "bg-[#2b85e4] text-white shadow-sm"
                : "text-[#9ca3af] hover:text-white"
            }`}
          >
            Linear Route
          </button>
        </div>
      </div>

      {/* 2. Two-Column Row: Mission Name & Assign Pilot */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
            Mission Name
          </label>
          <input
            placeholder="e.g. Survey Beta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#12141a] px-2.5 py-1.5 rounded-lg border border-[#2e333d] focus:border-[#2b85e4] text-[#e5e7eb] placeholder-[#6b7280] outline-none transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
            Assign Pilot
          </label>
          <select
            value={pilotId || ""}
            onChange={(e) =>
              setPilotId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full bg-[#12141a] px-2 py-1.5 rounded-lg border border-[#2e333d] focus:border-[#2b85e4] text-[#d1d5db] outline-none transition cursor-pointer"
          >
            <option value="">Unassigned</option>
            <option value="2">pilot1@flyby.com</option>
            <option value="3">pilot2@flyby.com</option>
          </select>
        </div>
      </div>

      {/* 3. Flight Altitude Control with DJI-style Stepper Buttons (-10 / +10) */}
      <div className="space-y-2 bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-[#d1d5db] font-medium">
            Flight Altitude (ASL)
          </span>
          <span className="font-mono font-bold text-[#60a5fa] bg-[#2b85e4]/15 px-2 py-0.5 rounded border border-[#2b85e4]/30">
            {altitude} m
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAltitude(Math.max(20, altitude - 10))}
            className="px-2 py-1 rounded bg-[#232730] hover:bg-[#2e333d] border border-[#343946] text-[10px] font-mono text-[#d1d5db] cursor-pointer"
          >
            -10
          </button>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            className="flex-1 accent-[#2b85e4] cursor-pointer h-1.5 bg-[#2a2e39] rounded-lg"
          />
          <button
            type="button"
            onClick={() => setAltitude(Math.min(300, altitude + 10))}
            className="px-2 py-1 rounded bg-[#232730] hover:bg-[#2e333d] border border-[#343946] text-[10px] font-mono text-[#d1d5db] cursor-pointer"
          >
            +10
          </button>
        </div>
      </div>

      {/* 4. Horizontal Speed Control with Stepper Buttons (-1 / +1) */}
      <div className="space-y-2 bg-[#14171d] p-2.5 rounded-lg border border-[#282c35]">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-[#d1d5db] font-medium">Horizontal Speed</span>
          <span className="font-mono font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-2 py-0.5 rounded border border-[#38bdf8]/30">
            {speed} m/s ({Math.round(speed * 3.6)} km/h)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSpeed(Math.max(2, speed - 1))}
            className="px-2 py-1 rounded bg-[#232730] hover:bg-[#2e333d] border border-[#343946] text-[10px] font-mono text-[#d1d5db] cursor-pointer"
          >
            -1
          </button>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="flex-1 accent-[#38bdf8] cursor-pointer h-1.5 bg-[#2a2e39] rounded-lg"
          />
          <button
            type="button"
            onClick={() => setSpeed(Math.min(20, speed + 1))}
            className="px-2 py-1 rounded bg-[#232730] hover:bg-[#2e333d] border border-[#343946] text-[10px] font-mono text-[#d1d5db] cursor-pointer"
          >
            +1
          </button>
        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-[#2b85e4] hover:bg-[#3b93f0] active:scale-95 text-white py-2 rounded-lg font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Route"}
        </button>
        <button
          type="button"
          onClick={clearWaypoint}
          className="bg-[#232730] hover:bg-[#2e333d] active:scale-95 text-[#d1d5db] px-3.5 py-2 rounded-lg border border-[#343946] font-medium transition cursor-pointer"
          title="Clear active draft waypoints"
        >
          Clear
        </button>
      </div>
    </form>
  );
};
