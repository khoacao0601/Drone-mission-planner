// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useMissionStore } from "../store/useMissionStore";
import { missionAPI, droneAPI } from "../services/api";
import { MissionDetailsCard } from "./missionDetailsCard";
import { MissionPlanningForm } from "./missionPlanningForm";
import { MissionList } from "./missionList";
import type { Mission, MissionStatus, Drone } from "../types/missions";

import { calculateDistanceMeters } from "../utils/calculateDistanceMeters";
import { calculateEstimatedDuration } from "../utils/calculateETAduration";
import { calculatePolygonArea } from "../utils/calculatePolygonArea";
import { formatDistance, formatDuration } from "../utils/formatters";
import { generateSurveyGrid } from "../utils/generateGridforFlighPath";

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [drones, setDrones] = useState<Drone[]>([]);

  const {
    waypoints,
    clearWaypoint,
    setSelectedMission,
    selectedMission,
    missionType,
    speed,
    gridSpacing,
  } = useMissionStore();

  // Use selectedMission data if inspecting, otherwise use live draft waypoints
  const activeWaypoints = selectedMission
    ? selectedMission.waypoints
    : waypoints;
  const activeSpeed = selectedMission
    ? selectedMission.horizontal_speed
    : speed;
  const activeType = selectedMission
    ? selectedMission.mission_type
    : missionType;

  const effectivePath =
    activeType === "AREA" && activeWaypoints.length >= 3
      ? generateSurveyGrid(activeWaypoints, gridSpacing)
      : activeWaypoints;
  const liveDistance = calculateDistanceMeters(effectivePath);
  const liveDuration = calculateEstimatedDuration(liveDistance, activeSpeed);
  const liveArea =
    activeType === "AREA" && activeWaypoints.length >= 3
      ? calculatePolygonArea(activeWaypoints)
      : 0;
  let formattedArea = "0.0 ha";
  if (liveArea >= 1000) {
    formattedArea = `${(liveArea / 10000).toFixed(1)} ha`;
  } else if (liveArea > 0) {
    formattedArea = `${Math.round(liveArea)} m²`;
  }

  // 1. Fetch missions list from backend
  const fetchMissions = () => {
    missionAPI.getMissions().then(setMissions).catch(console.error);
    droneAPI.getDrones().then(setDrones).catch(console.error);
  };

  useEffect(() => {
    if (!user) {
      setMissions([]);
      return;
    }
    fetchMissions();
  }, [user]);

  // 2. Admin deletes mission
  const handleDelete = async (id: number) => {
    try {
      if (!confirm("Are you sure you want to delete this mission?")) return;
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

  const handleStatusChange = async (
    id: number,
    newStatus: MissionStatus,
    droneId?: number,
  ) => {
    try {
      const updated = await missionAPI.updateMissionStatus(
        id,
        newStatus,
        droneId,
      );
      setSelectedMission(updated);
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
          drones={drones}
          onStatusChange={(id, status, droneId) => {
            void handleStatusChange(id, status, droneId);
          }}
          mission={selectedMission}
          isAdmin={user?.role === "ADMIN"}
          onPlanNewRoute={() => {
            setSelectedMission(null);
            clearWaypoint();
          }}
        />
      );
    }

    // B. PLANNING MODE: Admin creates a new route
    if (user?.role === "ADMIN") {
      return (
        <MissionPlanningForm drones={drones} onMissionCreated={fetchMissions} />
      );
    }

    // C. Pilot View-Only (When no mission is selected yet)
    return (
      <div className="p-3 bg-[#14171d] border border-[#282c35] rounded-lg text-[#d1d5db]">
        <div className="font-semibold flex items-center gap-1.5 text-white">
          <span className="w-2 h-2 rounded-full bg-[#2b85e4]" />{" "}
          <span>Pilot Mode Active</span>
        </div>
        <p className="text-[11px] text-[#9ca3af] mt-1">
          Read-only access: Select an assigned mission below to view 3D flight
          trajectory.
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
          className="flex items-center gap-2 bg-[#12151c]/85 hover:bg-[#1b202a] text-[#e5e7eb] px-3.5 py-2 rounded-xl border border-[#252a36] backdrop-blur-xl shadow-xl transition-all cursor-pointer"
          title="Expand Mission Panel"
        >
          <svg
            className="w-4 h-4 text-[#3898ff]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-xs font-semibold tracking-wide uppercase">
            Mission Control ({activeWaypoints.length} pts)
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-4 left-4 max-h-[calc(100vh-5.5rem)] z-10 w-80 md:w-[340px] bg-[#0d111a]/65 text-[#e5e7eb] rounded-2xl border border-white/15 backdrop-blur-md shadow-2xl flex flex-col text-xs select-none transition-all overflow-hidden">
      {/* 1. FIXED TOP TELEMETRY STRIP */}
      <div className="px-5 py-4 border-b border-white/15 shrink-0 relative">
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-3 right-3 text-slate-200 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer"
          title="Collapse Panel"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="grid grid-cols-3 text-left pr-5">
          <div className="pr-3">
            <div className="text-[11px] font-medium text-slate-200">
              Distance
            </div>
            <div className="font-semibold text-white text-sm md:text-base tabular-nums whitespace-nowrap mt-0.5">
              {formatDistance(liveDistance)}
            </div>
          </div>
          <div className="px-3 border-l border-white/15">
            <div className="text-[11px] font-medium text-slate-200">
              Est. Time
            </div>
            <div className="font-semibold text-white text-sm md:text-base tabular-nums whitespace-nowrap mt-0.5">
              {formatDuration(liveDuration)}
            </div>
          </div>
          <div className="pl-3 border-l border-white/15">
            <div className="text-[11px] font-medium text-slate-200">Area</div>
            <div className="font-semibold text-white text-sm md:text-base tabular-nums whitespace-nowrap mt-0.5">
              {formattedArea}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE BODY: Active Section + Mission List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {renderActiveSection()}

        <MissionList
          missions={missions}
          selectedMissionId={selectedMission?.id}
          isAdmin={user?.role === "ADMIN"}
          onSelectMission={setSelectedMission}
          onDeleteMission={(id) => {
            void handleDelete(id);
          }}
        />
      </div>
    </aside>
  );
};
