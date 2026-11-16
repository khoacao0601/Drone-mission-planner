# GEMINI Context File: Drone Mission Planner

> **Note for AI Agents**: Read this file first. It contains the complete architectural blueprint, tech stack, data models, API contracts, frontend state management, business rules, RBAC logic, and development workflows for the **Drone Mission Planner** repository. Relying on this file prevents unnecessary multi-file exploratory scans and conserves token usage.

---

## 1. Project Overview & Core Mission

**Drone Mission Planner** is a full-stack tactical 3D Drone Fleet and Mission Planning platform inspired by DJI FlightHub 2. It enables tactical operations commanders (Admins) to plan 3D flight routes directly on a satellite map with altitude-aware waypoints and assign them to specific drone operators (Pilots). Pilots operate under strict multi-tenant data isolation and view-only permissions.

* **Author**: Khoa Cao (2026)
* **Core Value Propositions**:
  * Real-time 3D WebGL visualization of drone flight paths, ground-to-altitude drop-lines, and mission perimeter areas without heavy 3D game engine overhead.
  * Robust Role-Based Access Control (RBAC) and strict database-level IDOR (Insecure Direct Object Reference) prevention.
  * Strict decoupled 3-tier architecture (API $\to$ Services $\to$ CRUD $\to$ ORM/DB).

---

## 2. Tech Stack Matrix

| Domain | Technology | Version / Specifics | Role / Key Highlights |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | **Python / FastAPI** | Python 3.11, FastAPI 0.110+ | High-performance asynchronous REST API |
| **ORM / Database** | **SQLAlchemy** | 2.0+ (`Mapped`, `mapped_column`) | Strictly typed relational ORM |
| **Database** | **PostgreSQL** | 15 (Alpine) | Stores relational entities & JSONB waypoints |
| **Validation / DTO** | **Pydantic** | V2 (`pydantic-settings`) | Request/response validation & serialization |
| **Security & Auth** | **JWT / Bcrypt** | `python-jose`, `passlib[bcrypt]` | Stateless Bearer token auth (`HS256`, 24h exp) |
| **Frontend Framework**| **React** | 19.x | Modern functional UI with Hooks |
| **Language** | **TypeScript** | 5.x / 6.x | Strict type safety across client interfaces |
| **Build Tool** | **Vite** | 8.x (`@vitejs/plugin-react`) | Fast HMR & bundling |
| **Styling** | **Tailwind CSS** | v4 (`@tailwindcss/vite`) | Dark-theme tactical UI styling |
| **3D & Map Engine** | **Deck.gl & Mapbox** | Deck.gl 9.4+, Mapbox GL 3.31+ | WebGL overlay layers on satellite base tiles |
| **State Management** | **Zustand** | 5.x | Lightweight decoupled stores (Auth & Mission) |
| **HTTP Client** | **Axios** | 1.x | Automatic JWT interceptor handling |
| **DevOps** | **Docker & Compose** | Compose v3.8 | Containerized PostgreSQL (port 5433:5432) & API (8000) |

---

## 3. Repository File Tree

