# Drone Mission Planner

> Tactical 3D Drone Fleet & Mission Planning System inspired by DJI FlightHub 2. 

[![Live Production](https://img.shields.io/badge/Live%20Demo-drone--planner--fly.khoacao.dev-success?style=for-the-badge&logo=google-chrome&logoColor=white)](https://drone-planner-fly.khoacao.dev)
[![AWS Serverless](https://img.shields.io/badge/AWS-Lambda%20%7C%20ECR%20%7C%20S3%20%7C%20CloudFront-orange?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Deck.gl](https://img.shields.io/badge/Deck.gl-9.4-blue.svg)](https://deck.gl)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL%2015-336791.svg?logo=postgresql&logoColor=white)](https://neon.tech)

---

## 🌐 Live Production Deployment

* **Web Application (Custom Domain & SSL):** **[https://drone-planner-fly.khoacao.dev](https://drone-planner-fly.khoacao.dev)**
* **Interactive API Documentation:** **[AWS Lambda Swagger UI](https://kw5exndjprl5kdbr5o4myzcduy0evvky.lambda-url.us-west-1.on.aws/docs)**
* **Complete Deployment Manual:** See [FULLSTACK_AWS_DEPLOYMENT_GUIDE.md](./FULLSTACK_AWS_DEPLOYMENT_GUIDE.md) or download the [Full PDF Manual](./FULLSTACK_AWS_DEPLOYMENT_GUIDE.pdf).

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
* **FinOps & Serverless Cloud Architecture ($0.00/month):**
  * Runs 100% on AWS Always-Free tier and Neon Serverless Postgres with zero idle server cost and instant auto-scaling.

---

## 🛠️ Tech Stack & Cloud Infrastructure

* **Frontend:** React 19, TypeScript 5, Vite, Tailwind CSS v4, Deck.gl v9, Mapbox GL v3, Zustand (State Management), Axios.
* **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (Strict `Mapped` type annotations), Pydantic V2, Mangum (ASGI-to-Lambda adapter).
* **Database:** PostgreSQL 15 with JSONB waypoints (Neon Serverless with built-in PgBouncer connection pooling).
* **Cloud & DevOps (AWS):**
  * **Amazon CloudFront:** Global Edge CDN distribution providing automated HTTPS and single-page application caching.
  * **Amazon S3:** Object storage hosting compiled static assets with automated SPA fallback routing.
  * **AWS Lambda:** Serverless compute running containerized FastAPI packaged from Amazon ECR.
  * **Amazon ECR (Private):** Linux `amd64` container registry eliminating Windows/Linux C-extension compilation mismatches.
  * **AWS Certificate Manager (ACM):** Public SSL/TLS certificate issuing HTTPS on custom Namecheap domain.

---

## ☁️ Cloud Architecture & FinOps Breakdown

```
[ User Browser ]
       │
       ├────────► (1) Static Frontend Assets (HTML / JS / CSS)
       │          ▼
       │      [ Amazon CloudFront (CDN) ] ◄── Global edge caching, HTTPS Termination
       │          │
       │          ▼
       │      [ Amazon S3 Bucket ] ◄── Hosted static build (dist/)
       │
       └────────► (2) REST API Calls (JWT Bearer Token)
                  ▼
              [ AWS Lambda Function URL ] ◄── HTTPS Endpoint
                  │
                  ▼
              [ AWS Lambda Container ]
                  │ ── (Mangum ASGI Adapter)
                  │ ── [ FastAPI App ]
                  │ ── [ SQLAlchemy 2.0 ORM ]
                  │
                  ▼ (SSL Encrypted Connection)
              [ Neon.tech PostgreSQL 15 ] ◄── Serverless Postgres (us-east-1)
```

| Component | AWS / Cloud Service | Free Tier / Pricing Policy | Monthly Operating Cost |
| :--- | :--- | :--- | :--- |
| **Frontend CDN** | Amazon CloudFront | Always Free: 1 TB data transfer out/month + 10M requests | **$0.00** |
| **Static Storage** | Amazon S3 | Always Free: Static assets storage (< 10 MB) | **$0.00** |
| **Backend API** | AWS Lambda (Container) | Always Free: 1,000,000 requests/month + 3.2M CPU seconds | **$0.00** |
| **Container Registry**| Amazon ECR | Always Free: 500 MB private storage/month | **$0.00** |
| **Database** | Neon.tech PostgreSQL | Free Tier: 0.5 GB storage + built-in connection pooler | **$0.00** |
| **SSL / HTTPS** | AWS ACM | Free public SSL/TLS certificates | **$0.00** |

---

## 🚀 Quick Start Guide (Local Development)

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
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

2. **Root Environment (Optional local database defaults):**
   ```bash
   # .env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password123
   POSTGRES_DB=flyby_db
   ```

---

### Step 3: Launch Backend & Database (Docker)

```bash
docker compose up -d --build
```

Verify services:
* Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health Check: [http://localhost:8000/](http://localhost:8000/)

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

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Step-by-Step Live Demo & Verification

1. **Test 3D Tactical Planning (Admin):**
   * Ensure active role on header is **Admin**.
   * Enter Mission Name, set Speed, and Altitude slider.
   * Select **Assign to Pilot**: `Pilot 1 (pilot1@flyby.com)`.
   * Click 3 to 5 waypoints on the satellite map to render 3D drop-lines and flight boundaries.
   * Click **Save Mission**.
2. **Verify 3D Navigation Controls:**
   * **Tilt / Pitch (3D Perspective):** Hold **Right-Click** and drag up/down (or `Ctrl` + Left-Click drag).
   * **Rotate / Bearing:** Hold **Right-Click** and drag left/right.
   * **Zoom:** Mouse scroll wheel.
3. **Verify RBAC & Multi-Tenant Data Isolation:**
   * Switch to **"Pilot 1"**: Observe Read-Only mode; only assigned missions appear in catalog.
   * Switch to **"Pilot 2"**: Observe that Pilot 1's mission is strictly hidden.
   * Switch to **"Admin"**: Observe global mission control and deletion privilege.

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials and returns JWT bearer token + user metadata |
| `GET` | `/api/v1/missions` | Authenticated | Retrieves missions scoped by user role (Admin sees all; Pilot sees assigned) |
| `POST` | `/api/v1/missions` | Admin Only | Creates a new mission with 3D waypoints and flight telemetry |
| `GET` | `/api/v1/missions/{id}` | Authenticated | Retrieves single mission detail with IDOR ownership validation |
| `DELETE` | `/api/v1/missions/{id}` | Admin Only | Permanently deletes a mission |

---

## 🏛️ Architecture Highlights for Reviewers

* **Decoupled 3-Tier Layering:** Strict boundary enforcement where API routes delegate to `services/`, database operations reside in `crud/`, and schemas handle DTO serialization.
* **SQLAlchemy 2.0 Modern Standards:** Fully typed with `Mapped[...]` and `mapped_column()`, eliminating legacy runtime ambiguity.
* **Zero Overhead 3D Rendering:** Pure WebGL rendering using Deck.gl layers directly over Mapbox satellite tiles without loading heavy game engines.
* **Double CORS Prevention & Redirect Fix:** Optimized for AWS Lambda serverless execution with `redirect_slashes=False` and single-tier CORS termination.

---

## 📄 License
Copyright (c) 2026 Khoa Cao. All rights reserved.
