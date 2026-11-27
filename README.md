# FleetOps 🚛

**FleetOps** is a full-stack fleet management web application built with the MERN stack (MongoDB, Express, React, Node.js). It provides real-time monitoring, driver management, shift tracking, incident reporting, and data export — all through a clean, role-based interface.

---

## 🌐 Live Demo

> Frontend: `http://localhost:5173`  
> Backend API: `http://localhost:5000`  
> Deployment: Configured for [Vercel](https://vercel.com) via `vercel.json`

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔐 **Authentication** | JWT-style login with role-based routing (Driver / Manager / Admin) |
| 2 | 🏠 **Landing Page** | Public home page with hero, features, workflow, and contact sections |
| 3 | 📊 **Manager Dashboard** | Live fleet telemetry, vehicle table with filters, event feed, and telematics drawer |
| 4 | 🚛 **Driver Portal** | Vehicle selection, shift start/end, live telemetry, incident reporting |
| 5 | 🗄️ **Backend REST API** | Express + MongoDB with full CRUD for vehicles, shifts, logs, and incidents |
| 6 | 📋 **Export Hub** | CSV export with date-range filters, role-guarded by Express middleware |
| 7 | 🎨 **Responsive UI** | Tailwind CSS v4, Lucide icons, animated components, toast notifications |

---

## 📁 Repository Structure

```text
FleetOps/
├── api/
│   └── index.js                    # Vercel serverless entry point
├── backend/                        # Node.js + Express REST API
│   ├── models/
│   │   ├── User.js                 # User schema (email, password, role)
│   │   ├── Vehicle.js              # Vehicle schema (id, driver, status, telemetry, alerts)
│   │   ├── Shift.js                # Shift schema (driverName, vehicleId, startTime, endTime)
│   │   ├── Incident.js             # Incident schema (vehicleId, type, severity, description)
│   │   ├── Log.js                  # Event log schema (vehicleId, event, type, timestamp)
│   │   └── Report.js               # Report schema for CSV export
│   ├── server.js                   # Main Express server (all routes + DB seeding)
│   ├── test_reports.js             # Report endpoint test script
│   └── package.json
├── frontend/                       # React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Role-aware navigation bar with login/logout
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── OperationalHighlights.jsx
│   │   │   ├── WhyFleetOps.jsx
│   │   │   └── Workflow.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Public landing page
│   │   │   ├── Login.jsx           # Auth page with role-based redirect + demo access
│   │   │   ├── ManagerDashboard.jsx # Fleet control panel (825 lines)
│   │   │   ├── DriverDashboard.jsx # Driver portal (1098 lines)
│   │   │   ├── ExportHub.jsx       # CSV report generator
│   │   │   └── mockData.js         # Fallback seed data for offline/sandbox mode
│   │   ├── api.js                  # Centralized Axios-style fetch API layer
│   │   ├── App.jsx                 # Root component with hash-based routing
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── vercel.json                     # Vercel deployment configuration
```

---

## 🏗️ Architecture

```
Browser (React + Vite)
    │
    ├── Hash-based routing (#/login, #/dashboard, #/driver, #/export-hub)
    ├── Polls backend every 3 seconds for live vehicle + log data
    │
    └── api.js ─── fetch() ──► Express REST API (port 5000)
                                    │
                                    └── Mongoose ──► MongoDB Atlas
```

### Routing Logic

The app uses **hash-based client-side routing** with no external router library. `App.jsx` listens to `window.hashchange` events and maps URLs to views:

| URL Hash | View | Role Required |
|----------|------|--------------|
| `#/` | Home | Public |
| `#/login` | Login | Public |
| `#/dashboard` or `#/manager-dashboard` | Manager Dashboard | `manager` or `admin` |
| `#/driver` or `#/driver-dashboard` | Driver Dashboard | `driver` |
| `#/export-hub` | Export Hub | `manager` or `admin` |

---

## 👥 User Roles & Demo Credentials

| Role | Email | Password | Redirected To |
|------|-------|----------|--------------|
| `admin` | `admin@fleetops.com` | `admin123` | Manager Dashboard |
| `manager` | `manager@fleetops.com` | `manager123` | Manager Dashboard |
| `driver` | `driver@fleetops.com` | `driver123` | Driver Dashboard |

> 💡 Use the **Quick Demo Access** buttons on the Login page for instant one-click access.

---

## 📄 Pages & Components

### 🏠 Home Page
Assembled from 6 reusable sections: `Hero`, `WhyFleetOps`, `OperationalHighlights`, `Workflow`, `Contact`, and `Footer`. Fully public, no authentication required.

---

### 🔐 Login Page (`Login.jsx`)
- Email + password form with show/hide password toggle
- Calls `POST /api/auth/login` via the `api.js` layer
- JWT token stored in `localStorage` on success
- Auto-redirects by role: managers → dashboard, drivers → driver portal
- Three **Quick Demo Access** buttons (Admin / Manager / Driver) for instant login

---

### 📊 Manager Dashboard (`ManagerDashboard.jsx`)

The Fleet Operations Control Panel — the core of the application.

#### KPI Cards
Four summary cards computed from live vehicle data using `useMemo`:
- **Total Fleet** — total vehicles tracked
- **Active (En Route)** — count with active utilization percentage
- **Idle (Available)** — count of depot-ready vehicles
- **Under Maintenance** — count with active alert badge showing issue count

#### Vehicle Table
- **Search bar** — searches across vehicle ID, driver name, vehicle type, location, and destination simultaneously
- **Filter tabs** — All / En Route / Idle / Maintenance (active tab highlighted in blue)
- **Per-row display**: Vehicle ID (with `!` alert badge) · Driver + Type · Status badge with animated dot · Fuel % + progress bar · Speed / Location · Chevron arrow
- Click any row to open the Telematics Drawer
- Footer shows count of visible vs total assets + Autopoll status

#### Live Telemetry Simulator
Toggle button that runs a `setInterval` every **4.5 seconds** simulating real fleet events:

| Probability | Event Type |
|-------------|-----------|
| 70% | Minor update — speed adjusts ±4 mph; idle vehicle has 20% chance to auto-dispatch |
| 30% | Major event — status flip, low fuel alert trigger, or alert resolution |

All simulated changes are synced to the backend via `api.updateVehicleStatus()` and logged via `api.addLog()`. Local state updates optimistically without waiting for the server.

#### Live Event Feed (Sidebar)
- Fixed-height scrollable panel (520px) showing the last 20 logged events
- Color-coded dots: 🔴 warning · 🟢 success · 🔵 info
- Vehicle IDs in the feed are clickable — opens that vehicle's drawer
- **Clear Feed** button resets the log terminal

#### Telematics Drawer
Slide-in panel from the right (`animate-in slide-in-from-right`) with a blurred backdrop overlay. Opens when any table row is clicked. Contains:

| Section | Details |
|---------|---------|
| **Driver Info** | Assigned driver name + vehicle class type |
| **Active Warning Codes** | Red alert panel listing all current alerts (only shown if alerts exist) |
| **Manager Quick Override** | 3 buttons to instantly change vehicle status (En Route / Idle / Maintenance) — sets speed and alerts automatically |
| **Engine Diagnostics** | Fuel %, Speed, Coolant Temp (turns red if >210°F), Tire Pressure, Cargo Load |
| **Telemetry Routing Map** | Dark SVG mock-map with dashed route lines, animated pulsing truck icon, HUD bar showing Location → Destination |
| **Footer** | Export Diagnostics button |

#### Toast Notifications
Stack top-right, auto-dismiss after 4 seconds. Three styles: warning (red), success (emerald), info (blue).

---

### 🚛 Driver Dashboard (`DriverDashboard.jsx`)

The driver's personal operations portal.

- **Vehicle Selection** — dropdown listing only `Idle` vehicles available for assignment
- **Shift Management** — Start Shift sets vehicle to `En Route`; End Shift sets it back to `Idle`
- **Live Shift Timer** — counts up HH:MM:SS while shift is active
- **Live Telemetry Panel** — shows current vehicle's real-time speed, fuel level, and engine temperature
- **Incident Reporting** — form to submit incidents with type, severity, location, and description; creates a vehicle alert + log entry on the backend
- **Shift History** — table of all past shifts with start/end times and duration
- **Toast Notifications** — success/error feedback for all actions

---

### 📋 Export Hub (`ExportHub.jsx`)

Role-guarded report generation panel (managers and admins only).

- Select date range: **Current Week** / **Today** / **Last 30 Days**
- Triggers `GET /api/reports/export-csv` with role header
- Downloads response as a `.csv` file directly in the browser
- Shows a **403 Security Guardrail** block with detailed middleware info if accessed by an unauthorized role
- Footer references ISO 27001 & FMCSA compliance standards

---

## ⚙️ Backend — `server.js`

Single-file Express server with MongoDB (Mongoose). On startup with a valid `MONGODB_URI`, it automatically **seeds** the database with default users, 8 vehicles, event logs, and report data if the collections are empty.

### REST API Endpoints

#### Health
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | API health check |
| `GET` | `/api/health` | Returns DB connection state + uptime |

#### Authentication
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | `{ email, password }` | Returns user object on success |

#### Vehicles
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/vehicles` | Returns all vehicles |
| `PUT` | `/api/vehicles/:id/status` | Update status, speed, fuel, telemetry, alerts |
| `POST` | `/api/vehicles/:id/select` | Assign a driver to the vehicle |
| `POST` | `/api/vehicles/:id/deselect` | Remove the assigned driver |

#### Shifts
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| `GET` | `/api/shifts` | — | Returns all shifts |
| `POST` | `/api/shifts/start` | `{ driverName, vehicleId }` | Starts a shift, sets vehicle to En Route |
| `POST` | `/api/shifts/end` | `{ shiftId }` | Ends active shift, sets vehicle to Idle |

#### Incidents
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| `GET` | `/api/incidents` | — | Returns all incidents |
| `POST` | `/api/incidents` | `{ vehicleId, driverName, type, severity, location, description }` | Creates incident + adds alert to vehicle + logs event |

#### Logs
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| `GET` | `/api/logs` | — | Returns last 20 logs (newest first) |
| `POST` | `/api/logs` | `{ vehicleId, event, type }` | Adds a new log entry |

#### Reports (Manager/Admin only)
| Method | Route | Query | Description |
|--------|-------|-------|-------------|
| `GET` | `/api/reports/export-csv` | `range`, `role` | Returns CSV file download; role verified via `verifyRole` middleware |

### Role Middleware
```js
verifyRole(['admin', 'manager'])
```
Reads the `x-user-role` header or `role` query param. Returns `401` if missing, `403` if unauthorized.

---

## 🗄️ Database Models

### User
```
email     String  (unique, lowercase)
password  String
role      String  (enum: admin | manager | driver)
```

### Vehicle
```
id          String  (unique, e.g. "FO-101")
driver      String  (default: "N/A")
type        String  (e.g. "Semi-Truck (Class 8)")
status      String  (enum: En Route | Idle | Maintenance)
fuel        Number  (0–100)
speed       Number  (mph)
location    String
destination String
telemetry   { temp: Number, load: String, pressure: String }
alerts      [{ id, severity: high|medium|low, type, message }]
```

### Shift
```
driverName  String
vehicleId   String
startTime   Date
endTime     Date   (null if active)
status      String (enum: Active | Completed)
```

### Incident
```
vehicleId   String
driverName  String
type        String
severity    String
location    String
description String
timestamp   Date
```

### Log
```
timestamp   String
vehicleId   String
event       String
type        String  (info | warning | success)
```

### Report
```
date    Date
vehId   String
driver  String
status  String
shift   String  (UTC time)
hours   String
note    String
```

---

## 🔌 Frontend API Layer (`api.js`)

Centralized fetch wrapper that auto-attaches `Authorization: Bearer <token>` headers from `localStorage`.

| Method | Description |
|--------|-------------|
| `api.login(email, password)` | POST to auth, stores token |
| `api.logout()` | Removes token from localStorage |
| `api.getVehicles()` | GET all vehicles |
| `api.updateVehicleStatus(id, data)` | PUT vehicle status/telemetry |
| `api.selectVehicle(id, driverName)` | POST assign driver |
| `api.deselectVehicle(id)` | POST remove driver |
| `api.getShifts()` | GET all shifts |
| `api.startShift(driverName, vehicleId)` | POST start shift |
| `api.endShift(shiftId)` | POST end shift |
| `api.getLogs()` | GET last 20 logs |
| `api.addLog(vehicleId, event, type)` | POST new log entry |
| `api.reportIncident(incidentData)` | POST new incident |

> **Base URL:** `http://localhost:5001/api` in development · `/api` in production (Vercel)

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | v4 | Styling |
| Lucide React | latest | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | — | Runtime |
| Express | ^4.21.0 | REST API server |
| Mongoose | ^9.7.4 | MongoDB ODM |
| dotenv | ^16.4.5 | Environment config |
| nodemon | ^3.1.4 | Dev auto-reload |
| cors | ^2.8.5 | Cross-origin requests |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Atlas account (or local MongoDB) — *optional for sandbox mode*

### 1. Clone the Repository
```bash
git clone https://github.com/Rish2024/FleetOps.git
cd FleetOps
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string_here
PORT=5000
```

> ⚠️ If `MONGODB_URI` is not set, the server runs in **sandbox/in-memory mode** using mock data. All features work except data persistence across restarts.

Start the backend:
```bash
npm run dev       # development (nodemon auto-reload)
npm start         # production
```

Backend will be available at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Optionally create a `frontend/.env` file:
```env
VITE_DEMO_EMAIL=manager@fleetops.com
VITE_DEMO_PASSWORD=manager123
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🌍 Deployment (Vercel)

The project includes a `vercel.json` for full-stack Vercel deployment:

```json
{
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" },
    { "src": "frontend/package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.js" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ]
}
```

- `api/index.js` — exports the Express app as a serverless function
- Frontend is built statically via `npm run build`
- All `/api/*` routes proxy to the serverless backend

---

## 🔑 Sandbox Mode

If no MongoDB is connected, the app runs fully in **sandbox mode**:
- Vehicle and log data is loaded from `frontend/src/pages/mockData.js`
- `App.jsx` polls the backend every 3 seconds; if it fails, it falls back silently to local state
- All UI interactions (simulator, drawer, status override) still work using React state

---

## 📦 Module Breakdown

| Module | Contributor Focus | Key Files |
|--------|------------------|-----------|
| Authentication & Home | Login flow, landing page | `Login.jsx`, `Home.jsx`, `Navbar.jsx` |
| Driver Portal | Shift management, incidents | `DriverDashboard.jsx` |
| **Manager Dashboard** | Fleet control, telemetry simulator | **`ManagerDashboard.jsx`** |
| Database & Backend | Models, REST API, DB seeding | `server.js`, `models/` |
| Admin & Reports | CSV export, role guards | `ExportHub.jsx`, `/api/reports/export-csv` |
| Frontend Integration | API layer, routing, shared components | `api.js`, `App.jsx`, `components/` |

---

## 📸 Pages Overview

### Manager Dashboard
- Real-time KPI cards (Total Fleet, En Route, Idle, Maintenance)
- Searchable + filterable vehicle table
- Live Telemetry Simulator (togglable, runs every 4.5s)
- Live Event Feed sidebar (last 20 events, color-coded by severity)
- Telematics Drawer with engine diagnostics, alert codes, mock routing map, and Quick Override

### Driver Dashboard
- Vehicle picker (Idle vehicles only)
- Shift timer (HH:MM:SS live counter)
- Incident report form (type, severity, location, description)
- Shift history table

### Export Hub
- Date range selector (Today / Current Week / Last 30 Days)
- CSV file download
- 403 Security Guardrail displayed for unauthorized roles

---

## 🤝 Team

This project is developed collaboratively with modules assigned to different team members as part of a structured development cycle.

---

## 📄 License

This project is intended for educational purposes.
