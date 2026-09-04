---
title: ReworkFlow Terminal Platform
date: 2026-09-04
type: product-spec
status: deployed
production_url: https://rework.yorkstead.com
repo: https://github.com/yorkstead/rework-flow.git
tags:
  - product
  - cross-dock
  - nextjs
  - reworkflow
---

# ⚡ ReworkFlow™ Terminal Platform

> **Live Production System:** [rework.yorkstead.com](https://rework.yorkstead.com)  
> **Source Code:** [github.com/yorkstead/rework-flow](https://github.com/yorkstead/rework-flow)  
> **Deployment Infrastructure:** Vercel Edge Network, custom domain SSL, React 19 / Next.js 15 App Router.

---

## 🏗️ 4-Stage Operational Architecture

```
[Highway Driver] ──> /maps (Google Maps Simulation)
                         │
                         ▼
                     /reserve (Instant Quote & 45m Bay Hold)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   /office (Dispatch Board)          /dock (Forklift Terminal)
   - Real-time Audio Alert           - Glove-friendly Touch UI
   - Live Bay Status (Bays 1-6)      - Timestamped / GPS Camera
   - QuickBooks Invoicing            - Touchscreen Signature Pad
```

### 1. Stage 0: Acquisition (`/maps`)
* **Purpose:** Simulates an emergency Google Maps search for *"pallet rework near me"* on Interstate 70.
* **Feature:** Denver Express listing includes an eye-catching gold **⚡ Reserve Dock Bay & Instant Quote** button, contrasting with competitors who only offer generic telephone numbers.

### 2. Stage 1: Highway Lock (`/reserve`)
* **Purpose:** Driver self-service calculator while pulled over on I-70 or at a truck stop.
* **Functionality:** 
  * Selects damage type (Shifted Pallets, Banding Failure, Port of Entry Overweight Axle).
  * Calculates real-time estimates ($450–$550).
  * Enters Carrier MC/DOT, trailer number, and cell phone.
  * Locks designated bay with an animated **45-minute countdown clock** (matching the legal ELD hours limit).

### 3. Stage 2: Front Desk Alert (`/office`)
* **Purpose:** Continuous operational cockpit for front desk and dispatchers (Steve, Dale, Craig).
* **Audio Alerts:** Uses native browser **Web Audio synthesis** (880Hz / 440Hz harmonic chime) to sound through desktop speakers when a truck reserves. Zero paid audio hardware required.
* **Dispatch Actions:** 1-click status advancement (Reserved ➔ Docked ➔ In Progress ➔ Completed), QuickBooks CSV export.

### 4. Stage 3: Glove-Friendly Forklift Terminal (`/dock`)
* **Purpose:** Mounts on Toyota/Crown forklifts via [[Industrial Hardware Specification|HOTWAV R9 Pro + RAM Mounts]].
* **Touch Optimization:** 48px+ high-contrast buttons designed for thick leather work gloves in cold weather.
* **Evidence Capture:** Dual-camera damage photo capture with automated Denver Express branding, GPS coordinates, and Mountain Time stamp.
* **Driver Sign-Off:** Digital signature canvas directly on the tablet glass.

---

## 💻 Tech Stack & Zero-Lock-In Guarantee

* **Framework:** Next.js 15 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS (industrial high-contrast slate & amber color scheme)
* **Audio:** Web Audio API (cross-platform, zero dependencies)
* **Icons:** Lucide React
* **Client Handover:** Standard open-source stack that can be hosted on Vercel, Netlify, Cloudflare, AWS, or handed directly to [[Partner Dossier - SpinFlow.ai|SpinFlow]].

---

## 🔗 Related Notes
* [[Denver Express & No Limit Trucking]]
* [[Industrial Hardware Specification]]
* [[The $9,500 Asset Purchase Strategy]]
* [[Partner Dossier - SpinFlow.ai]]
