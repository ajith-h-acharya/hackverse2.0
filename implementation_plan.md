# Implementation Plan: Offline Capabilities & PWA Support

This plan outlines the enhancements to make **Mangalore.Nav** work reliably in low-internet or fully offline environments.

---

## 1. User Review Required

> [!NOTE]
> We will register a Service Worker (`sw.js`) that dynamically caches OpenStreetMap tiles as the user browses the map. When offline, only previously panned/cached regions will display details.
>
> We will also implement a lightweight synchronization queue: if the user makes edits to their stops/circuits offline, they are saved locally and auto-pushed to the server once the network is restored.

---

## 2. Proposed Changes

### [NEW] [sw.js](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/public/sw.js)
Create a Service Worker in the public folder to intercept network fetches and implement:
- **Pre-caching**: Cache all essential UI assets (HTML, bundle JS/CSS, local icons, and base fonts) at installation.
- **Dynamic Caching**: Caching for local images (`/images/*`).
- **Map Tile Caching**: Implement a cache-first strategy for `tile.openstreetmap.org` requests to store map tiles locally.
- **Offline Fallback**: Serve the cached index page for navigation requests when offline.

### [NEW] [manifest.json](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/public/manifest.json)
Create a web app manifest defining the PWA settings:
- Standalone display mode.
- Color theme matching the navy/orange brand.
- App icons and shortcut configurations.

### [MODIFY] [index.html](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/index.html)
- Add tags to link the web manifest.
- Define theme color meta tags for mobile address bars.

### [MODIFY] [main.jsx](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/src/main.jsx)
- Register the service worker on load.
- Add an event listener to listen for connection changes (online/offline) and auto-sync offline changes.

### [MODIFY] [App.jsx](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/src/App.jsx)
- Integrate a global network connection indicator.
- Display a sleek glassmorphic banner notifying the traveler when the system switches to **Offline Mode (Sector Localized)**.

---

## 3. Verification Plan

### Automated Tests
- Validate that `npm run build` compiles with zero warnings or assets resolution errors.

### Manual & Interactive Verification
- Use Chrome DevTools **Application** tab to confirm that the Service Worker is registered, active, and caching assets.
- Toggle DevTools Network to **Offline** mode and confirm that the webpage reloads, displays the map with cached tiles, and enables searching locations offline.
- Edit itinerary stops offline, switch connection back to **Online**, and verify that background synchronization triggers and updates the backend database (`db.json`) correctly.
