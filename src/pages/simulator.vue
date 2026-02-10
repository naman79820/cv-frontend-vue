<template>
    <div class="simulator-container">
        <Navbar />
        <DebugControls @debug-mode-changed="handleDebugModeChange" />
        <ContextMenu />
        <Extra />
        <Helper />
        <DebugTimeline />
        <BreakpointPanel />
        <WatchPanel ref="watchPanel" />
        <CircuitTooltip ref="tooltip" />
        <SignalVisualizationControl />
    </div>
</template>

<script setup lang="ts">
import Navbar from '@/Navbar/Navbar.vue'
import ContextMenu from '@/ContextMenu/ContextMenu.vue'
import Extra from '@/Extra.vue'
import { defineComponent, onMounted, ref, onUnmounted } from 'vue'
import { setup as setupSimulator } from '../simulator/src/setup'
import Helper from '#/components/helpers/Helper.vue'
import DebugControls from '#/components/DebugControls.vue'
import DebugTimeline from '#/components/DebugTimeline.vue'
import BreakpointPanel from '#/components/BreakpointPanel.vue'
import WatchPanel from '#/components/WatchPanel.vue'
import CircuitTooltip from '#/components/CircuitTooltip.vue'
import SignalVisualizationControl from '#/components/SignalVisualizationControl.vue'

defineComponent({
    components: {
        Navbar,
        ContextMenu,
        Extra,
        DebugControls,
        DebugTimeline,
        BreakpointPanel,
        WatchPanel,
        CircuitTooltip,
        SignalVisualizationControl,
    },
})

const tooltip = ref(null)
const watchPanel = ref(null)

let initCanvasDebugListeners: any
let setCanvasDebugMode: any
let cleanupCanvasDebugListeners: any

async function loadDebugListeners() {
  try {
    const module = await import('../simulator/debug/canvasDebugListeners')
    initCanvasDebugListeners = module.initCanvasDebugListeners
    setCanvasDebugMode = module.setCanvasDebugMode
    cleanupCanvasDebugListeners = module.cleanupCanvasDebugListeners
    console.log('✅ Debug listeners loaded successfully!')
  } catch (error) {
    console.error('❌ Failed to load canvas debug listeners:', error)
  }
}

function handleDebugModeChange(enabled: boolean) {
  console.log('🐛 Debug mode changed:', enabled)
  if (setCanvasDebugMode) {
    setCanvasDebugMode(enabled)
    console.log('✅ Canvas debug mode set to:', enabled)
  }
}

onMounted(async () => {
    setupSimulator()
    
    // Wait a bit for simulator to initialize
    setTimeout(async () => {
      await loadDebugListeners()
      
      if (initCanvasDebugListeners && tooltip.value) {
        initCanvasDebugListeners(tooltip.value)
        console.log('✅ Canvas debug listeners initialized with tooltip!')
      } else {
        console.error('❌ Failed to initialize:', { 
          initCanvasDebugListeners, 
          tooltip: tooltip.value 
        })
      }
    }, 1000)
})

onUnmounted(() => {
  if (cleanupCanvasDebugListeners) {
    cleanupCanvasDebugListeners()
  }
})
</script>

<style scoped>
.simulator-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
</style>