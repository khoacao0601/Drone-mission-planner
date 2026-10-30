// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMissionStore } from '../store/useMissionStore';
import { missionAPI } from '../services/api';
import type { Mission } from '../types/missions';

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { waypoints, clearWaypoint, setSelectedMission, selectedMission, altitude, setAltitude } = useMissionStore();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [name, setName] = useState('');
  const [pilotId, setPilotId] = useState<number | null>(2);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Fetch missions list from backend
  const fetchMissions = () => {
    missionAPI.getMissions().then(setMissions).catch(console.error);
  };

  useEffect(() => {
    fetchMissions();
  }, [user]);

  // 2. Admin saves mission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || waypoints.length < 2) {
      alert('Please enter mission name and select at least 2 waypoints on the map.');
      return;
    }

    await missionAPI.createMission({
      name,
      horizontal_speed: 15,
      altitude_mode: 'RELATIVE_TO_TAKEOFF',
      flight_altitude: altitude,
      assigned_to_id: pilotId,
      waypoints: waypoints,
    });

    setName('');
    clearWaypoint();
    fetchMissions();
  };

  // 3. Admin deletes mission
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;
    await missionAPI.deleteMission(id);
    if (selectedMission?.id === id) {
      setSelectedMission(null);
      clearWaypoint();
    }
    fetchMissions();
  };

  // Collapsed compact widget (Maximum 3D map transparency)
  if (isCollapsed) {
    return (
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 bg-[#140e09]/70 hover:bg-[#1e150e]/85 text-amber-300 px-3.5 py-2 rounded-xl border border-amber-500/40 backdrop-blur-md shadow-xl shadow-black/80 transition-all cursor-pointer"
          title="Expand Tactical Mission Panel"
        >
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-bold tracking-wide uppercase">Mission Control ({waypoints.length} pts)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-[#120c08]/50 text-white p-4 rounded-2xl border border-amber-500/40 backdrop-blur-md shadow-2xl shadow-black/90 space-y-4 text-xs select-none transition-all">
      {/* PANEL HEADER WITH LUMINOUS AMBER RADAR INDICATOR */}
      <div className="flex justify-between items-center border-b border-amber-500/30 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            Tactical Control
          </h2>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-stone-400 hover:text-amber-300 p-1 rounded-md hover:bg-stone-800/50 transition cursor-pointer"
          title="Collapse Panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* SECTION 1: PLANNING FORM (ADMIN ONLY) */}
      {user?.role === 'ADMIN' ? (
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
      ) : (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300 border-b border-amber-500/30">
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pilot Mode Active</span>
          </div>
          <p className="text-[11px] text-amber-300/80 mt-1">
            Read-only access: Select an assigned mission below to view 3D flight trajectory.
          </p>
        </div>
      )}

      {/* SECTION 2: MISSION CATALOG (FOR BOTH ADMIN & PILOT) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold text-stone-200 uppercase tracking-wide">
            Mission Registry ({missions.length})
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {missions.length === 0 ? (
            <div className="text-center py-4 text-stone-500 text-[11px]">
              No missions found
            </div>
          ) : (
            missions.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMission(m)}
                className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                  selectedMission?.id === m.id
                    ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-500/30'
                    : 'bg-[#0a0705]/40 border-stone-800/80 hover:border-amber-600/50 hover:bg-stone-900/50'
                }`}
              >
                <div>
                  <div className="font-bold text-white">{m.name}</div>
                  <div className="text-[10px] text-stone-300 mt-0.5 flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-amber-400">{m.waypoints.length} pts</span>
                    {' '}
                    <span>•</span>
                    {' '}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        m.assigned_to_id
                          ? 'bg-amber-900/50 text-amber-300 border border-amber-600/50'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {m.assigned_to_id ? 'Assigned' : 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Highly Visible Red Delete Button (Admin Only) */}
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(m.id);
                    }}
                    className="text-red-400 hover:text-white bg-red-950/50 hover:bg-red-600 border border-red-500/50 hover:border-red-400 p-1.5 rounded-lg transition cursor-pointer shadow-sm active:scale-95"
                    title="Delete Mission"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};