<template>
  <Embed />
</template>

<script setup lang="ts">
// embed.vue already exists and handles:
// - window.embed = true detection
// - window.logixProjectId reading  
// - canvas setup, zoom, fullscreen, clock controls
// - startListeners() and setup() from simulator engine
import Embed from './pages/embed.vue'
</script>