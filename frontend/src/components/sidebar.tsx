// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMissionStore } from '../store/useMissionStore';
import { missionAPI } from '../services/api';
import { MissionDetailsCard } from './missionDetailsCard';
import { MissionPlanningForm } from './missionPlanningForm';
import type { Mission } from '../types/missions';


export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { waypoints, clearWaypoint, setSelectedMission, selectedMission } = useMissionStore();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Fetch missions list from backend
  const fetchMissions = () => {
    missionAPI.getMissions().then(setMissions).catch(console.error);
  };

  useEffect(() => {
    fetchMissions();
  }, [user]);


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

  // Render Section 1: Inspection Card vs Route Planning Form vs Pilot View-Only
  const renderActiveSection = () => {
    // A. INSPECTION MODE: Viewing a saved mission (Read-Only)
    if (selectedMission) {
      return (
        <MissionDetailsCard 
              mission={selectedMission} 
              isAdmin={user?.role === 'ADMIN'}
              onPlanNewRoute={
                () => { 
                  setSelectedMission(null); 
                  clearWaypoint();
                }
              }
        ></MissionDetailsCard>
      );
    }

    // B. PLANNING MODE: Admin creates a new route
    if (user?.role === 'ADMIN') {
      return (
        <MissionPlanningForm onMissionCreated={fetchMissions}/>
      );
    }

    // C. Pilot View-Only (When no mission is selected yet)
    return (
      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300 border-b border-amber-500/30">
        <div className="font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />{' '}
          <span>Pilot Mode Active</span>
        </div>
        <p className="text-[11px] text-amber-300/80 mt-1">
          Read-only access: Select an assigned mission below to view 3D flight trajectory.
        </p>
      </div>
    );
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

      {/* SECTION 1: EITHER VIEWING AN EXISTING MISSION OR PLANNING A NEW ROUTE */}
      {renderActiveSection()}

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
                  </div>
                </div>

                {/* Assigned pilot badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    m.assigned_to
                      ? 'bg-amber-900/50 text-amber-300 border border-amber-600/50'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {m.assigned_to ? m.assigned_to.email : 'Unassigned'}
                </span>

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