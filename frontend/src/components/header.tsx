// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { authAPI } from "../services/api";

interface HeaderProps {
  activePage: "PLANNER" | "FLEET";
  onNavigate: (page: "PLANNER" | "FLEET") => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuthStore();

  // Handle Logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
    }
  };

  return (
    <header className="h-14 bg-[#0f1218]/75 backdrop-blur-md text-[#e5e7eb] px-6 flex justify-between items-center border-b border-white/15 select-none shrink-0 z-20">
      {/* Brand & Tactical Title Section (Left) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#3898ff]">
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
        <h1 className="text-base tracking-tight text-white">
          <span className="font-bold">Flyby</span>{" "}
          <span className="font-normal text-[#9ca3af]">Mission Control</span>
        </h1>
      </div>

      {/* Center Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#12151c]/70 p-1 rounded-xl border border-white/15">
        <button
          type="button"
          onClick={() => onNavigate("PLANNER")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activePage === "PLANNER"
              ? "bg-[#252b38] text-white"
              : "text-[#6b7280] hover:text-white"
          }`}
        >
          Flight Planner
        </button>
        <button
          type="button"
          onClick={() => onNavigate("FLEET")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activePage === "FLEET"
              ? "bg-[#252b38] text-white"
              : "text-[#6b7280] hover:text-white"
          }`}
        >
          Fleet Dispatch
        </button>
      </div>

      {/* Operator Info & Tactical Sign Out (Right) */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              title="System Online"
            />
            <span className="font-medium text-[#d1d5db]">{user.email}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                user.role === "ADMIN"
                  ? "bg-[#252b38] text-[#d1d5db] border-[#343b4a]"
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {user.role}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-[#161a22] hover:bg-red-500/15 text-[#d1d5db] hover:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-[#252a36] hover:border-red-500/40 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Sign out of current tactical session"
        >
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  );
};