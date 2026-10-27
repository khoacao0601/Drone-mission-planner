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
        <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
        {/* Background glowing decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-gray-900/90 border border-gray-700/80 rounded-xl shadow-2xl p-6 md:p-8 backdrop-blur-md">
            {/* Header Title */}
            <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Flyby Robotics</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">3D Mission Planning & Fleet Control</p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
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
                    className="w-full bg-gray-800/90 text-white text-sm px-3.5 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
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
                    className="w-full bg-gray-800/90 text-white text-sm px-3.5 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none pr-10 transition"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs focus:outline-none"
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="mt-6 pt-5 border-t border-gray-800">
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
                        ? 'bg-blue-950/40 border-blue-500/80 text-white ring-1 ring-blue-500/50'
                        : 'bg-gray-800/50 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
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