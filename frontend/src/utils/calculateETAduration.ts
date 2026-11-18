// Copyright (c) 2026 Khoa Cao. All rights reserved.

// Calculate estimate duration time

export const calculateEstimatedDuration = (distanceMeters: number , speedMps: number): number => {
    if(distanceMeters <= 0 || speedMps <= 0){
        return 0;
    }

    return distanceMeters/speedMps;
}