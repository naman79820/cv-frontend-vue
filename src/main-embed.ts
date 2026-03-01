import { createApp } from "vue";
import EmbedOnlyApp from "./EmbedOnlyApp.vue";
import vuetify from "./plugins/vuetify";
import i18n from "./locales/i18n";
import "bootstrap";
import "./globalVariables";
import "./styles/css/main.stylesheet.css";
import "./styles/color_theme.scss";
import "./styles/simulator.scss";
import "@fortawesome/fontawesome-free/css/all.css";

// Force embed mode BEFORE anything else loads
// This is read by embed.vue, circuit.ts, layoutMode.ts, wire.ts
window.embed = true;
window.isUserLoggedIn = false;
window.logixProjectId = new URLSearchParams(window.location.search).get("project_id") || "0";

const app = createApp(EmbedOnlyApp);
app.use(vuetify);
app.use(i18n);
// NOTE: No Pinia — embed mode never needs auth state
// NOTE: No router — embed is always a single page loaded via iframe
app.mount("#app");