// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { missionAPI } from '../services/api';
import type { MissionPlanningFormProps } from '../types/missions';

export const MissionPlanningForm: React.FC<MissionPlanningFormProps> = ({ onMissionCreated }) => {

    const { waypoints, clearWaypoint, altitude, setAltitude } = useMissionStore();
    const [name, setName] = useState('');
    const [pilotId, setPilotId] = useState<number | null>(2);
    const [speed, setSpeed] = useState<number>(15);

      // Admin saves mission
      const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || waypoints.length < 2) {
          alert('Please enter mission name and select at least 2 waypoints on the map.');
          return;
        }
    
        await missionAPI.createMission({
          name,
          horizontal_speed: speed,
          altitude_mode: 'RELATIVE_TO_TAKEOFF',
          flight_altitude: altitude,
          assigned_to_id: pilotId,
          waypoints: waypoints,
        });
    
        setName('');
        setSpeed(15);
        clearWaypoint();
        onMissionCreated();
      };


    return (
        <form onSubmit={(e) => { void handleSave(e); }} className="space-y-3 border-b border-amber-500/30 pb-3.5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-stone-200 uppercase tracking-wide">
              Route Planning
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-sm">
              {waypoints.length} WAYPOINTS
            </span>
          </div>

          {/* Mission Name Input */}
          <div>
            <input
              placeholder="Enter Mission Name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0705]/45 p-2 rounded-lg border border-stone-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 text-white placeholder-stone-500 outline-none transition"
            />
          </div>

          {/* Pilot Assignee Selection */}
          <div>
            <select
              value={pilotId || ''}
              onChange={(e) => setPilotId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-[#0a0705]/45 p-2 rounded-lg border border-stone-700/80 focus:border-amber-400 text-stone-100 outline-none transition cursor-pointer"
            >
              <option value="">Unassigned (Open Mission)</option>
              <option value="2">Pilot 1 (pilot1@flyby.com)</option>
              <option value="3">Pilot 2 (pilot2@flyby.com)</option>
            </select>
          </div>

          {/* Flight Altitude Range Slider */}
          <div className="space-y-1.5 bg-[#0a0705]/35 p-2.5 rounded-lg border border-stone-800/80">
            <div className="flex justify-between items-center text-stone-200 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Flight Altitude:
              </span>
              <span className="font-mono font-bold text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded border border-amber-400/50 shadow-sm">
                {altitude}m ASL
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="10"
              value={altitude}
              onChange={(e) => setAltitude(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>

          {/* Horizontal Speed Range Slider */}
          <div className="space-y-1.5 bg-[#0a0705]/35 p-2.5 rounded-lg border border-stone-800/80">
            <div className="flex justify-between items-center text-stone-200 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Horizontal Speed:
              </span>
              {/* Display speed in m/s and km/h */}
              <span className="font-mono font-bold text-cyan-400 bg-cyan-400/15 px-2 py-0.5 rounded border border-cyan-400/50 shadow-sm">
                {speed} m/s ({Math.round(speed * 3.6)} km/h)
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-stone-950 py-2 rounded-lg font-bold tracking-wide shadow-lg shadow-amber-600/30 border border-amber-400/50 transition cursor-pointer"
            >
              Save Route
            </button>
            <button
              type="button"
              onClick={clearWaypoint}
              className="bg-stone-800/60 hover:bg-stone-700/80 active:scale-95 text-stone-200 px-3.5 py-2 rounded-lg border border-stone-700/60 font-medium transition cursor-pointer"
              title="Clear active draft waypoints"
            >
              Clear
            </button>
          </div>
        </form>
    )
}

