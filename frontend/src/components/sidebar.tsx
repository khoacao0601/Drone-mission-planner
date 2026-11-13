// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMissionStore } from '../store/useMissionStore';
import { missionAPI } from '../services/api';
import { MissionDetailsCard } from './missionDetailsCard';
import { MissionPlanningForm } from './missionPlanningForm';
import { MissionList } from './missionList';
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


  // 2. Admin deletes mission
  const handleDelete = async (id: number) => {
    try {
      if (!confirm('Are you sure you want to delete this mission?')) return;
      await missionAPI.deleteMission(id);
      if (selectedMission?.id === id) {
        setSelectedMission(null);
        clearWaypoint();
      }
      fetchMissions();
    } catch (error) {
      console.error(error);
    }
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
        <MissionPlanningForm onMissionCreated={fetchMissions} />
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

      {/*EITHER VIEWING AN EXISTING MISSION OR PLANNING A NEW ROUTE */}
      {renderActiveSection()}

      <MissionList
        missions={missions}
        selectedMissionId={selectedMission?.id}
        isAdmin={user?.role === "ADMIN"}
        onSelectMission={setSelectedMission}
        onDeleteMission={(id) => { void handleDelete(id); }}
      />
    </div>
  );
};