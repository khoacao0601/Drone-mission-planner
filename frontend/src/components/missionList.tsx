// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from "react";
import type { MissionListProps } from "../types/missions";

export const MissionList: React.FC<MissionListProps> = ({ missions, selectedMissionId, isAdmin, onSelectMission, onDeleteMission }) => {
    return (
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
                onClick={() => onSelectMission(m)}
                className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                  selectedMissionId=== m.id
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
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMission(m.id)
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
    )
}