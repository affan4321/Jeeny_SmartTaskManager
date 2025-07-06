'use client'
import { useRef, useEffect, useState } from 'react'

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    console.log('BackgroundCanvas: Initializing snake-like canvas animation')

    // Safe window access for iOS
    let width = typeof window !== 'undefined' ? window.innerWidth : 1920
    let height = typeof window !== 'undefined' ? window.innerHeight : 1080
    
    // iOS Safari can have issues with very large canvas dimensions
    const maxDimension = 4096
    width = Math.min(width, maxDimension)
    height = Math.min(height, maxDimension)
    
    try {
      canvas.width = width
      canvas.height = height
    } catch (error) {
      console.error('BackgroundCanvas: Error setting canvas dimensions:', error)
      return
    }

    console.log('BackgroundCanvas: Canvas dimensions:', width, 'x', height)

    // Create 4 snake-like paths that enter from outside the canvas
    const snakes = Array.from({ length: 4 }).map((_, index) => ({
      points: [] as Array<{x: number, y: number}>,
      speed: 0.8 + Math.random() * 3, // Faster movement for longer paths
      amplitude: 40 + Math.random() * 10, // Larger amplitude for more dramatic curves
      frequency: 0.003 + Math.random() * 0.005, // Slower frequency for smoother curves
      phase: index * Math.PI * 2 / 4,
      // Start from outside the canvas
      x: index % 2 === 0 ? -100 : width + 100, // Left or right side entry
      y: Math.random() * height, // Random vertical position
      direction: index % 2 === 0 ? 0 : Math.PI, // Move right or left initially
      maxPoints: 200, // Much longer trails
      lifespan: 0, // Track how long the snake has been alive
      maxLifespan: 1000 + Math.random() * 500, // Live longer for screen-crossing paths
      entryComplete: false // Track if snake has entered the screen
    }))

    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      time += 0.01

      snakes.forEach((snake) => {
        // Increment lifespan
        snake.lifespan++

        // Reset snake if it's lived too long or gone off screen
        if (snake.lifespan > snake.maxLifespan || 
            (snake.x < -200 && snake.direction > Math.PI/2 && snake.direction < 3*Math.PI/2) ||
            (snake.x > width + 200 && (snake.direction < Math.PI/2 || snake.direction > 3*Math.PI/2)) ||
            (snake.y < -200 && snake.direction > Math.PI && snake.direction < 2*Math.PI) ||
            (snake.y > height + 200 && snake.direction > 0 && snake.direction < Math.PI)) {
          
          // Respawn snake from outside
          snake.lifespan = 0
          snake.points = []
          snake.entryComplete = false
          
          // Choose random entry point from outside canvas
          const side = Math.floor(Math.random() * 4) // 0: left, 1: right, 2: top, 3: bottom
          switch(side) {
            case 0: // Enter from left
              snake.x = -100
              snake.y = Math.random() * height
              snake.direction = Math.random() * Math.PI/2 - Math.PI/4 // Roughly rightward
              break
            case 1: // Enter from right
              snake.x = width + 100
              snake.y = Math.random() * height
              snake.direction = Math.PI + Math.random() * Math.PI/2 - Math.PI/4 // Roughly leftward
              break
            case 2: // Enter from top
              snake.x = Math.random() * width
              snake.y = -100
              snake.direction = Math.PI/2 + Math.random() * Math.PI/2 - Math.PI/4 // Roughly downward
              break
            case 3: // Enter from bottom
              snake.x = Math.random() * width
              snake.y = height + 100
              snake.direction = 3*Math.PI/2 + Math.random() * Math.PI/2 - Math.PI/4 // Roughly upward
              break
          }
        }

        // Update snake position with sine wave motion
        snake.x += Math.cos(snake.direction) * snake.speed
        snake.y += Math.sin(snake.direction) * snake.speed

        // Add curve to the movement for organic flow
        snake.direction += Math.sin(time * snake.frequency + snake.phase) * 0.03

        // Mark entry as complete when snake is well inside the canvas
        if (!snake.entryComplete && 
            snake.x > -50 && snake.x < width + 50 && 
            snake.y > -50 && snake.y < height + 50) {
          snake.entryComplete = true
        }

        // Add new point to the snake
        snake.points.push({
          x: snake.x + Math.sin(time * 2 + snake.phase) * snake.amplitude,
          y: snake.y + Math.cos(time * 2 + snake.phase) * snake.amplitude * 0.5
        })

        // Remove old points to maintain trail length
        if (snake.points.length > snake.maxPoints) {
          snake.points.shift()
        }

        // Draw the snake with smooth curves and shooting star effect
        if (snake.points.length > 3) {
          // Draw multiple layers for shooting star effect with pointed tail
          for (let layer = 0; layer < 3; layer++) {
            const baseWidth = 8 + layer * 6
            const layerOpacity = layer === 0 ? 1.0 : (layer === 1 ? 0.6 : 0.3)
            
            // Draw shooting star with pointed tail using triangular path
            ctx.beginPath()
            
            // Start from the head (full width)
            const headPoint = snake.points[snake.points.length - 1]
            const tailPoint = snake.points[0]
            
            // Create a path that forms a pointed tail
            const pointPath = []
            
            // Calculate perpendicular vectors for width
            for (let i = 0; i < snake.points.length - 1; i++) {
              const progress = i / (snake.points.length - 1) // 0 to 1 from tail to head
              const point = snake.points[i]
              const nextPoint = snake.points[i + 1]
              
              // Calculate direction vector
              const dx = nextPoint.x - point.x
              const dy = nextPoint.y - point.y
              const length = Math.sqrt(dx * dx + dy * dy)
              
              if (length > 0) {
                // Normalize direction vector
                const ndx = dx / length
                const ndy = dy / length
                
                // Perpendicular vector
                const perpX = -ndy
                const perpY = ndx
                
                // Width tapers from full at head to zero at tail
                // Use a more aggressive taper to ensure tail is truly pointed
                const width = i === 0 ? 0 : baseWidth * Math.pow(progress, 0.3) // Zero width at tail, aggressive taper
                
                // Create points on both sides of the path
                pointPath.push({
                  left: { x: point.x + perpX * width, y: point.y + perpY * width },
                  right: { x: point.x - perpX * width, y: point.y - perpY * width },
                  center: point
                })
              }
            }
            
            // Draw the shooting star shape with pointed tail
            if (pointPath.length > 1) {
              ctx.beginPath()
              
              // Start at the tail point (perfectly pointed)
              ctx.moveTo(tailPoint.x, tailPoint.y)
              
              // Draw one side of the shooting star
              for (let i = 1; i < pointPath.length; i++) {
                const cp1x = (pointPath[i - 1].left.x + pointPath[i].left.x) / 2
                const cp1y = (pointPath[i - 1].left.y + pointPath[i].left.y) / 2
                ctx.quadraticCurveTo(pointPath[i - 1].left.x, pointPath[i - 1].left.y, cp1x, cp1y)
              }
              
              // Connect to the head
              ctx.lineTo(headPoint.x, headPoint.y)
              
              // Draw the other side back to the tail
              for (let i = pointPath.length - 1; i > 0; i--) {
                const cp1x = (pointPath[i].right.x + pointPath[i - 1].right.x) / 2
                const cp1y = (pointPath[i].right.y + pointPath[i - 1].right.y) / 2
                ctx.quadraticCurveTo(pointPath[i].right.x, pointPath[i].right.y, cp1x, cp1y)
              }
              
              // Close the path back to the pointed tail
              ctx.closePath()
              
              // Create gradient from head to tail
              const gradient = ctx.createLinearGradient(
                headPoint.x, headPoint.y, // Head (bright)
                tailPoint.x, tailPoint.y // Tail (transparent)
              )
              
              // Use the exact Jeeny pink color #ef018d with shooting star gradient
              gradient.addColorStop(0, `rgba(239, 1, 141, ${layerOpacity})`) // Bright head
              gradient.addColorStop(0.2, `rgba(239, 1, 141, ${layerOpacity * 0.9})`) 
              gradient.addColorStop(0.6, `rgba(239, 1, 141, ${layerOpacity * 0.5})`)
              gradient.addColorStop(0.9, `rgba(239, 1, 141, ${layerOpacity * 0.1})`)
              gradient.addColorStop(1, `rgba(239, 1, 141, 0)`) // Transparent tail
              
              ctx.fillStyle = gradient
              
              // Add glow effect for outer layers
              if (layer > 0) {
                ctx.shadowColor = `rgba(239, 1, 141, ${0.4 / layer})`
                ctx.shadowBlur = 15 * layer
              } else {
                ctx.shadowBlur = 0
              }
              
              ctx.fill()
              ctx.shadowBlur = 0
            }
          }
          
          // Add bright core line for the head
          ctx.beginPath()
          const headStart = Math.max(0, snake.points.length - 20)
          ctx.moveTo(snake.points[headStart].x, snake.points[headStart].y)
          
          for (let i = headStart; i < snake.points.length - 2; i++) {
            const cp1x = (snake.points[i].x + snake.points[i + 1].x) / 2
            const cp1y = (snake.points[i].y + snake.points[i + 1].y) / 2
            ctx.quadraticCurveTo(snake.points[i].x, snake.points[i].y, cp1x, cp1y)
          }
          
          ctx.lineWidth = 3
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)' // Bright white core
          ctx.lineCap = 'round'
          ctx.stroke()
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    // iOS-friendly resize listener with throttling
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            width = Math.min(window.innerWidth, 4096)
            height = Math.min(window.innerHeight, 4096)
            canvas.width = width
            canvas.height = height
          }
        } catch (error) {
          console.error('BackgroundCanvas: Error during resize:', error)
        }
      }, 100)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize, { passive: true })
    }

    return () => {
      clearTimeout(resizeTimeout)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [isClient])

  if (!isClient) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: -1,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        // iOS-specific optimizations
        WebkitTransform: 'translate3d(0, 0, 0)',
        transform: 'translate3d(0, 0, 0)',
      }}
    />
  )
}
