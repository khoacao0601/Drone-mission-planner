// Copyright (c) 2026 Khoa Cao. All rights reserved.

import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import type { Mission, MissionCreate } from '../types/missions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true, // allow sending and receiving HttpOnly cookies across origins
});

// 1. Request Interceptor: Attach Access Token from RAM (Zustand)
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor: Silent Refresh on 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If error is 401 and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Avoid infinite loops if the refresh endpoint itself returns 401
            if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }
            originalRequest._retry = true;
            try {
                // Silently call refresh endpoint using the HttpOnly cookie
                const data = await authAPI.refresh();
                useAuthStore.getState().login(data.access_token, data.user);
                // Retry original request with new access token
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token also expired or invalid -> log out
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// 3. Auth API calls
export const authAPI = {
    // Log in with email & password
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    // Refresh access token via HttpOnly cookie
    refresh: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },
    // Log out and clear HttpOnly cookie
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },
};

// 4. Mission API calls
export const missionAPI = {
    getMissions: async (): Promise<Mission[]> => {
        const response = await api.get<Mission[]>('/missions/');
        return response.data;
    },
    getMissionDetail: async (id: number): Promise<Mission> => {
        const safeId = Number(id);
        if (!Number.isInteger(safeId) || safeId <= 0) {
            throw new Error('Invalid mission ID');
        }
        const response = await api.get<Mission>(`/missions/${encodeURIComponent(safeId)}`);
        return response.data;
    },
    createMission: async (data: MissionCreate): Promise<Mission> => {
        const response = await api.post<Mission>('/missions/', data);
        return response.data;
    },
    deleteMission: async (id: number): Promise<{ message: string }> => {
        const safeId = Number(id);
        if (!Number.isInteger(safeId) || safeId <= 0) {
            throw new Error('Invalid mission ID');
        }
        const response = await api.delete<{ message: string }>(`/missions/${encodeURIComponent(safeId)}`);
        return response.data;
    },
};