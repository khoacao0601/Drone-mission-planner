    // Copyright (c) 2026 Khoa Cao. All rights reserved.

    import React from "react";
    import type { MissionListProps } from "../types/missions";
    import { StatusBadge } from "./statusBadge";

    export const MissionList: React.FC<MissionListProps> = ({
    missions,
    selectedMissionId,
    isAdmin,
    onSelectMission,
    onDeleteMission,
    }) => {
    return (
        <div className="space-y-2">
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Missions: </h3>
        </div>

        <div className="divide-y divide-white/10">
            {missions.length === 0 ? (
            <div className="text-center py-3 text-[#6b7280] text-xs">
                No missions found
            </div>
            ) : (
            missions.map((m, index) => (
                <div
                key={m.id}
                className={`group px-2 py-2.5 cursor-pointer flex justify-between items-center gap-2 transition-colors ${
                    selectedMissionId === m.id
                    ? "bg-[#252b38]/80 rounded-lg"
                    : "hover:bg-white/5"
                }`}
                >
                <button
                    type="button"
                    onClick={() => onSelectMission(m)}
                    className="flex-1 flex items-center justify-between gap-2 text-left cursor-pointer min-w-0"
                >
                    <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-[11px] font-mono tabular-nums text-slate-300 w-3 shrink-0 mt-0.5">
                        {index + 1}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-medium text-white truncate">
                        {m.name}
                        </div>
                        <div className="text-[11px] text-slate-200 flex items-center gap-1.5">
                        <span className="font-mono text-[#60a5fa]">
                            {m.waypoints.length} pts
                        </span>
                        {m.drone && (
                            <>
                            <span>•</span>
                            <span className="font-mono">
                                {m.drone.serial_number}
                            </span>
                            </>
                        )}
                        </div>
                        <div className="text-[11px] text-slate-200">
                        {m.assigned_to ? m.assigned_to.email : "Unassigned"}
                        </div>
                    </div>
                    </div>

                    <StatusBadge status={m.status} />
                </button>

                {/* Delete Button (Admin Only, visible on hover) */}
                {isAdmin && (
                    <button
                    type="button"
                    onClick={() => {
                        onDeleteMission(m.id);
                    }}
                    className="text-slate-300 hover:text-red-400 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 p-1.5 rounded-lg transition cursor-pointer shrink-0"
                    title="Delete Mission"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                    </button>
                )}
                </div>
            ))
            )}
        </div>
        </div>
    );
    };
