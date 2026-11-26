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
        <div>
        <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
            Mission Registry ({missions.length})
            </span>
        </div>

        <div className="space-y-2">
            {missions.length === 0 ? (
            <div className="text-center py-4 text-[#6b7280] text-[11px]">
                No missions found
            </div>
            ) : (
            missions.map((m) => (
                <div
                key={m.id}
                className={`p-2.5 gap-2 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                    selectedMissionId === m.id
                    ? "bg-[#2b85e4]/15 border-[#2b85e4] shadow-sm"
                    : "bg-[#14171d] border-[#282c35] hover:border-[#363b47] hover:bg-[#1a1e26]"
                }`}
                >
                <button
                    type="button"
                    onClick={() => onSelectMission(m)}
                    className="flex-1 flex justify-between items-center text-left cursor-pointer"
                >
                    <div>
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[10px] text-[#9ca3af] mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-[#60a5fa]">
                        {m.waypoints.length} pts
                        </span>
                        <StatusBadge status={m.status} />
                        {m.drone && (
                        <span className="font-mono text-[#9ca3af]">
                            • {m.drone.serial_number}
                        </span>
                        )}
                    </div>
                    </div>

                    {/* Assigned pilot badge */}
                    <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        m.assigned_to
                        ? "bg-[#232730] text-[#d1d5db] border-[#343946]"
                        : "bg-[#181a1f] text-[#6b7280] border-[#282c35]"
                    }`}
                    >
                    {m.assigned_to ? m.assigned_to.email : "Unassigned"}
                    </span>
                </button>

                {/* Delete Button (Admin Only) */}
                {isAdmin && (
                    <button
                    type="button"
                    onClick={() => {
                        onDeleteMission(m.id);
                    }}
                    className="text-[#9ca3af] hover:text-red-300 bg-[#232730] hover:bg-red-500/20 border border-[#343946] hover:border-red-500/40 p-1.5 rounded-lg transition cursor-pointer active:scale-95"
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
