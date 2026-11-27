    // Copyright (c) 2026 Khoa Cao. All rights reserved.

    import React, { useEffect, useState } from "react";
    import { droneAPI, missionAPI } from "../services/api";
    import { useAuthStore } from "../store/useAuthStore";
    import type { Drone, Mission } from "../types/missions";
    import { formatDateTime } from "../utils/formatters";

    export const FleetPage: React.FC = () => {
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    const [drones, setDrones] = useState<Drone[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [altSelection, setAltSelection] = useState<Record<number, string>>({});

    const fetchData = () => {
        droneAPI.getDrones().then(setDrones).catch(console.error);
        missionAPI.getMissions().then(setMissions).catch(console.error);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePickup = async (droneId: number) => {
        try {
        await droneAPI.pickupDrone(droneId);
        fetchData();
        } catch (error) {
        console.error(error);
        }
    };

    const handleRelease = async (droneId: number) => {
        try {
        await droneAPI.releaseDrone(droneId);
        fetchData();
        } catch (error) {
        console.error(error);
        }
    };

    // Pick up an available drone AND record it as the Alternative Drone for a specific mission
    const handlePickupAlternative = async (
        mission: Mission,
        altDroneId: number,
    ) => {
        try {
        const targetDrone = drones.find((d) => d.id === altDroneId);
        if (targetDrone?.status === "AVAILABLE") {
            await droneAPI.pickupDrone(altDroneId);
        }
        await missionAPI.updateMissionStatus(mission.id, "ASSIGNED", altDroneId);
        fetchData();
        } catch (error) {
        console.error(error);
        }
    };

    const availableDrones = drones.filter((d) => d.status === "AVAILABLE");
    const myCheckedOutDrones = drones.filter(
        (d) => d.status === "IN_MISSION" && d.current_operator_id === user?.id,
    );

    // Active missions (ASSIGNED or IN_PROGRESS) for Admin monitoring
    const activeFleetMissions = missions.filter(
        (m) => m.status === "ASSIGNED" || m.status === "IN_PROGRESS",
    );

    // Pending ASSIGNED missions specifically for the logged-in Pilot
    const myAssignedMissions = missions.filter(
        (m) => m.status === "ASSIGNED" && m.assigned_to_id === user?.id,
    );

    const preAssignedMissions = myAssignedMissions.filter(
        (m) => m.drone_id != null,
    );
    const flexibleMissions = myAssignedMissions.filter((m) => m.drone_id == null);

    // Candidates for alternative selection: either AVAILABLE in depot or already picked up by current user
    const alternativeCandidates = drones.filter(
        (d) =>
        d.status === "AVAILABLE" ||
        (d.status === "IN_MISSION" && d.current_operator_id === user?.id),
    );

    return (
        <div className="w-full h-full overflow-y-auto bg-[#0b0d12]/80 backdrop-blur-md text-[#e5e7eb] p-6 md:p-8 select-none">
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 1. Page Header & Refresh */}
            <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Fleet Dispatch
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                {isAdmin
                    ? "Monitor fleet assignments, active operator check-outs, and pickup/release audit timestamps."
                    : "Check out hardware before field deployment, resolve unavailable mission drones, and release units after duty."}
                </p>
            </div>
            <button
                type="button"
                onClick={fetchData}
                className="bg-white/10 hover:bg-white/15 text-xs font-medium text-white px-3.5 py-2 rounded-xl border border-white/15 cursor-pointer transition flex items-center gap-2 active:scale-[0.99]"
            >
                <svg
                className="w-3.5 h-3.5 text-slate-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
                </svg>
                <span>Refresh Depot</span>
            </button>
            </div>

            {/* 2. Unified 4-Metric KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 bg-[#111622]/65 backdrop-blur-md rounded-2xl border border-white/15 divide-y md:divide-y-0 md:divide-x divide-white/15">
            <div className="px-5 py-4">
                <span className="text-[11px] font-medium text-slate-300">
                Total Fleet
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                {drones.length}
                </div>
            </div>
            <div className="px-5 py-4">
                <span className="text-[11px] font-medium text-slate-300">
                Available in Depot
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                {availableDrones.length}
                </div>
            </div>
            <div className="px-5 py-4">
                <span className="text-[11px] font-medium text-slate-300">
                Checked Out
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#38bdf8] mt-1">
                {drones.filter((d) => d.status === "IN_MISSION").length}
                </div>
            </div>
            <div className="px-5 py-4">
                <span className="text-[11px] font-medium text-slate-300">
                In Maintenance
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                {drones.filter((d) => d.status === "MAINTENANCE").length}
                </div>
            </div>
            </div>

            {/* 3. Role-Specific Section: Admin Fleet Mission Monitor vs. Pilot Mission Briefing */}
            {isAdmin ? (
            <section className="space-y-2.5">
                <h3 className="text-sm font-semibold text-white">
                Active Mission & Drone Assignments ({activeFleetMissions.length})
                </h3>
                <div className="bg-[#111622]/65 backdrop-blur-md rounded-2xl border border-white/15 divide-y divide-white/10">
                {activeFleetMissions.length === 0 ? (
                    <div className="px-5 py-3.5 text-xs text-slate-300">
                    No active or assigned missions in the fleet.
                    </div>
                ) : (
                    activeFleetMissions.map((m) => {
                    const assignedDrone = drones.find((d) => d.id === m.drone_id);
                    const isPickedUpByAssignedPilot =
                        assignedDrone?.status === "IN_MISSION" &&
                        assignedDrone?.current_operator_id === m.assigned_to_id;

                    return (
                        <div
                        key={m.id}
                        className="px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                        <div className="space-y-0.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-white">
                                {m.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-300">
                                ({m.mission_type} • {m.status})
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-sky-300">
                                Pilot:{" "}
                                {m.assigned_to ? m.assigned_to.email : "Unassigned"}
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-slate-200">
                                Drone:{" "}
                                {assignedDrone
                                ? `${assignedDrone.name} (${assignedDrone.serial_number})`
                                : "Pilot Choice at Depot"}
                            </span>
                            </div>
                            {m.description?.startsWith("Assigned Drone:") && (
                            <div className="text-[11px] text-amber-300">
                                {m.description}
                            </div>
                            )}
                        </div>

                        <div className="shrink-0">
                            {!assignedDrone && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Pilot Authorized to Choose
                            </span>
                            )}
                            {assignedDrone && isPickedUpByAssignedPilot && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                ✓ Picked Up by Pilot
                                {assignedDrone.picked_up_at
                                ? ` • ${formatDateTime(assignedDrone.picked_up_at)}`
                                : ""}
                            </span>
                            )}
                            {assignedDrone && !isPickedUpByAssignedPilot && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/5 text-slate-300 border border-white/10">
                                Awaiting Pilot Pickup ({assignedDrone.status})
                            </span>
                            )}
                        </div>
                        </div>
                    );
                    })
                )}
                </div>
            </section>
            ) : (
            <>
                {/* Pilot Section 3: Mission Briefing */}
                <section className="space-y-2.5">
                <h3 className="text-sm font-semibold text-white">
                    Mission Briefing ({myAssignedMissions.length} Assigned)
                </h3>

                <div className="bg-[#111622]/65 backdrop-blur-md rounded-2xl border border-white/15 divide-y divide-white/10">
                    {myAssignedMissions.length === 0 ? (
                    <div className="px-5 py-3.5 text-xs text-slate-300">
                        You currently have no pending (ASSIGNED) missions.
                    </div>
                    ) : (
                    <>
                        {preAssignedMissions.length === 0 && (
                        <div className="px-5 py-3 text-xs text-amber-200">
                            ℹ️ No specific drones are pre-assigned to your missions.
                            You are authorized by Admin to pick up any available
                            drone below.
                        </div>
                        )}

                        {preAssignedMissions.map((m) => {
                        const assignedDrone = drones.find(
                            (d) => d.id === m.drone_id,
                        );
                        const isPickedByMe =
                            assignedDrone?.status === "IN_MISSION" &&
                            assignedDrone?.current_operator_id === user?.id;
                        const isAvailableInDepot =
                            assignedDrone?.status === "AVAILABLE";
                        const isUnavailable =
                            assignedDrone && !isPickedByMe && !isAvailableInDepot;
                        const selectedAlt =
                            altSelection[m.id] ||
                            (alternativeCandidates[0]
                            ? String(alternativeCandidates[0].id)
                            : "");

                        return (
                            <div
                            key={m.id}
                            className="px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                            <div className="space-y-0.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-white">
                                    {m.name}
                                </span>
                                <span className="text-[11px] font-mono text-slate-300">
                                    ({m.mission_type})
                                </span>
                                {assignedDrone && (
                                    <>
                                    <span className="text-white/30">•</span>
                                    <span className="text-slate-200">
                                        {assignedDrone.name}{" "}
                                        <span className="font-mono text-slate-300">
                                        ({assignedDrone.serial_number})
                                        </span>
                                    </span>
                                    </>
                                )}
                                </div>
                                {m.description?.startsWith("Assigned Drone:") && (
                                <div className="text-[11px] text-amber-300">
                                    {m.description}
                                </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {isPickedByMe && (
                                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    ✓ Ready in Your Fleet
                                </span>
                                )}

                                {isAvailableInDepot && assignedDrone && (
                                <button
                                    type="button"
                                    onClick={() =>
                                    void handlePickup(assignedDrone.id)
                                    }
                                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium px-3.5 py-1.5 rounded-full cursor-pointer transition active:scale-[0.99]"
                                >
                                    Pick Up Assigned
                                </button>
                                )}

                                {isUnavailable && assignedDrone && (
                                <div className="flex flex-wrap items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl">
                                    <span className="text-[11px] text-amber-200">
                                    ⚠️ {assignedDrone.serial_number} unavailable
                                    (Notify Admin first):
                                    </span>
                                    <select
                                    value={selectedAlt}
                                    onChange={(e) =>
                                        setAltSelection({
                                        ...altSelection,
                                        [m.id]: e.target.value,
                                        })
                                    }
                                    className="bg-[#0b0d12]/80 text-xs text-white px-2.5 py-1 rounded-lg border border-white/15 outline-none"
                                    >
                                    {alternativeCandidates.map((cand) => (
                                        <option key={cand.id} value={cand.id}>
                                        {cand.name} ({cand.serial_number}) •{" "}
                                        {cand.status === "AVAILABLE"
                                            ? "In Depot"
                                            : "Picked by You"}
                                        </option>
                                    ))}
                                    </select>
                                    <button
                                    type="button"
                                    disabled={!selectedAlt}
                                    onClick={() =>
                                        void handlePickupAlternative(
                                        m,
                                        Number(selectedAlt),
                                        )
                                    }
                                    className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-medium px-3 py-1 rounded-full cursor-pointer transition disabled:opacity-40"
                                    >
                                    Pick Alternative
                                    </button>
                                </div>
                                )}
                            </div>
                            </div>
                        );
                        })}

                        {flexibleMissions.length > 0 && (
                        <div className="px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div className="text-xs text-amber-200">
                            <span className="font-semibold">
                                Pilot-Choice Missions ({flexibleMissions.length}):
                            </span>{" "}
                            <span className="text-white">
                                {flexibleMissions.map((m) => m.name).join(" • ")}
                            </span>
                            </div>
                            <span className="text-[11px] text-slate-300">
                            Pick up any available unit below
                            </span>
                        </div>
                        )}
                    </>
                    )}
                </div>
                </section>

                {/* Pilot Section 4: My Active Units */}
                <section className="space-y-2.5">
                {myCheckedOutDrones.length === 0 ? (
                    <div className="bg-[#111622]/65 backdrop-blur-md rounded-2xl border border-white/15 px-5 py-3 flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                        My Active Units (0)
                    </span>
                    <span className="text-xs text-slate-300">
                        No active hardware currently checked out.
                    </span>
                    </div>
                ) : (
                    <>
                    <h3 className="text-sm font-semibold text-white">
                        My Active Units ({myCheckedOutDrones.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {myCheckedOutDrones.map((d) => (
                        <div
                            key={d.id}
                            className="bg-[#111622]/65 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-500/30 flex justify-between items-center gap-3"
                        >
                            <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                                {d.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                                {d.serial_number} • {d.battery_level}%
                            </div>
                            </div>
                            <button
                            type="button"
                            onClick={() => void handleRelease(d.id)}
                            className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-500/30 cursor-pointer transition shrink-0"
                            >
                            Release
                            </button>
                        </div>
                        ))}
                    </div>
                    </>
                )}
                </section>
            </>
            )}

            {/* 5. Company Drone Depot & Audit Log */}
            <section className="space-y-2.5">
            <h3 className="text-sm font-semibold text-white">
                Company Drone Depot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drones.map((d) => {
                const canRelease =
                    d.status === "IN_MISSION" &&
                    (isAdmin || d.current_operator_id === user?.id);
                const requiredForMissions = activeFleetMissions.filter(
                    (m) => m.drone_id === d.id,
                );
                let batteryColor = "bg-red-400";
                if (d.battery_level >= 60) {
                    batteryColor = "bg-emerald-400";
                } else if (d.battery_level >= 30) {
                    batteryColor = "bg-amber-400";
                }

                let statusBadgeClass =
                    "bg-amber-500/15 text-amber-300 border-amber-500/30";
                if (d.status === "AVAILABLE") {
                    statusBadgeClass =
                    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                } else if (d.status === "IN_MISSION") {
                    statusBadgeClass =
                    "bg-sky-500/15 text-sky-300 border-sky-500/30";
                }

                return (
                    <div
                    key={d.id}
                    className="bg-[#111622]/65 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/15 flex flex-col justify-between gap-4"
                    >
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                            {d.name}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5 truncate">
                            {d.model}
                        </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass}`}
                        >
                            {d.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-300">
                            {d.serial_number}
                        </span>
                        </div>
                    </div>

                    {/* Battery Bar & Assigned Mission Pill */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 flex-1">
                        <span className="text-[11px] font-medium text-slate-300 shrink-0">
                            Battery
                        </span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                            className={`h-full rounded-full ${batteryColor}`}
                            style={{
                                width: `${Math.min(100, Math.max(0, d.battery_level))}%`,
                            }}
                            />
                        </div>
                        <span className="text-xs font-mono tabular-nums text-white font-medium w-9 text-right">
                            {d.battery_level}%
                        </span>
                        </div>

                        {requiredForMissions.length > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#2563eb]/20 text-sky-300 border border-[#2563eb]/40 whitespace-nowrap">
                            Assigned:{" "}
                            {requiredForMissions.map((m) => m.name).join(", ")}
                        </span>
                        ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 text-slate-300 border border-white/10 whitespace-nowrap">
                            {d.status === "MAINTENANCE"
                            ? "Diagnostics"
                            : "Unassigned"}
                        </span>
                        )}
                    </div>

                    {/* Card Footer: Operator + Pickup/Release Timestamps + Role-Appropriate Action */}
                    <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-white/10">
                        <div className="text-[11px] text-slate-300 space-y-0.5 min-w-0">
                        <div>
                            Operator:{" "}
                            <strong className="text-white font-medium">
                            {d.current_operator
                                ? d.current_operator.email
                                : "None"}
                            </strong>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400 font-mono">
                            <span>
                            Picked Up:{" "}
                            {d.picked_up_at
                                ? formatDateTime(d.picked_up_at)
                                : "—"}
                            </span>
                            <span>
                            Released:{" "}
                            {d.released_at ? formatDateTime(d.released_at) : "—"}
                            </span>
                        </div>
                        </div>

                        <div className="shrink-0">
                        {!isAdmin && d.status === "AVAILABLE" && (
                            <button
                            type="button"
                            onClick={() => void handlePickup(d.id)}
                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium px-4 py-1.5 rounded-full cursor-pointer transition active:scale-[0.99]"
                            >
                            Pick Up
                            </button>
                        )}
                        {isAdmin && d.status === "AVAILABLE" && (
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                            In Depot
                            </span>
                        )}
                        {canRelease && (
                            <button
                            type="button"
                            onClick={() => void handleRelease(d.id)}
                            className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-medium px-4 py-1.5 rounded-full border border-amber-500/30 cursor-pointer transition"
                            >
                            Release
                            </button>
                        )}
                        {d.status === "MAINTENANCE" && (
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                            Unavailable
                            </span>
                        )}
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            </section>
        </div>
        </div>
    );
    };
