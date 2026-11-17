// Copyright (c) 2026 Khoa Cao. All rights reserved.

import React from "react";
import type { MissionStatus } from "../types/missions";

const STATUS_STYLES: Record<string, string> = {
    'ASSIGNED': 'bg-sky-950/80 text-sky-300 border-sky-500/50',
    'IN_PROGRESS': 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    'COMPLETED': 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    'CANCELLED': 'bg-red-950/80 text-red-300 border-red-500/50'
}

export const StatusBadge: React.FC<{status: MissionStatus}> = ({status}) => {

    const colorClass = STATUS_STYLES[status] || 'bg-stone-800 text-stone-300 border-stone-600';

    return (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${colorClass}`}>
            {status.replace('_', ' ')}
        </span>
    )
}