```
c:\drone-mission-planner\
├── .env.example                     # Root environment template (Postgres credentials & ports)
├── docker-compose.yml               # Orchestrates db (Postgres 15) and backend service
├── README.md                        # User-facing project documentation and quickstart
├── GEMINI.md                        # Master AI context and system specification (this file)
│
├── backend/
│   ├── Dockerfile                   # Python 3.11 slim-based container build
│   ├── requirements.txt             # Backend dependencies
│   ├── main.py                      # FastAPI app entry point, CORS config, router registration
│   ├── seed.py                      # Database seeding script for demo accounts
│   │
│   ├── core/
│   │   ├── config.py                # BaseSettings: DB credentials, JWT secrets, .env resolution
│   │   ├── database.py              # Engine, DeclarativeBase, SessionLocal, get_db dependency
│   │   └── security.py              # Password hashing (bcrypt), verification, JWT token creation
│   │
│   ├── models/
│   │   ├── user.py                  # User SQLAlchemy model (table: "users")
│   │   └── mission.py               # Mission SQLAlchemy model (table: "missions", JSONB waypoints)
│   │
│   ├── schemas/
│   │   ├── user.py                  # Pydantic schemas: UserLogin, UserResponse, Token
│   │   └── mission.py               # Pydantic schemas: MissionCreate, MissionResponse
│   │
│   ├── crud/
│   │   ├── crud_user.py             # User DB queries (get_user_by_email)
│   │   └── crud_mission.py          # Mission DB queries (get_mission, create_mission, delete, etc.)
│   │
│   ├── services/
│   │   ├── auth_service.py          # Authentication business logic & token issuance
│   │   └── mission_service.py       # Mission business logic, tenant isolation & IDOR validation
│   │
│   └── api/
│       ├── dependencies.py          # Auth dependencies: get_current_user, is_admin (OAuth2Bearer)
│       └── v1/
│           ├── auth.py              # Auth controller: POST /api/v1/auth/login
│           └── mission.py           # Mission controller: CRUD endpoints under /api/v1/missions
│
└── frontend/
    ├── package.json                 # React 19, Deck.gl, Mapbox, Tailwind, Zustand deps
    ├── vite.config.ts               # Vite configuration with React and Tailwind plugins
    ├── tsconfig.json                # TypeScript project configuration
    ├── .env.example                 # Frontend env template (VITE_MAPBOX_TOKEN)
    ├── index.html                   # HTML entry root
    │
    └── src/
        ├── App.tsx                  # Root app layout (Header, Sidebar, MapViewer)
        ├── App.css / index.css      # Base styling and Tailwind imports
        ├── main.tsx                 # React DOM mount point
        │
        ├── types/
        │   └── missions.ts          # TypeScript interfaces: Waypoint, User, Mission, MissionCreate
        │
        ├── services/
        │   └── api.ts               # Axios instance with request JWT interceptor, authAPI, missionAPI
        │
        ├── store/
        │   ├── useAuthStore.ts      # Zustand store for active user and JWT token persistence
        │   └── useMissionStore.ts   # Zustand store for waypoints, altitude slider, selected mission
        │
        └── components/
            ├── header.tsx           # Header bar, displays active user/role, role quick-switcher
            ├── sidebar.tsx          # Floating planning panel (Admin form vs Pilot view-only, catalog)
            └── mapViewer.tsx        # Deck.gl 3D canvas (LineLayer, PolygonLayer, PathLayer, Scatterplot)
```

---

## 4. Database Schema & Data Models

