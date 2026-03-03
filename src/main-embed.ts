/**
 * main-embed.ts — Minimal embed bundle entry point
 *
 * Deliberately excludes:
 * - Pinia (no auth state needed)
 * - Vue Router (embed is always single page)
 * - Full simulator styles (only embed-specific styles)
 * - FontAwesome (not needed in embed)
 * - Bootstrap JS (not needed in embed)
 * - Vuetify (embed uses plain HTML, no Vuetify components)
 *
 * Only includes:
 * - Vue core
 * - The simulator canvas engine
 * - Embed-specific UI (zoom, fullscreen, clock)
 * - Minimal i18n
 */
import { createApp } from "vue";
import EmbedOnlyApp from "./EmbedOnlyApp.vue";

// Force embed mode BEFORE simulator engine loads
// These globals are read by circuit.ts, layoutMode.ts, wire.ts, setup.js
window.embed = true;
window.isUserLoggedIn = false;
window.logixProjectId =
  new URLSearchParams(window.location.search).get("project_id") ||
  (window as any).logixProjectId ||
  "0";

// Minimal styles only — no full simulator.scss, no bootstrap
import "./styles/css/main.stylesheet.css";
import "./styles/color_theme.scss";

// Global simulator variables (required by engine)
import "./globalVariables";

const app = createApp(EmbedOnlyApp);

// No Pinia — embed never needs auth
// No router — embed is always loaded directly
// No Vuetify — embed uses plain HTML controls
// No i18n — embed UI has no translatable text

app.mount("#app");