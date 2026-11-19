// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useMissionStore } from "../store/useMissionStore";
import { missionAPI } from "../services/api";
import { MissionDetailsCard } from "./missionDetailsCard";
import { MissionPlanningForm } from "./missionPlanningForm";
import { MissionList } from "./missionList";
import type { Mission, MissionStatus } from "../types/missions";

import { calculateDistanceMeters } from "../utils/calculateDistanceMeters";
import { calculateEstimatedDuration } from "../utils/calculateETAduration";
import { calculatePolygonArea } from "../utils/calculatePolygonArea";
import { formatDistance, formatDuration } from "../utils/formatters";

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    waypoints,
    clearWaypoint,
    setSelectedMission,
    selectedMission,
    missionType,
  } = useMissionStore();

  // Use selectedMission data if inspecting, otherwise use live draft waypoints
  const activeWaypoints = selectedMission
    ? selectedMission.waypoints
    : waypoints;
  const activeSpeed = selectedMission ? selectedMission.horizontal_speed : 15;
  const activeType = selectedMission
    ? selectedMission.mission_type
    : missionType;

  const liveDistance = calculateDistanceMeters(activeWaypoints);
  const liveDuration = calculateEstimatedDuration(liveDistance, activeSpeed);
  const liveArea =
    activeType === "AREA" && activeWaypoints.length >= 3
      ? calculatePolygonArea(activeWaypoints)
      : 0;

  // 1. Fetch missions list from backend
  const fetchMissions = () => {
    missionAPI.getMissions().then(setMissions).catch(console.error);
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

  const handleStatusChange = async (id: number, newStatus: MissionStatus) => {
    try {
      const updated = await missionAPI.updateMissionStatus(id, newStatus);
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
          onStatusChange={(id, status) => {
            void handleStatusChange(id, status);
          }}
          mission={selectedMission}
          isAdmin={user?.role === "ADMIN"}
          onPlanNewRoute={() => {
            setSelectedMission(null);
            clearWaypoint();
          }}
        ></MissionDetailsCard>
      );
    }

    // B. PLANNING MODE: Admin creates a new route
    if (user?.role === "ADMIN") {
      return <MissionPlanningForm onMissionCreated={fetchMissions} />;
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
          className="flex items-center gap-2 bg-[#1c1f26]/95 hover:bg-[#232730] text-[#e5e7eb] px-3.5 py-2 rounded-xl border border-[#2e333d] backdrop-blur-md shadow-xl transition-all cursor-pointer"
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
    <aside className="absolute top-3 left-3 bottom-3 z-10 w-96 bg-[#1c1f26]/95 text-[#e5e7eb] rounded-xl border border-[#2e333d] backdrop-blur-md shadow-2xl flex flex-col text-xs select-none transition-all overflow-hidden">
      {/* 1. FIXED TOP HEADER & LIVE TELEMETRY BAR */}
      <div className="p-4 pb-3 border-b border-[#2e333d] space-y-3 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2b85e4]" />
            <h2 className="font-semibold text-xs uppercase tracking-wider text-white">
              Mission Control
            </h2>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-[#9ca3af] hover:text-white p-1 rounded hover:bg-[#2a2e39] transition cursor-pointer"
            title="Collapse Panel"
          >
            <svg
              className="w-4 h-4"
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
        </div>

        {/* Live 4-Metric Telemetry Strip (DJI FlightHub 2 Style) */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#12141a] p-2.5 rounded-lg border border-[#282c35] text-center">
          <div>
            <div className="text-[9px] text-[#9ca3af] uppercase">Area</div>
            <div className="font-mono font-semibold text-white text-[11px] mt-0.5">
              {liveArea > 0
                ? `${Math.round(liveArea).toLocaleString()} m²`
                : "N/A"}
            </div>
          </div>
          <div className="border-l border-[#232730]">
            <div className="text-[9px] text-[#9ca3af] uppercase">Distance</div>
            <div className="font-mono font-semibold text-white text-[11px] mt-0.5">
              {formatDistance(liveDistance)}
            </div>
          </div>
          <div className="border-l border-[#232730]">
            <div className="text-[9px] text-[#9ca3af] uppercase">Est. Time</div>
            <div className="font-mono font-semibold text-[#38bdf8] text-[11px] mt-0.5">
              {formatDuration(liveDuration)}
            </div>
          </div>
          <div className="border-l border-[#232730]">
            <div className="text-[9px] text-[#9ca3af] uppercase">Waypoints</div>
            <div className="font-mono font-semibold text-[#60a5fa] text-[11px] mt-0.5">
              {activeWaypoints.length} pts
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE BODY: Active Section + Mission List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
