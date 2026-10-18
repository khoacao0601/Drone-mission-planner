// Copyright (c) 2026 Khoa Cao. All rights reserved.

import axios from 'axios';
import type { Mission, MissionCreate } from '../types/missions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auto-attach JWT Token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('flyby_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

// Auth API - Login
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
};

// API calls
export const missionAPI = {
    // Get all missions
    getMissions: async (): Promise<Mission[]> => {
        const response = await api.get<Mission[]>('/missions/');
        return response.data;
    },

    // Get single one
    getMissionDetail: async (id: number): Promise<Mission> => {
        const safeId = Number(id);
        if (!Number.isInteger(safeId) || safeId <= 0) {
            throw new Error('Invalid mission ID');
        }
        const response = await api.get<Mission>(`/missions/${encodeURIComponent(safeId)}`);
        return response.data;
    },

    // Create a new mission
    createMission: async (data: MissionCreate): Promise<Mission> => {
        const response =  await api.post<Mission>('/missions/', data);
        return response.data;
    },

    // Delete Mission
    deleteMission: async (id: number): Promise<{ message: string }> => {
        const safeId = Number(id);
        if (!Number.isInteger(safeId) || safeId <= 0) {
            throw new Error('Invalid mission ID');
        }
        const response = await api.delete<{ message: string }>(`/missions/${encodeURIComponent(safeId)}`);
        return response.data;
    },
};