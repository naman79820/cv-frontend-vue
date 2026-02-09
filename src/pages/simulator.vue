<template>
    <div class="simulator-container">
        <Navbar />
        <DebugControls />
        <ContextMenu />
        <Extra />
        <Helper />
        <DebugTimeline />
        <!-- Add Breakpoint Panel -->
        <BreakpointPanel />
    </div>
</template>

<script setup lang="ts">
import Navbar from '@/Navbar/Navbar.vue'
import ContextMenu from '@/ContextMenu/ContextMenu.vue'
import Extra from '@/Extra.vue'
import { defineComponent, onMounted } from 'vue'
import { setup as setupSimulator } from '../simulator/src/setup'
import Helper from '#/components/helpers/Helper.vue'
import DebugControls from '#/components/DebugControls.vue'
import DebugTimeline from '#/components/DebugTimeline.vue'
import BreakpointPanel from '#/components/BreakpointPanel.vue'

defineComponent({
    components: {
        Navbar,
        ContextMenu,
        Extra,
        DebugControls,
        DebugTimeline,
        BreakpointPanel,
    },
})

onMounted(() => {
    setupSimulator()
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