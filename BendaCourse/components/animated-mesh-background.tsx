"use client"

import { useEffect, useRef, useState } from 'react'

interface AnimatedMeshBackgroundProps {
  className?: string
  gridSize?: number
  animationDuration?: number
  opacity?: {
    min?: number
    max?: number
  }
}

export function AnimatedMeshBackground({
  className = '',
  gridSize = 100,
  animationDuration = 8000,
  opacity = { min: 0.35, max: 0.5 },
}: AnimatedMeshBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawMesh = (animationValue: number) => {
      const { width, height } = canvas
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Calculate animation values
      const stretchX = 1.0 + Math.sin(animationValue) * 0.05
      const stretchY = 1.0 + Math.sin(animationValue + Math.PI) * 0.05
      const currentOpacity = opacity.min! + Math.sin(animationValue * 2) * (opacity.max! - opacity.min!)

      // Save context
      ctx.save()

      // Apply transformations (stretching)
      ctx.translate(width / 2, height / 2)
      ctx.scale(stretchX, stretchY)
      ctx.translate(-width / 2, -height / 2)

      // Extended dimensions for diagonal lines
      const extendedWidth = width * 1.5
      const extendedHeight = height * 1.5
      const offsetX = -width * 0.25
      const offsetY = -height * 0.25

      // Set line style
      ctx.strokeStyle = `rgba(128, 128, 128, ${currentOpacity})`
      ctx.lineWidth = 0.5

      // Draw vertical lines
      for (let x = offsetX; x <= extendedWidth; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, offsetY)
        ctx.lineTo(x, extendedHeight)
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let y = offsetY; y <= extendedHeight; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(offsetX, y)
        ctx.lineTo(extendedWidth, y)
        ctx.stroke()
      }

      // Draw diagonal lines (first direction)
      ctx.strokeStyle = `rgba(128, 128, 128, ${currentOpacity * 0.8})`
      for (let i = -extendedHeight; i <= extendedWidth + extendedHeight; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i - extendedHeight, offsetY)
        ctx.lineTo(i, extendedHeight)
        ctx.stroke()
      }

      // Draw diagonal lines (second direction)
      for (let i = -extendedHeight; i <= extendedWidth + extendedHeight; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, offsetY)
        ctx.lineTo(i - extendedHeight, extendedHeight)
        ctx.stroke()
      }

      // Restore context
      ctx.restore()
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = (elapsed % animationDuration) / animationDuration
      const animationValue = progress * 2 * Math.PI

      drawMesh(animationValue)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gridSize, animationDuration, opacity.min, opacity.max])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}

