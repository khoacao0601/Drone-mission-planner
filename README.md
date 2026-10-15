# Drone Mission Planner

> Tactical 3D Drone Fleet & Mission Planning System inspired by DJI FlightHub 2. 

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deck.gl](https://img.shields.io/badge/Deck.gl-9.4-blue.svg)](https://deck.gl)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)

---

## 🌟 System Overview & Key Features

* **3D Tactical WebGL Mission Planning:** Real-time interactive flight trajectory visualization using **Deck.gl v9** and **Mapbox GL v3** satellite imagery:
  * **3D Altitude Drop-Lines (`LineLayer`):** Vertical gold reference poles connecting ground coordinates to UAV flight elevation ($Z$-axis).
  * **Tactical Mission Area (`PolygonLayer`):** Semi-transparent cyan grid overlay covering the operational flight perimeter.
  * **3D Flight Path (`PathLayer`):** Cyan trajectory connecting planned navigation waypoints.
  * **Waypoint Spheres (`ScatterplotLayer`):** Distinct elevated markers indicating coordinates and survey targets.
* **Role-Based Access Control (RBAC) & Multi-Tenant Pilot Assignment:**
  * **Admin (Commander):** Full privileges to create, configure (speed, altitude), assign, and delete missions.
  * **Pilots (Operators):** Strictly scoped access; pilots can **only** inspect missions explicitly assigned to them.
* **IDOR Prevention (Insecure Direct Object Reference):**
  * Backend SQL query-level filtering prevents unauthorized pilots from viewing or manipulating missions belonging to other operators.
* **Modern 3-Tier Architecture:** Clean separation of concerns between API Controllers, Services, CRUD/ORM Layer, and PostgreSQL.

---

## 🛠️ Tech Stack

* **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (Strict `Mapped` type annotations), Pydantic V2, PostgreSQL 15, JWT Authentication (bcrypt + python-jose).
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Deck.gl v9, Mapbox GL v3, Zustand (Global State Management), Axios.
* **Infrastructure & DevOps:** Docker, Docker Compose, Linux Alpine containers.

---

## 🚀 Quick Start Guide

### Prerequisites
* [Docker & Docker Compose](https://www.docker.com/get-started) installed and running.
* [Node.js](https://nodejs.org) (v18 or higher) and `npm`.
* A free [Mapbox Public Token](https://account.mapbox.com/).

---

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/flyby-robotic-mission-planner.git
cd flyby-robotic-mission-planner
```

---

### Step 2: Environment Configuration

1. **Frontend Environment:**
   Create a `.env` file in the `frontend/` directory:
   ```bash
   # frontend/.env
   VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
   ```

2. **Root Environment (Optional defaults):**
   A `.env` file in the project root can configure database ports and secrets:
   ```bash
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password123
   POSTGRES_DB=flyby_db
   ```

---

### Step 3: Launch Backend & Database (Docker)

Start the PostgreSQL database and FastAPI backend services with Docker Compose:
```bash
docker compose up -d --build
```

Verify services are healthy:
* Backend API: [http://localhost:8000/docs](http://localhost:8000/docs) (Interactive Swagger UI)
* PostgreSQL: running on port `5433` (mapped from container `5432`).

---

### Step 4: Seed Demo Accounts

Populate the database with pre-configured Admin and Pilot accounts:
```bash
docker exec flyby_robotics_backend python seed.py
```

#### Pre-seeded Demo Credentials
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@flyby.com` | `admin123` | Full access: Plan missions, assign pilots, delete |
| **Pilot 1** | `pilot1@flyby.com` | `pilot123` | View-only: Scoped strictly to missions assigned to Pilot 1 |
| **Pilot 2** | `pilot2@flyby.com` | `pilot123` | View-only: Scoped strictly to missions assigned to Pilot 2 |

---

### Step 5: Launch Frontend Application

In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Step-by-Step Live Demo & Verification

### 1. Test 3D Tactical Planning (Admin)
1. Ensure the active role on the header is **Admin**.
2. Enter a Mission Name (e.g., `Perimeter Alpha`), set **Speed** (e.g., `15 m/s`), and **Altitude** (e.g., `100 m`).
3. Select **Assign to Pilot**: `Pilot 1 (pilot1@flyby.com)`.
4. **Click 3 to 5 points** on the satellite map:
   * Notice the 3D gold drop-lines anchored to the ground.
   * Notice the cyan semi-transparent mission zone covering the operational area.
5. Click **"Save Mission"**. The mission will appear in the catalog.

### 2. Verify 3D Navigation Controls
* **Tilt / Pitch (3D Perspective):** Hold **Right-Click** and drag up/down (or hold `Ctrl` + Left-Click drag).
* **Rotate / Bearing:** Hold **Right-Click** and drag left/right.
* **Zoom:** Mouse scroll wheel.

### 3. Verify RBAC & Multi-Tenant Data Isolation
1. Click **"Pilot 1"** on the header:
   * Notice the planning form automatically disappears (Read-Only Mode).
   * Notice **`Perimeter Alpha`** is visible in the catalog. Click it to view the 3D flight path.
2. Click **"Pilot 2"** on the header:
   * Notice **`Perimeter Alpha` is NOT visible** to Pilot 2, proving strict SQL-level tenant isolation.
3. Switch back to **"Admin"**:
   * Admin has global visibility over all fleet missions and can click the red **`✕`** icon to delete missions.

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials and returns JWT bearer token + user metadata |
| `GET` | `/api/v1/missions/` | Authenticated | Retrieves missions scoped by user role (Admin sees all; Pilot sees assigned) |
| `POST` | `/api/v1/missions/` | Admin Only | Creates a new mission with 3D waypoints and flight telemetry |
| `GET` | `/api/v1/missions/{id}` | Authenticated | Retrieves single mission detail with IDOR ownership validation |
| `DELETE` | `/api/v1/missions/{id}` | Admin Only | Permanently deletes a mission |

---

## 🏛️ Architecture Highlights for Reviewers

* **SQLAlchemy 2.0 Modern Standards:** All models utilize `Mapped[...]` and `mapped_column()` typing, eliminating legacy runtime ambiguity.
* **Decoupled Architecture:** Business logic is encapsulated in `services/`, database operations in `crud/`, request validation in `schemas/`, and routing in `api/`.
* **Zero Overhead 3D Rendering:** Pure WebGL rendering using Deck.gl layers over Mapbox satellite tiles without loading heavy external 3D engines.

---

## 📄 License
Copyright (c) 2026 Khoa Cao. All rights reserved.
