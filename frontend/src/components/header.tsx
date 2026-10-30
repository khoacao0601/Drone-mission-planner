// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authAPI } from '../services/api';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  // Handle Logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear RAM state in Zustand
      logout();
    }
  };

  return (
    <header className="relative bg-gradient-to-r from-[#061426] via-[#0a2540] to-[#081728] text-white px-4 py-2.5 flex justify-between items-center border-b border-cyan-500/30 shadow-lg shadow-cyan-950/50 overflow-hidden select-none">
      {/* 1. Background Decorative Layer: SVG Flight Path synced with Login page theme */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="headerFlightGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Decorative golden drop-lines */}
        <line x1="260" y1="28" x2="260" y2="60" stroke="#ffd700" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <line x1="680" y1="20" x2="680" y2="60" stroke="#ffd700" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <line x1="940" y1="32" x2="940" y2="60" stroke="#ffd700" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />

        {/* Smooth 3D flight trajectory curve */}
        <path
          d="M 0,42 C 150,42 220,28 380,28 C 540,28 600,18 720,20 C 850,22 900,34 1050,32 C 1120,30 1160,25 1200,24"
          fill="none"
          stroke="url(#headerFlightGlow)"
          strokeWidth="2.5"
        />

        {/* Glowing waypoints along the flight path */}
        <circle cx="260" cy="28" r="3.5" fill="#ffffff" stroke="#00f0ff" strokeWidth="2" />
        <circle cx="680" cy="20" r="4" fill="#ffffff" stroke="#00f0ff" strokeWidth="2" />
        <circle cx="940" cy="32" r="3.5" fill="#ffffff" stroke="#00f0ff" strokeWidth="2" />
      </svg>

      {/* 2. Brand & Tactical Title Section (Left) */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Radar Icon with glowing effect */}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 text-cyan-300 shadow-md shadow-cyan-500/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold tracking-wide text-white">
              Flyby Robotics <span className="text-cyan-400 font-semibold">Mission Planner</span>
            </h1>
            <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              3D TACTICAL
            </span>
          </div>
          <p className="text-[10px] text-cyan-300/70 font-mono tracking-wider hidden sm:block">
            FLEET CONTROL & AUTONOMOUS ROUTE SYSTEM
          </p>
        </div>
      </div>

      {/* 3. Operator Info & Tactical Sign Out (Right) */}
      <div className="relative z-10 flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 bg-slate-900/60 border border-sky-500/20 px-3 py-1 rounded-lg backdrop-blur-md text-xs">
            {/* Real-time connection status light */}
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
            <span className="text-gray-400 hidden md:inline text-[11px]">Operator:</span>
            <span className="font-medium text-slate-200">{user.email}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                user.role === 'ADMIN'
                  ? 'bg-blue-900/60 text-blue-300 border-blue-500/80'
                  : 'bg-emerald-900/60 text-emerald-300 border-emerald-500/80'
              }`}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Tactical Sign Out Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500/20 hover:bg-red-600/80 text-red-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-red-500/40 hover:border-red-500 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Sign out of current tactical session"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  );
};