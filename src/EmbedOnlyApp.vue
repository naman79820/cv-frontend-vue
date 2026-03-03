<template>
  <div style="height: 100%; width: 100%; position: relative; overflow: hidden;">
    <!-- Simulator Canvas Area -->
    <div id="simulation" class="simulation" style="height: 100%; width: 100%">

      <!-- Tabs (needed by simulator engine) -->
      <div class="noSelect pointerCursor" style="position: absolute; left: 0; top: 0; z-index: 4">
        <TabsBar />
      </div>

      <!-- Verilog code window -->
      <div id="code-window" class="code-window-embed">
        <textarea id="codeTextArea"></textarea>
      </div>

      <div id="MessageDiv"></div>

      <!-- Main canvas -->
      <div id="canvasArea" class="canvasArea" style="height: 100%; width: 100%">
        <canvas
          id="backgroundArea"
          style="position: absolute; left: 0; top: 0; z-index: 0"
        ></canvas>
        <canvas
          id="simulationArea"
          style="position: absolute; left: 0; top: 0; z-index: 1; width: 100%; height: 100%"
        ></canvas>
      </div>

      <div id="elementName"></div>

      <!-- Zoom controls -->
      <div style="position: absolute; left: 0; top: 0; z-index: 4">
        <button type="button" style="font-size: 25px" @click="ZoomIn()">
          <span class="fa fa-search-plus" aria-hidden="true" title="Zoom In"></span>
        </button>
        <button type="button" style="font-size: 25px" @click="ZoomOut()">
          <span class="fa fa-search-minus" aria-hidden="true" title="Zoom Out"></span>
        </button>
      </div>

      <!-- Clock + Fullscreen controls -->
      <div style="position: absolute; right: 10px; top: 25px; z-index: 100">
        <div id="clockProperty">
          <input
            type="button"
            value="Full Screen"
            @click="toggleFullScreen"
            style="cursor: pointer; padding: 4px 8px;"
          />
          <div v-if="hasClockTime">
            Time:
            <input
              v-model="timePeriod"
              min="50"
              type="number"
              style="width: 48px; background: var(--bg-circuit); color: var(--text);"
              step="10"
            />
          </div>
          <div v-if="hasClockTime">
            Clock:
            <input v-model="clockEnabled" type="checkbox" />
          </div>
        </div>
      </div>

      <!-- Loading spinner -->
      <div
        class="sk-folding-cube loadingIcon"
        style="display: inline-block; position: absolute; right: 50%; bottom: 50%; z-index: 100"
      >
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>

      <!-- Watermark -->
      <div id="bottom_right_watermark">
        <a
          style="text-decoration: none; position: fixed; bottom: 0px; right: 25px; padding: 8px; font-family: Verdana; font-size: 12px; color: grey; z-index: 2;"
          href="https://circuitverse.org/"
          target="_blank"
        >
          Made With CircuitVerse
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { simulationArea, changeClockTime } from '#/simulator/src/simulationArea'
import { scheduleUpdate, updateCanvasSet, wireToBeCheckedSet, gridUpdateSet } from '#/simulator/src/engine'
import { prevPropertyObjSet, prevPropertyObjGet } from '#/simulator/src/ux'
import { circuitProperty, scopeList } from '#/simulator/src/circuit'
import { ZoomIn, ZoomOut } from '#/simulator/src/listeners'
import { setup } from '#/simulator/src/setup'
import startListeners from '#/simulator/src/embedListeners'
import TabsBar from '#/components/TabsBar/TabsBar.vue'
import { updateThemeForStyle } from '#/simulator/src/themer/themer'
import { THEME, ThemeType } from '#/assets/constants/theme'

const timePeriod = ref(simulationArea.timePeriod)
const clockEnabled = ref(simulationArea.clockEnabled)

// Read embed preferences from URL query params
const urlParams = new URLSearchParams(window.location.search)
const hasClockTime = urlParams.get('clock_time') !== 'false'
const hasFullscreen = urlParams.get('fullscreen') !== 'false'
const theme = urlParams.get('theme') || ''

watch(timePeriod, (val) => {
  scheduleUpdate()
  updateCanvasSet(true)
  wireToBeCheckedSet(1)
  if (simulationArea.lastSelected?.['changeClockTime']) {
    prevPropertyObjSet('changeClockTime') || prevPropertyObjGet()
  } else {
    if (val < 50) val = 50
    changeClockTime(val)
  }
})

watch(clockEnabled, (val) => {
  scheduleUpdate()
  updateCanvasSet(true)
  wireToBeCheckedSet(1)
  if (simulationArea.lastSelected?.['changeClockEnable']) {
    prevPropertyObjSet('changeClockEnable') || prevPropertyObjGet()
  } else {
    circuitProperty.changeClockEnable(val)
  }
})

onBeforeMount(() => {
  window.embed = true
})

onMounted(() => {
  if (theme) updateThemeForStyle(THEME[theme as keyof ThemeType])
  startListeners()
  setup()
})

// Fullscreen helpers
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// Recenter on fullscreen exit
document.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    Object.keys(scopeList).forEach(id => scopeList[id].centerFocus(true))
    gridUpdateSet(true)
    scheduleUpdate()
  }, 100)
})
</script>

<style>
#app { height: 100%; }
</style>