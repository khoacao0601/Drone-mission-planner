// Copyright (c) 2026 Khoa Cao. All rights reserved.

import { create } from 'zustand';
import type { User } from '../types/missions';

interface AuthStore {
    user: User | null;
    token: string | null;            // Stored in RAM only (NOT in localStorage)
    isInitializing: boolean;        // True while checking session on initial load or F5
    login: (token: string, user: User) => void;
    logout: () => void;
    setInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isInitializing: true,
    // Store token and user in memory (RAM)
    login: (token, user) => {
        set({ token, user, isInitializing: false });
    },
    // Purge memory upon logout
    logout: () => {
        set({ token: null, user: null, isInitializing: false });
    },
    // Toggle initializing state
    setInitializing: (isInitializing) => {
        set({ isInitializing });
    },
}));

