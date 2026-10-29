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
    <header className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center border-b border-gray-700 shadow-md">
      {/* 1. App Title */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <h1 className="text-base md:text-lg font-bold tracking-wide">Flyby Robotics Mission Planner</h1>
      </div>

      {/* 2. Active User Profile & Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 hidden sm:inline">Operator:</span>
            <span className="font-semibold text-white">{user.email}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                user.role === 'ADMIN'
                  ? 'bg-blue-900/60 text-blue-300 border-blue-500'
                  : 'bg-emerald-900/60 text-emerald-300 border-emerald-500'
              }`}
            >
              {user.role}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-600/80 hover:bg-red-600 active:bg-red-700 text-white text-xs px-3 py-1.5 rounded border border-red-500/60 transition cursor-pointer flex items-center gap-1.5"
          title="Sign out of current session"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};