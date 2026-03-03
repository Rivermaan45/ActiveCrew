# ActiveCrew v1 — Run Instructions

## Prerequisites
- Node.js 18+ installed
- npm 9+

## Quick Start

```bash
# From project root
bash delivery/start_servers.sh
```

Or manually:

```bash
npm install
npm run dev
```

## Ports

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:3001        |
| API      | http://localhost:3001/api/sessions |

## Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List all sessions (query: `?sport=Tennis&day=Monday&userId=demo-user`) |
| `/api/sessions/:id` | GET | Session detail with participant profiles |
| `/api/sessions/:id/join` | POST | Join a session (`{ userId }`) |
| `/api/sessions/:id/leave` | POST | Leave a session (`{ userId }`) |
| `/api/sessions/seed` | POST | Cold-start: re-seed all sessions with auto-joined personas |
| `/api/activity-slots` | GET | Legacy swipe-mode activity slots |
| `/api/sport-levels` | GET | All 18 sport level definitions |
| `/api/users/:id` | GET/PUT | User profile read/update |
| `/api/admin/stats` | GET | System stats (users, slots, swipes, matches) |
| `/api/auth/demo` | POST | Demo login (creates onboarding flow) |
| `/api/reset-demo` | POST | Reset demo data to fresh state |

## Running Tests

```bash
# Ensure servers are running first
bash delivery/tests/api_test.sh
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Animations | Framer Motion |
| Icons | Lucide React + Emoji |
| Backend | Express 4 |
| Database | In-memory (SQLite-ready schema in DB_SCHEMA.sql) |
| Avatars | Procedural SVG (data URIs, <1KB each) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |

## Demo Flow

1. Visit http://localhost:5173
2. Tap "Get Started" → demo login
3. Complete 6-step onboarding (name, photos, prompts, sports, levels, verification)
4. Browse sessions (default), swipe activities, or view group events
5. Join sessions → see them in My Week calendar
6. Edit profile, view sport levels
