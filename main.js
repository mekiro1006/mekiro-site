import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"

document.addEventListener("DOMContentLoaded", () => {
  // Check if THREE is loaded
  if (typeof window.THREE === "undefined") {
    console.error("Three.js not loaded")
    return
  }

  const THREE = window.THREE

  // ✅ Create Scene, Camera, and Renderer
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  const canvas = document.querySelector("#bg")
  if (!canvas) {
    console.error("Canvas element not found")
    throw new Error("Canvas element not found")
  }

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  camera.position.setZ(10)

  // ✅ Add starfield background
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    sizeAttenuation: true,
  })

  const starsVertices = []
  for (let i = 0; i < 15000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starsVertices.push(x, y, z)
  }

  starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
  const stars = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(stars)

  // ✅ Add floating geometric shapes (enhanced)
  const shapes = []
  const shapeTypes = [
    () => new THREE.BoxGeometry(0.5, 0.5, 0.5),
    () => new THREE.SphereGeometry(0.3, 12, 12),
    () => new THREE.ConeGeometry(0.3, 0.6, 8),
    () => new THREE.OctahedronGeometry(0.4),
    () => new THREE.TetrahedronGeometry(0.4),
  ]

  for (let i = 0; i < 60; i++) {
    const geometryFunc = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
    const geometry = geometryFunc()

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.8,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

    // Add random scale variation
    const scale = 0.5 + Math.random() * 1.5
    mesh.scale.setScalar(scale)

    shapes.push(mesh)
    scene.add(mesh)
  }

  // ✅ Enhanced Lighting Setup
  const pointLight1 = new THREE.PointLight(0xffffff, 1, 100)
  pointLight1.position.set(10, 10, 10)

  const pointLight2 = new THREE.PointLight(0x3b82f6, 0.5, 100)
  pointLight2.position.set(-10, -10, -10)

  const pointLight3 = new THREE.PointLight(0xef4444, 0.3, 100)
  pointLight3.position.set(10, -10, 10)

  const ambientLight = new THREE.AmbientLight(0x404040, 0.3)

  scene.add(pointLight1, pointLight2, pointLight3, ambientLight)

  // ✅ Controls Setup
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = false
  controls.enablePan = false
  controls.maxPolarAngle = Math.PI / 2
  controls.minPolarAngle = Math.PI / 4
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5

  // ✅ Post-processing with Bloom
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.1, // strength
    0.4, // radius
    0.85, // threshold
  )
  composer.addPass(bloomPass)

  // ✅ Mouse movement effect
  let mouseX = 0
  let mouseY = 0

  document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1
  })

  // ✅ Animation Loop
  function animate() {
    requestAnimationFrame(animate)

    const time = Date.now() * 0.001

    // Animate shapes with more variety
    shapes.forEach((shape, index) => {
      shape.rotation.x += 0.005 + (index % 3) * 0.002
      shape.rotation.y += 0.005 + (index % 5) * 0.001
      shape.rotation.z += 0.003 + (index % 7) * 0.001

      // Floating motion
      shape.position.y += Math.sin(time + index) * 0.02
      shape.position.x += Math.cos(time * 0.5 + index) * 0.01
    })

    // Rotate stars slowly
    stars.rotation.y += 0.0003
    stars.rotation.x += 0.0001

    // Animate lights
    pointLight1.position.x = Math.sin(time * 0.5) * 15
    pointLight1.position.z = Math.cos(time * 0.5) * 15

    pointLight2.position.x = Math.cos(time * 0.3) * 20
    pointLight2.position.y = Math.sin(time * 0.3) * 10

    // Subtle mouse interaction
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02
    camera.position.y += (mouseY * 3 - camera.position.y) * 0.02

    controls.update()
    composer.render()
  }
  animate()

  // ✅ Handle Window Resize
  window.addEventListener("resize", () => {
    const width = window.innerWidth
    const height = window.innerHeight

    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    composer.setSize(width, height)
    bloomPass.setSize(width, height)
  })

  // ✅ Add loading indicator
  const loadingElement = document.createElement("div")
  loadingElement.innerHTML = "Loading 3D Portfolio..."
  loadingElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-family: Arial, sans-serif;
    font-size: 1.2rem;
    z-index: 1000;
    opacity: 1;
    transition: opacity 0.5s ease;
  `
  document.body.appendChild(loadingElement)

  // Remove loading indicator after a short delay
  setTimeout(() => {
    loadingElement.style.opacity = "0"
    setTimeout(() => {
      document.body.removeChild(loadingElement)
    }, 500)
  }, 1000)
})
