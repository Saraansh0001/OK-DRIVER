# OKDriver DVR-Style History Playback

A production-focused smart dashcam playback experience built with React + Zustand on the frontend and Express + JWT auth on the backend.


## What this delivers

- **Canvas-based, clickable 24h timeline** with live playhead
- **Seamless clip transitions** using **double-buffered video elements** (A/B swap)
- **Dual camera playback** (Front + Rear) with synchronized timeline seeking
- **Side-by-side / PiP mode toggle** for operator workflows
- **JWT-authenticated clip API** with deterministic mock DVR clip data


## Architecture

### Frontend (`/client`)

- `components/TimelineCanvas.jsx`  
  Draws the 24-hour timeline on a `<canvas>`, renders available segments, and supports click-to-seek.
- `components/DualPlayer.jsx`  
  Renders dual-camera players and supports side-by-side + PiP modes.
- `components/PlayheadScrubber.jsx`  
  Displays live playhead marker and timestamp label.
- `store/usePlaybackStore.js`  
  Central playback state in Zustand:
  - `current timeline second`
  - active/next clip indices
  - buffer state (`activeSlot`, `loading`, `switching`)
  - playback controls + camera layout mode
- `hooks/useVideoBuffer.js`  
  Handles hls.js attachment, active/inactive video slot orchestration, preloading next clip, and zero-black-screen swap.
- `hooks/useTimelineSync.js`  
  Global timeline controls (space to play/pause, arrow keys to seek).
- `lib/api.js`  
  Login + clip fetch API client.


### Backend (`/server`)

- `routes/auth.js`  
  `POST /auth/login` issues JWT for demo account.
- `middleware/verifyJWT.js`  
  Protects clip endpoints.
- `routes/clips.js`  
  `GET /clips?date=` returns mock clip metadata and sample stream URLs.
- `data/mockClips.js`  
  Generates day-level clip timeline data with front/rear URLs.

## Seamless Transition Design (Double Buffer)

The core no-black-frame strategy:

1. Two `<video>` elements are always mounted per camera (`slot A` and `slot B`).
2. Active slot plays the current clip while inactive slot preloads the next clip silently.
3. On clip end:
   - Zustand flips `activeSlot` (`A -> B` or `B -> A`)
   - UI crossfades opacity instantly
   - old slot is immediately reused to preload the next upcoming clip
4. Timeline and clip indices stay centralized in Zustand so both cameras remain synchronized.

This approach avoids remount pauses and network jitter causing visible black screens between clips.

## Setup

### 1) Install dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2) Configure environment

```bash
copy server/.env.example server/.env
```

Set a strong `JWT_SECRET` in `server/.env`.

### 3) Run development mode

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Reviewer Notes

- UI is intentionally dark and telemetry-focused for fleet operations.
- Playback logic is modularized into hooks and centralized store (minimal logic in JSX).
- No prop drilling: global playback + buffering state is managed in Zustand.
- HLS playback is handled with `hls.js` where needed, with Safari-native fallback.

## Demo Credentials

- Platform: `dashcam.okdriver.in`
- Email: `demo@okdriver.in`
- Password: `12345678`