### 4.1. `users` Table
Defined in [backend/models/user.py](file:///c:/drone-mission-planner/backend/models/user.py):
* `id` (`Integer`, Primary Key, indexed)
* `email` (`String`, Unique, indexed, non-nullable)
* `hashed_password` (`String`, non-nullable)
* `role` (`String`, default `"PILOT"`, valid values: `"ADMIN"`, `"PILOT"`)
* `created_at` (`DateTime`, default `func.now()`)

### 4.2. `missions` Table
Defined in [backend/models/mission.py](file:///c:/drone-mission-planner/backend/models/mission.py):
* `id` (`Integer`, Primary Key, indexed)
* `name` (`String`, non-nullable)
* `description` (`String`, nullable)
* `status` (`String`, default `"DRAFT"`)
* `horizontal_speed` (`Float`, default `10.0`) — in m/s
* `altitude_mode` (`String`, default `"ASL"`, e.g., `"RELATIVE_TO_TAKEOFF"`)
* `flight_altitude` (`Float`, default `50.0`) — in meters
* `waypoints` (`JSONB`, default `[]`) — Array of objects: `[{"lat": float, "lng": float, "alt": float}]`
* `created_by_id` (`Integer`, ForeignKey `users.id`, nullable)
* `assigned_to_id` (`Integer`, ForeignKey `users.id`, nullable)
* `created_at` (`DateTime`, default `func.now()`)

---

## 5. Security & RBAC Implementation Rules

1. **Authentication Flow**:
   * Client posts credentials to `POST /api/v1/auth/login`.
   * Backend validates bcrypt hash, generates JWT encoded with `settings.SECRET_KEY` and algorithm `HS256`.
   * JWT payload structure: `{"sub": user.email, "role": user.role, "id": user.id, "exp": expiration}`.
   * Client stores token in `localStorage.getItem('flyby_token')` and attaches it via Axios interceptor: `Authorization: Bearer <token>`.

2. **Authorization & IDOR Protection**:
   * **Admin Access (`ADMIN`)**:
     * Passes `is_admin` dependency in `api/dependencies.py`.
     * Has global visibility on `GET /api/v1/missions/` (returns all records).
     * Has exclusive permission on `POST /api/v1/missions/` and `DELETE /api/v1/missions/{id}`.
   * **Pilot Access (`PILOT`)**:
     * Scoped at SQL level: `Mission.assigned_to_id == current_user.id`.
     * Single record retrieval `GET /api/v1/missions/{id}` explicitly enforces:
       ```python
       if current_user.role.upper() != "ADMIN" and mission.assigned_to_id != current_user.id:
           raise HTTPException(status_code=403, detail="You don't have permission to view this mission")
       ```
     * Prevents Insecure Direct Object Reference (IDOR) attacks across pilots.

---

## 6. Pre-seeded Demo Accounts

Seeded via `docker exec flyby_robotics_backend python seed.py` or running [backend/seed.py](file:///c:/drone-mission-planner/backend/seed.py):

| User Email | Plaintext Password | Role | User ID | Description |
| :--- | :--- | :--- | :--- | :--- |
| `admin@flyby.com` | `admin123` | `ADMIN` | 1 | Fleet Commander: full create/read/delete permissions |
| `pilot1@flyby.com` | `pilot123` | `PILOT` | 2 | Operator 1: read-only access to missions where `assigned_to_id == 2` |
| `pilot2@flyby.com` | `pilot123` | `PILOT` | 3 | Operator 2: read-only access to missions where `assigned_to_id == 3` |

---

## 7. API Specification Reference

All endpoints are prefixed with `/api/v1`.

### 7.1. Auth Endpoints
* **`POST /api/v1/auth/login`**
  * **Auth**: Public
  * **Request Body**: `{"email": "...", "password": "..."}`
  * **Response (`200 OK`)**:
    ```json
    {
      "access_token": "eyJhbGciOi...",
      "token_type": "bearer",
      "user": {
        "id": 1,
        "email": "admin@flyby.com",
        "role": "ADMIN",
        "created_at": "2026-10-15T00:00:00"
      }
    }
    ```

### 7.2. Mission Endpoints
* **`GET /api/v1/missions/`**
  * **Auth**: Authenticated (`get_current_user`)
  * **Response (`200 OK`)**: `List[MissionResponse]` (filtered by role).
* **`POST /api/v1/missions/`**
  * **Auth**: Admin only (`is_admin`)
  * **Request Body**:
    ```json
    {
      "name": "Perimeter Alpha",
      "description": "Optional description",
      "horizontal_speed": 15.0,
      "altitude_mode": "RELATIVE_TO_TAKEOFF",
      "flight_altitude": 100.0,
      "assigned_to_id": 2,
      "waypoints": [
        {"lng": -118.2437, "lat": 34.0522, "alt": 100.0},
        {"lng": -118.2410, "lat": 34.0535, "alt": 100.0}
      ]
    }
    ```
  * **Response (`201 Created`)**: `MissionResponse`
* **`GET /api/v1/missions/{id}`**
  * **Auth**: Authenticated (`get_current_user` with IDOR check)
  * **Response (`200 OK`)**: `MissionResponse` (or `403 Forbidden` if unauthorized pilot).
* **`DELETE /api/v1/missions/{id}`**
  * **Auth**: Admin only (`is_admin`)
  * **Response (`200 OK`)**: `{"message": "Mission deleted successfully!"}`

---

## 8. Frontend Architecture & 3D Visualization Details

### 8.1. Coordinate System & Layer Mapping
* **Critical Coordinate Convention**:
  * API / State: Objects format as `{ lat: number, lng: number, alt: number }`.
  * Deck.gl / Mapbox: Layers require coordinates as `[lng, lat, alt]` (`[x, y, z]`).
* **Deck.gl v9 Layers** (defined in [frontend/src/components/mapViewer.tsx](file:///c:/drone-mission-planner/frontend/src/components/mapViewer.tsx)):
  1. **`LineLayer` (`drop-lines`)**:
     * Source: `[w.lng, w.lat, 0]` (ground)
     * Target: `[w.lng, w.lat, w.alt]` (UAV flight altitude)
     * Color: Gold `[255, 215, 0]`, Width: 3
  2. **`PolygonLayer` (`area-fill`)**:
     * Rendered when waypoints count $\ge 3$.
     * Coordinates: `waypoints.map(w => [w.lng, w.lat, w.alt])`.
     * Fill Color: Cyan transparent `[0, 240, 255, 40]`.
  3. **`PathLayer` (`flight-path`)**:
     * Rendered when waypoints count $\ge 2$.
     * Path: `waypoints.map(w => [w.lng, w.lat, w.alt])`.
     * Color: Cyan `[0, 240, 255]`, Width: 4.
  4. **`ScatterplotLayer` (`markers`)**:
     * Position: `[w.lng, w.lat, w.alt]`.
     * Spherical markers at elevated altitude: White `[255, 255, 255]`, Radius: 8.

### 8.2. 3D Camera Controls
* Initial viewpoint: Los Angeles (`lng: -118.2437, lat: 34.0522, zoom: 15, pitch: 55, bearing: -20`).
* Pitch / Tilt: Hold **Right-Click** and drag up/down, or hold `Ctrl` + Left-Click drag.
* Rotate / Bearing: Hold **Right-Click** and drag left/right.
* Zoom: Mouse scroll wheel.
* Waypoint creation: Clicking map in Admin role appends `[lng, lat, altitude]` to active store waypoints.

### 8.3. Zustand Stores
* **`useAuthStore`** ([frontend/src/store/useAuthStore.ts](file:///c:/drone-mission-planner/frontend/src/store/useAuthStore.ts)):
  * Tracks `user` (`User | null`), `token` (`string | null`).
  * `login(token, user)` persists token to `localStorage` key `'flyby_token'`.
  * `logout()` purges token and resets state.
* **`useMissionStore`** ([frontend/src/store/useMissionStore.ts](file:///c:/drone-mission-planner/frontend/src/store/useMissionStore.ts)):
  * Tracks `waypoints: Waypoint[]`, `selectedMission: Mission | null`, `altitude: number` (default `100`).
  * `setAltitude(alt)` updates `altitude` and recalculates altitudes for all current draft waypoints.
  * `addWayPoint(point)`, `clearWaypoint()`, `setSelectedMission(mission)`.

---

## 9. Environment Configurations & Port Allocations

* **Docker Ports**:
  * PostgreSQL: Host port `5433` $\to$ Container port `5432`.
  * Backend API: Host port `8000` $\to$ Container port `8000`.
* **Frontend Dev Server**: Host port `5173`.
* **Environment Variables**:
  * `POSTGRES_USER`: Database superuser (default `postgres`).
  * `POSTGRES_PASSWORD`: Database password (default `password123`).
  * `POSTGRES_DB`: Target database name (default `flyby_db`).
  * `POSTGRES_PORT`: Target port (default `5433` for local host connection, `5432` inside docker network).
  * `VITE_MAPBOX_TOKEN`: Mapbox public access token (required in `frontend/.env`).

---

## 10. Development & Operational Commands

### 10.1. Running the Full Stack with Docker
```bash
# 1. Start database and backend containers
docker compose up -d --build

# 2. Seed demo users into the PostgreSQL database
docker exec flyby_robotics_backend python seed.py

# 3. Check backend health
curl http://localhost:8000/
# Returns: {"message":"Flyby Drone Mission Planner API is running!"}
```

### 10.2. Running the Frontend Locally
```bash
cd frontend
npm install
npm run dev
# App launches at http://localhost:5173
```

### 10.3. Running Backend Locally Without Docker (Direct Python)
```bash
cd backend
python -m venv .venv
# On Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

---

## 11. Crucial Architectural Rules for AI Agents Editing This Repo

1. **Do Not Break 3-Tier Layering**:
   * Never query SQLAlchemy models directly from `api/v1/*.py`. Put all query logic in `crud/` and orchestrate validation in `services/`.
2. **Strict SQLAlchemy 2.0 Syntax**:
   * Always declare model attributes using `Mapped[...] = mapped_column(...)`. Do not revert to legacy SQLAlchemy 1.x `Column(...)` declarations.
3. **Preserve IDOR Filtering**:
   * Any new endpoints touching `Mission` or telemetry data **must** verify the relationship between `current_user` and `mission.assigned_to_id` unless `current_user.role == "ADMIN"`.
4. **Maintain Coordinate Order**:
   * In TypeScript / Python types: `{ lat, lng, alt }`.
   * In Deck.gl / Mapbox arrays: `[lng, lat, alt]`.
   * Never pass `[lat, lng]` into Deck.gl geometry accessors.

---

## 12. Strict Collaboration & Mentoring Rules (MUST FOLLOW)

1. **Language Policy**:
   * All discussions, explanations, and mentoring conversations with the user MUST be in **Vietnamese**.
   * Everything inside the project's source code (variable names, function names, comments, commit messages, API strings) MUST be in **English**.
2. **No Coding by the AI (Hands-Off Rule)**:
   * The AI agent MUST NOT write or edit a single line of application source code.
   * All coding will be done directly by the user.
   * The AI acts strictly as a **Senior Mentor (25 years of experience)** guiding, explaining concepts, reviewing code, and pointing the user in the right direction.
3. **Junior-Friendly Code Style (Easy to Understand & Defend)**:
   * Do NOT suggest overly clever, abstract, or complex "senior-level" one-liners or patterns.
   * Always guide the user toward clean, straightforward, step-by-step **Junior-level code** that is easy to read, easy to understand, and easy for the user to explain and answer questions about during interviews or code reviews.

