// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { authAPI } from "../services/api";

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  // Handle Logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear RAM state in Zustand
      logout();
    }
  };

  return (
    <header className="h-11 bg-[#181a1f] text-[#e5e7eb] px-4 flex justify-between items-center border-b border-[#2b2f38] select-none shrink-0 z-20">
      {/* Brand & Tactical Title Section (Left) */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-[#2b85e4]/15 border border-[#2b85e4]/40 text-[#3898ff]">
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <h1 className="font-semibold tracking-tight text-white">
            Flyby Drone Planner
          </h1>
          <span className="text-[#525866]">/</span>
          <span className="text-[#9ca3af] font-medium">
            Flight Route Planner
          </span>
        </div>
      </div>

      {/*Operator Info & Tactical Sign Out (Right) */}
      <div className="flex items-center gap-2.5">
        {user && (
          <div className="flex items-center gap-2 bg-[#232730] border border-[#343946] px-2.5 py-1 rounded text-xs">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              title="System Online"
            />
            <span className="text-[#9ca3af] hidden md:inline text-[11px]">
              Operator:
            </span>
            <span className="font-medium text-[#e5e7eb]">{user.email}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                user.role === "ADMIN"
                  ? "bg-[#2b85e4]/20 text-[#60a5fa] border-[#2b85e4]/40"
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {user.role}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-[#232730] hover:bg-red-500/20 text-[#9ca3af] hover:text-red-300 text-xs px-2.5 py-1 rounded border border-[#343946] hover:border-red-500/40 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Sign out of current tactical session"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
