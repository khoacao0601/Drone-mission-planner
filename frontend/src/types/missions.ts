// Copyright (c) 2026 Khoa Cao. All rights reserved.

// 3D waypoint
export interface Waypoint {
    lat: number;
    lng: number;
    alt: number;
}

// User
export interface User {
    id: number;
    email: string;
    role: "ADMIN" | "PILOT"
}

// Body to create a new mission (ADMIN only)
export interface MissionCreate {
    name: string;
    description?: string;
    horizontal_speed: number;
    altitude_mode: string;
    flight_altitude: number;
    waypoints: Waypoint[];
    assigned_to_id?: number | null;
}


// Mission response returned from API
export interface Mission {
    id: number;
    name: string;
    description?: string;
    status: string;
    horizontal_speed: number;
    altitude_mode: string;
    flight_altitude: number;
    waypoints: Waypoint[];
    created_by_id: number;
    assigned_to_id?: number | null;
    assigned_to?: User | null;
    created_at: string;
}

//Mission details Card
export interface MissionDetailsCardProps {
    mission: Mission;
    isAdmin: boolean;
    onPlanNewRoute: () => void;
}

//Mission Planning Form
export interface MissionPlanningFormProps {
    onMissionCreated: () => void;
}

//Mission List Props 
export interface MissionListProps {
    missions: Mission[];
    selectedMissionId?: number | null;
    isAdmin: boolean;
    onSelectMission: (mission: Mission) => void;
    onDeleteMission: (id: number) => void;
}