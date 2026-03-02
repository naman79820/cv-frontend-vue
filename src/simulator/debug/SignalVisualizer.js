/* eslint-disable import/no-cycle */
import { simulationArea } from '../../simulator/src/simulationArea'

/**
 * Visualizes signal propagation through the circuit with animations
 * @category debug
 */
export class SignalVisualizer {
    constructor() {
        this.isEnabled = false
        this.animationSpeed = 300 // ms for glow animation
        this.activeSignals = []
        this.previousState = null
    }

    /**
     * Enable signal visualization
     * @param {number} speed - Animation speed in milliseconds
     */
    enable(speed = 300) {
        this.isEnabled = true
        this.animationSpeed = speed
        this.activeSignals = []
        console.log('⚡ Signal visualization enabled, speed:', speed, 'ms')
    }

    /**
     * Disable signal visualization
     */
    disable() {
        this.isEnabled = false
        this.activeSignals = []
        this.previousState = null
    }

    /**
     * Track signal changes between states
     * @param {Object} currentState - Current circuit state
     * @param {Object} previousState - Previous circuit state
     */
    trackChanges(currentState, previousState) {
        if (!this.isEnabled) return
        if (!currentState || !previousState) return

        const now = Date.now()

        // Find wires that changed
        const changedWires = this.findChangedWires(currentState.wires, previousState.wires)
        
        // Find nodes that changed
        const changedNodes = this.findChangedNodes(currentState.nodes, previousState.nodes)

        // Add to active signals
        changedWires.forEach((wireIndex) => {
            this.activeSignals.push({
                type: 'wire',
                index: wireIndex,
                startTime: now,
                duration: this.animationSpeed
            })
        })

        changedNodes.forEach((nodeIndex) => {
            this.activeSignals.push({
                type: 'node',
                index: nodeIndex,
                startTime: now,
                duration: this.animationSpeed
            })
        })

        // Remove expired signals
        this.activeSignals = this.activeSignals.filter(signal => {
            const elapsed = now - signal.startTime
            return elapsed < signal.duration
        })
    }

    /**
     * Find which wires changed between states
     */
    findChangedWires(currentWires, previousWires) {
        const changed = []
        
        if (!currentWires || !previousWires) return changed

        currentWires.forEach((wire, index) => {
            if (previousWires[index]) {
                if (wire.value !== previousWires[index].value) {
                    changed.push(index)
                }
            }
        })

        return changed
    }

    /**
     * Find which nodes changed between states
     */
    findChangedNodes(currentNodes, previousNodes) {
        const changed = []
        
        if (!currentNodes || !previousNodes) return changed

        currentNodes.forEach((node, index) => {
            if (previousNodes[index]) {
                if (node.value !== previousNodes[index].value) {
                    changed.push(index)
                }
            }
        })

        return changed
    }

    /**
     * Draw signal animations on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Scope} scope - Current circuit scope
     */
    drawSignals(ctx, scope) {
        if (!this.isEnabled || this.activeSignals.length === 0) return

        const now = Date.now()

        this.activeSignals.forEach(signal => {
            const elapsed = now - signal.startTime
            const progress = elapsed / signal.duration
            
            // Calculate fade out intensity (1 -> 0)
            const intensity = 1 - progress

            if (signal.type === 'wire') {
                this.drawWireGlow(ctx, scope, signal.index, intensity)
            } else if (signal.type === 'node') {
                this.drawNodeGlow(ctx, scope, signal.index, intensity)
            }
        })
    }

    /**
     * Draw glowing effect on a wire
     */
    drawWireGlow(ctx, scope, wireIndex, intensity) {
        if (!scope.wires || !scope.wires[wireIndex]) return

        const wire = scope.wires[wireIndex]
        
        ctx.save()
        
        // Create glowing effect
        ctx.shadowBlur = 15 * intensity
        ctx.shadowColor = `rgba(255, 215, 0, ${intensity})`
        ctx.strokeStyle = `rgba(255, 215, 0, ${intensity * 0.8})`
        ctx.lineWidth = 6
        
        // Draw the wire with glow
        ctx.beginPath()
        ctx.moveTo(wire.x1, wire.y1)
        ctx.lineTo(wire.x2, wire.y2)
        ctx.stroke()
        
        // Draw pulsing effect
        ctx.lineWidth = 3
        ctx.shadowBlur = 25 * intensity
        ctx.strokeStyle = `rgba(255, 255, 100, ${intensity})`
        ctx.beginPath()
        ctx.moveTo(wire.x1, wire.y1)
        ctx.lineTo(wire.x2, wire.y2)
        ctx.stroke()
        
        ctx.restore()
    }

    /**
     * Draw glowing effect on a node
     */
    drawNodeGlow(ctx, scope, nodeIndex, intensity) {
        if (!scope.allNodes || !scope.allNodes[nodeIndex]) return

        const node = scope.allNodes[nodeIndex]
        const x = node.absX ? node.absX() : node.x
        const y = node.absY ? node.absY() : node.y
        
        ctx.save()
        
        // Outer glow
        ctx.shadowBlur = 20 * intensity
        ctx.shadowColor = `rgba(255, 215, 0, ${intensity})`
        ctx.fillStyle = `rgba(255, 215, 0, ${intensity * 0.6})`
        
        ctx.beginPath()
        ctx.arc(x, y, 8 * intensity, 0, Math.PI * 2)
        ctx.fill()
        
        // Inner bright spot
        ctx.shadowBlur = 10 * intensity
        ctx.fillStyle = `rgba(255, 255, 100, ${intensity})`
        ctx.beginPath()
        ctx.arc(x, y, 4 * intensity, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
    }

    /**
     * Get active signals count (for UI display)
     */
    getActiveSignalsCount() {
        return this.activeSignals.length
    }

    /**
     * Check if currently animating
     */
    isAnimating() {
        return this.isEnabled && this.activeSignals.length > 0
    }
}

// Export singleton instance
export const signalVisualizer = new SignalVisualizer()