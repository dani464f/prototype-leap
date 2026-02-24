# Employee Device Performance Tiering (ServiceNow-style Prototype)

Demo MVP showing how employee devices can be assigned usage tiers (1-4) from telemetry.

## Stack
- Backend: Node + Express (`/server`)
- Frontend: React + Vite (`/web`)
- Storage: in-memory JSON store (seeded mock data)
- Visualization: table + Recharts line chart

## Repo Structure
- `server/src/data/store.js` in-memory data store
- `server/src/services/tiering.js` tiering logic + thresholds
- `server/src/services/mockGenerator.js` seeded demo data generator
- `server/src/integrations/serviceNowStub.js` mock mapping and REST send placeholder
- `web/src/pages/DashboardPage.jsx` dashboard with KPIs/filter/table
- `web/src/pages/EmployeeDetailPage.jsx` detail panel + telemetry chart + explanation

## Install and Run
```bash
npm install
npm run dev
```

- API: `http://localhost:4000`
- Web UI: `http://localhost:5173`

## One-command local run after install
```bash
npm run dev
```

## API Endpoints
- `GET /api/employees`
- `GET /api/employees/:id`
- `GET /api/devices`
- `GET /api/devices/:id/telemetry?window=30m`
- `GET /api/tiers`
- `POST /api/telemetry/ingest`
- `POST /api/mock/generate`

## Tiering logic (where to tweak)
File: `server/src/services/tiering.js`

Intensity score:
```txt
0.30 * CPU + 0.25 * RAM + 0.35 * GPU + 0.10 * Disk
```

Thresholds:
- Tier 1: score `<20` and GPU `<10`
- Tier 2: score `20-45`
- Tier 3: score `45-70` OR (GPU `>=40` and RAM `>=50`)
- Tier 4: score `>=70` OR GPU `>=70` OR (RAM `>=85` and CPU `>=75`)

## ServiceNow integration stub (mock)
File: `server/src/integrations/serviceNowStub.js`

Includes payload mapping for:
- `x_company_device`
- `x_company_telemetry`
- `x_company_tier_result`

`sendToServiceNow(payload)` currently only logs what would be posted to ServiceNow REST.

## Demo Script
1. Start app with `npm run dev`.
2. Observe realistic sample personas already seeded across all four tiers (office coordinators, analysts, engineers, and ML/3D power users).
3. Open dashboard at `http://localhost:5173`.
4. Review KPI cards: employee/device counts, tier distribution, top tier-4 users.
5. Use filters (department, tier, search) to narrow the table.
6. Review placeholder cards for future incident correlation, upgrade recommendations, and budget forecasting.
7. Click an employee name to open detail view.
8. Inspect device info + 30-minute telemetry chart (CPU/RAM/GPU).
9. Review “Tier Explanation” reason and threshold breakdown + ServiceNow action placeholder panel.
10. Click **Regenerate Mock Data** to simulate a new telemetry snapshot and tier assignments.
