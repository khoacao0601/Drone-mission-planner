// Copyright (c) 2026 Khoa Cao. All rights reserved.

import { create } from 'zustand';
import type { Mission, Waypoint, MissionType } from '../types/missions';

interface MissionStore {
    waypoints: Waypoint[];
    selectedMission: Mission | null;
    altitude: number;
    setAltitude: (alt: number) => void; 
    addWayPoint: ( point: Waypoint ) => void;
    clearWaypoint: () => void;
    setSelectedMission: (mission: Mission | null) => void;
    missionType: MissionType;
    setMissionType: (type: MissionType) => void;
    speed: number;
    setSpeed: (speed: number) => void;
}


export const useMissionStore = create<MissionStore>(
    (set) => ({
        waypoints: [],
        selectedMission: null,
        altitude: 100,
        speed: 15,
        missionType: 'AREA',
        
        setMissionType: (type) => set({ missionType: type }),
        setSpeed: (speed) => set({ speed }),
        setAltitude: (alt) => set((state) => ({
            altitude: alt,
            waypoints: state.waypoints.map((w) => ({ ...w, alt })),
        })),

        // add 1 point to list when click on map
        addWayPoint: (point) => set((state) => ({ waypoints: [...state.waypoints, point] })),

        // Reset all points
        clearWaypoint: () => set({ waypoints: [] }),

        // Pick 1 mission from list
        setSelectedMission: (mission) => set({
            selectedMission: mission,
            waypoints: mission ? mission.waypoints : [],
            missionType: mission ? mission.mission_type : 'AREA',
        })
    })
)

