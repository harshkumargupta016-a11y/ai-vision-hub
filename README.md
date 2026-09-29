# VayuNetra — Your Eyes on the Air

AI-powered air quality monitoring platform for the **Indore-Pithampur corridor** in Madhya Pradesh, India. VayuNetra combines real-time AQI data, satellite imagery, community pollution reporting, and Google Gemini AI verification into one neobrutalist-styled web app.

## Features

### 🤖 AI Chat Assistant
Gemini-powered environmental chatbot (`/chat`) with a VayuNetra-tuned system prompt covering AQI, pollutant health impacts, industrial sources, and crop-burning advisories. Also reachable from every page via a **floating chat button**.

### 📸 Photo Report Verification with Confidence Scoring
Users submit pollution reports (`/report`) with optional drag-and-drop photo upload (client-side compressed to 1024px JPEG). **Gemini Vision** analyzes both the text and the photo — smoke density, dust clouds, burning vegetation — and returns:

- Classified pollution type (Crop Burning, Industrial Smoke, Vehicle Emissions, Construction Dust, Waste Burning, Other)
- **Confidence score** with animated bar (green ≥75%, yellow ≥50%, orange below)
- Severity rating (low / moderate / high / critical)
- AI notes referencing what is actually visible in the photo

### ⏱️ Three-Tier Verification Pipeline
1. **Gemini AI verification** — instant, on submission
2. **Admin review** (`/admin`) — human-in-the-loop approve/reject with notes and AI override
3. **Auto-verify** — reports unreviewed for 2 hours verify automatically

Status badges: Pending → AI Verified → Admin Verified / Auto Verified / Rejected.

### 🗺️ Hotspot Map with Satellite View
Leaflet map (`/hotspots`) with an Esri satellite/street toggle, color-coded pollution markers, severity legend, and a 72-hour forecast panel.

### 📊 Real-Time Dashboard
Live AQI display (`/dashboard`) with pollutant breakdown (PM2.5, PM10, SO₂, NO₂, CO, O₃), recent reports, and active alert banners.

### ❓ Help & FAQ
Public knowledge base at `/help` — 11 Q/As across 4 categories with live search, category filters, quick-topic cards, and contact info. Linked from the homepage navbar and footer; no sign-in required.

### 🔐 Auth & Roles
Email OTP + guest sign-in (Convex Auth). Protected routes via `RequireAuth`; admin panel for reviewers. Resend-powered email notifications fire on every status change (submitted, AI verified, admin verified, auto-verified, rejected).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Convex (queries, mutations, actions, scheduler) |
| AI | Google Gemini API (`gemini-3.8-flash` primary, with automatic multi-model fallback) |
| Maps | Leaflet + react-leaflet, Esri World Imagery satellite tiles |
| Email | Resend (server-side via Convex actions) |
| Auth | Convex Auth (email OTP + anonymous) |

### AI Resilience

All Gemini calls go through a shared client (`src/convex/gemini.ts`) with:

- **7-model fallback chain**: `3.8-flash → 3.7 → 3.6 → 3.5 → 3.5-flash-lite → 3.1-flash-lite → flash-latest`
- **Retry with backoff** on 503 (high demand) and 429 (quota) errors
- **Silent skip** of retired models (404)
- **Fail-fast** with clear messages on auth/key errors

## Project Structure

```
src/
├── components/
│   ├── ChatAssistant.tsx      # Reusable Gemini chat UI
│   ├── ComplaintForm.tsx      # Drag-and-drop report form + AI result display
│   ├── FloatingChatButton.tsx # Global chat FAB (every page)
│   ├── ReportCard.tsx         # Complaint card with status + confidence
│   ├── AlertBanner.tsx        # Severity-coded alert strip
│   └── ui/                    # shadcn/ui primitives
├── convex/
│   ├── gemini.ts              # Shared Gemini client (fallback + retries)
│   ├── chat.ts                # Chat action
│   ├── aiVerify.ts            # Photo + text verification action
│   ├── complaints.ts          # Complaint CRUD + verification pipeline
│   ├── emails.ts              # Resend email actions
│   ├── notifications.ts       # User lookup for notifications
│   └── schema.ts              # complaints / alerts / comments tables
├── pages/
│   ├── Landing.tsx            # Public homepage
│   ├── Dashboard.tsx          # Real-time AQI + alerts
│   ├── ChatPage.tsx           # Full-page AI chat
│   ├── HotspotMap.tsx         # Satellite hotspot map
│   ├── ReportPage.tsx         # Submit + track reports
│   ├── AdminPanel.tsx         # Review queue
│   ├── HelpPage.tsx           # Public Help & FAQ
│   ├── Auth.tsx               # Sign in / sign up
│   └── NotFound.tsx
└── main.tsx                   # Routes (lazy-loaded) + providers
```

## Setup

### Required API Keys

Add these in the project's **Keys / API keys** tab:

| Key | Used for | Get it from |
|---|---|---|
| `GOOGLE_API_KEY` | AI chat, photo verification, confidence scoring | [Google AI Studio](https://aistudio.google.com/apikey) |
| `RESEND_API_KEY` | Complaint status email notifications | [Resend Dashboard](https://resend.com/api-keys) |

The Gemini key must be available to the Convex environment (server-side actions read `process.env.GOOGLE_API_KEY`).

### Verify the AI integration

```bash
bunx convex run chat:chat '{"messages":[{"role":"user","content":"Say hello"}]}'
```

A successful call returns a greeting from VayuNetra AI.

## Design System

**Neobrutalism Minimalism** — white textured background (`#F8F7F4` with grain overlay), square corners throughout, 2px black borders, hard offset shadows (`4px 4px 0 #1A1A1A`), flat vibrant color blocks (yellow `#FFD600`, green `#00E676`, blue `#2979FF`, orange `#FF9100`, red `#FF1744`), bold uppercase typography, press-state button animations, and rainbow color-band accents.

## Development

```bash
bun install          # install dependencies
bunx convex dev --once  # regenerate Convex types + deploy functions
bun tsc -b --noEmit  # typecheck
bun run build        # production build
```

> Note: the Freebuff platform runs the dev server and Convex process in managed background sessions — file edits sync and deploy automatically.

---

© 2026 VayuNetra. Environmental monitoring powered by Google AI.
