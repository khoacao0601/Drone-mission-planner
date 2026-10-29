// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authAPI } from '../services/api';

// 3 Test Accounts for quick demo
const DEMO_ACCOUNTS = [
    {
        role: 'ADMIN',
        email: 'admin@flyby.com',
        password: 'admin123',
        label: 'Fleet Commander (Admin)',
        badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-500',
    },
    {
        role: 'PILOT',
        email: 'pilot1@flyby.com',
        password: 'pilot123',
        label: 'Operator 1 (Pilot)',
        badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-500',
    },
    {
        role: 'PILOT',
        email: 'pilot2@flyby.com',
        password: 'pilot123',
        label: 'Operator 2 (Pilot)',
        badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-500',
    },
];

export const LoginPage: React.FC = () => {
    const login = useAuthStore((state) => state.login);

    // Default to Admin demo account as requested
    const [email, setEmail] = useState('admin@flyby.com');
    const [password, setPassword] = useState('admin123');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Quick fill demo account
    const handleSelectDemo = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        setErrorMessage(null);
    };

    // Handle Login submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
        setErrorMessage('Please enter both email and password.');
        return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
        const data = await authAPI.login(email, password);
        // Save Access Token & User in RAM (Zustand)
        login(data.access_token, data.user);
        } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        const detail = error.response?.data?.detail;
        setErrorMessage(detail || 'Login failed. Please check your credentials.');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen relative overflow-hidden select-none flex flex-col justify-center items-center px-4">
        {/* 1. LAYER NỀN: NỬA TRÊN LÀ BẦU TRỜI (SKY), NỬA DƯỚI LÀ MẶT ĐẤT (EARTH) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col">
            {/* Nửa trên: Sky atmospheric gradient */}
            <div className="h-1/2 w-full bg-gradient-to-b from-sky-950 via-[#0a2540] to-[#0f172a] relative">
            {/* Vầng sáng chân trời */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-cyan-400/15 rounded-full blur-3xl" />
            </div>

            {/* Nửa dưới: Earth/Ground terrain gradient */}
            <div className="h-1/2 w-full bg-gradient-to-b from-[#0f172a] via-[#0d140e] to-[#080b08] relative border-t border-cyan-500/20">
            {/* Lưới tọa độ mặt đất 3D (Tactical ground grid) */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
        </div>

        {/* 2. LAYER ĐƯỜNG BAY 3D (FLIGHT PATH & GOLDEN DROP-LINES) */}
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
            <linearGradient id="flightGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            </defs>

            {/* Drop-lines: Nối từ Waypoint trên trời cắm thẳng xuống mặt đất (y=450 là đường chân trời) */}
            <line x1="280" y1="260" x2="280" y2="450" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="280" cy="450" r="3" fill="#ffd700" opacity="0.8" />

            <line x1="520" y1="180" x2="520" y2="450" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            <circle cx="520" cy="450" r="3" fill="#ffd700" opacity="0.8" />

            <line x1="920" y1="210" x2="920" y2="450" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            <circle cx="920" cy="450" r="3" fill="#ffd700" opacity="0.8" />

            <line x1="1180" y1="310" x2="1180" y2="450" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="1180" cy="450" r="3" fill="#ffd700" opacity="0.8" />

            {/* 3D Flight Path curve */}
            <path
            d="M 50,380 C 220,330 280,260 520,180 C 720,120 780,240 920,210 C 1080,180 1140,320 1390,290"
            fill="none"
            stroke="url(#flightGlow)"
            strokeWidth="3.5"
            filter="url(#glow)"
            />

            {/* Waypoints (Các trạm bay trên không) */}
            <circle cx="280" cy="260" r="5" fill="#ffffff" stroke="#00f0ff" strokeWidth="2.5" />
            <circle cx="520" cy="180" r="6" fill="#ffffff" stroke="#00f0ff" strokeWidth="3" />
            <circle cx="920" cy="210" r="6" fill="#ffffff" stroke="#00f0ff" strokeWidth="3" />
            <circle cx="1180" cy="310" r="5" fill="#ffffff" stroke="#00f0ff" strokeWidth="2.5" />
        </svg>

        {/* 3. KHỐI FORM ĐĂNG NHẬP (TACTICAL GLASSMORPHISM) */}
        <div className="relative z-10 w-full max-w-md bg-gray-900/85 border border-sky-500/30 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-xl">
            {/* Header Title */}
            <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/40 text-cyan-300 mb-3 shadow-lg shadow-cyan-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Drone Planner</h1>
            <p className="text-xs text-cyan-300/80 mt-1 uppercase tracking-widest font-mono">Tactical 3D Flight Control</p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-500/70 text-red-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
            </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Email Address
                </label>
                <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@flyby.com"
                required
                className="w-full bg-slate-950/80 text-white text-sm px-3.5 py-2.5 rounded-lg border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Password
                </label>
                <div className="relative">
                <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950/80 text-white text-sm px-3.5 py-2.5 rounded-lg border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none pr-10 transition"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs focus:outline-none cursor-pointer"
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:from-cyan-600 active:to-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
                {isLoading ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Authenticating...</span>
                </>
                ) : (
                <span>Sign In to Flight Control</span>
                )}
            </button>
            </form>

            {/* Demo Accounts Helper */}
            <div className="mt-6 pt-5 border-t border-gray-800/80">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5">
                Quick Select Demo Account:
            </p>
            <div className="grid grid-cols-1 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = email === acc.email;
                return (
                    <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email, acc.password)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex justify-between items-center transition cursor-pointer ${
                        isSelected
                        ? 'bg-cyan-950/40 border-cyan-400/80 text-white ring-1 ring-cyan-400/50 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                    >
                    <div>
                        <div className="font-medium text-white">{acc.label}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{acc.email}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${acc.badgeColor}`}>
                        {acc.role}
                    </span>
                    </button>
                );
                })}
            </div>
            </div>
        </div>
        </div>
    );
};