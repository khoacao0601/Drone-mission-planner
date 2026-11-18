// Copyright (c) 2026 Khoa Cao. All rights reserved.

export const formatDistance = (meters: number): string => {
    if(meters <= 0){
        return "0 m";
    }

    if(meters < 1000){
        return `${Math.round(meters)} m`;
    } else {
        return `${(meters / 1000).toFixed(2)} km`;
    }
}

export const formatDuration = (seconds: number): string => {
    const totalSeconds = Math.round(seconds);

    if(totalSeconds <= 0){
        return '0s';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if(minutes > 0){
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${remainingSeconds}s`;
    }
}

export const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString)

    if(Number.isNaN(date.getTime())){
        return "N/A";
    }
    const month = String((date.getMonth() + 1)).padStart(2, "0");
    const day = String((date.getDate())).padStart(2, "0");
    const year = (date.getFullYear());
    const hours = String((date.getHours())).padStart(2, "0");
    const minutes = String((date.getMinutes())).padStart(2, "0");

    return `${month}-${day}-${year} ${hours}:${minutes}`;
}

export const formatAltitudeMode = (mode: string): string => {
    if(mode === "RELATIVE_TO_TAKEOFF"){
        return "Takeoff";
    } else if (mode === "ASL") {
        return "ASL";
    } else {
        return mode;
    }
}