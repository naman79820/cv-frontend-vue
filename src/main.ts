// ── Embed detection — MUST be before any import ───────────────────────────
// App.vue reads window.embed synchronously on first render.
// If we're on /embed/:id route, set it now so App.vue shows <Embed> not <router-view>
const _embedMatch = window.location.pathname.match(/\/embed\/([^/]+)/)
if (_embedMatch) {
  (window as any).embed = true
  ;(window as any).logixProjectId = _embedMatch[1]
}
// ──────────────────────────────────────────────────────────────────────────

import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router/index";
import { createPinia } from "pinia";
import { loadFonts } from "./plugins/webfontloader";
import i18n from "./locales/i18n";
import "bootstrap";
import "./globalVariables";
import "./styles/css/main.stylesheet.css";
import "../node_modules/bootstrap/scss/bootstrap.scss";
import "./styles/color_theme.scss";
import "./styles/simulator.scss";
import "./styles/tutorials.scss";
import "@fortawesome/fontawesome-free/css/all.css";

loadFonts();

const app = createApp(App);
app.use(createPinia());
app.use(vuetify);
app.use(router);
app.use(i18n);
app.mount("#app");