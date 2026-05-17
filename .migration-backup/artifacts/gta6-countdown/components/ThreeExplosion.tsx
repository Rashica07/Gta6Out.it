'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  onComplete: () => void
}

export default function ThreeExplosion({ onComplete }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const w = window.innerWidth
    const h = window.innerHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
    camera.position.z = 5

    const COLORS = [
      new THREE.Color('#c000ff'),
      new THREE.Color('#ff00cc'),
      new THREE.Color('#ff8c00'),
      new THREE.Color('#ffcc00'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#ff4500'),
      new THREE.Color('#ff50aa'),
      new THREE.Color('#ee00ff'),
      new THREE.Color('#ff6b00'),
    ]

    const COUNT = 600
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(COUNT * 3)
    const vColors = new Float32Array(COUNT * 3)
    const velocities: THREE.Vector3[] = []

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0

      const speed = 0.04 + Math.random() * 0.18
      const phi = Math.random() * Math.PI * 2
      const theta = Math.acos(2 * Math.random() - 1)
      velocities.push(new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi) * speed,
        Math.sin(theta) * Math.sin(phi) * speed,
        Math.cos(theta) * speed * 0.4,
      ))

      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      vColors[i * 3] = c.r
      vColors[i * 3 + 1] = c.g
      vColors[i * 3 + 2] = c.b
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(vColors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    const startTime = Date.now()
    const DURATION = 2800
    let animId: number
    let completed = false

    function animate() {
      animId = requestAnimationFrame(animate)
      const elapsed = Date.now() - startTime
      const t = elapsed / DURATION

      const pos = geo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < COUNT; i++) {
        const vx = velocities[i].x
        const vy = velocities[i].y - 0.0008 * elapsed / 100
        const vz = velocities[i].z
        pos.setXYZ(i, pos.getX(i) + vx, pos.getY(i) + vy, pos.getZ(i) + vz)
      }
      pos.needsUpdate = true

      mat.opacity = t < 0.6 ? 1 : Math.max(0, 1 - ((t - 0.6) / 0.4))
      points.rotation.y += 0.005

      renderer.render(scene, camera)

      if (elapsed >= DURATION && !completed) {
        completed = true
        cancelAnimationFrame(animId)
        onCompleteRef.current()
      }
    }

    animate()

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geo.dispose()
      mat.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: 'rgba(4, 0, 16, 0.88)',
        pointerEvents: 'none',
      }}
    />
  )
}
