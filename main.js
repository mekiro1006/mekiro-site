// Wait for all scripts to load
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
    return
  }

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false, // Changed to false to ensure black background
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 1) // Explicitly set black background
  camera.position.setZ(30) // Moved camera back to see more stars

  // ✅ Controls Setup for mouse revolution
  let controls
  if (typeof THREE.OrbitControls !== "undefined") {
    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false
    controls.maxDistance = 20
    controls.minDistance = 5
    controls.maxPolarAngle = Math.PI / 1.5
    controls.minPolarAngle = Math.PI / 3
    controls.autoRotate = false
    controls.autoRotateSpeed = 0.5
  }

  // ✅ FIXED: Improved starfield with better visibility
  const starCount = 5000
  const starGeometry = new THREE.BufferGeometry()
  const starPositions = new Float32Array(starCount * 3)
  const starSizes = new Float32Array(starCount)

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    // Create a sphere of stars around the camera
    const radius = Math.random() * 600 + 100
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    starPositions[i3 + 2] = radius * Math.cos(phi)

    // Vary star sizes for depth effect
    starSizes[i] = Math.random() * 2 + 0.5
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))
  starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1))

  // Create a custom shader material for better-looking stars
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending, // Makes stars brighter where they overlap
  })

  const stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)
  console.log("Stars added to scene:", stars)

  // ✅ Add floating geometric shapes
  const shapes = []
  for (let i = 0; i < 50; i++) {
    const geometry = Math.random() > 0.5 ? new THREE.BoxGeometry(0.5, 0.5, 0.5) : new THREE.SphereGeometry(0.3, 8, 8)

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      transparent: true,
      opacity: 0.8,
      emissive: new THREE.Color().setHSL(Math.random(), 0.9, 0.4),
      emissiveIntensity: 0.5,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

    shapes.push(mesh)
    scene.add(mesh)
  }

  // ✅ Improved Lighting Setup
  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(5, 5, 5)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5) // Increased ambient light
  scene.add(pointLight, ambientLight)

  // ✅ Controls Setup (with fallback)
  // let controls
  // if (typeof THREE.OrbitControls !== "undefined") {
  //   controls = new THREE.OrbitControls(camera, renderer.domElement)
  //   controls.enableDamping = true
  //   controls.dampingFactor = 0.05
  //   controls.enableZoom = false
  //   controls.enablePan = false
  //   controls.maxPolarAngle = Math.PI / 2
  //   controls.minPolarAngle = Math.PI / 4
  // }

  // ✅ Post-processing (with fallback)
  let composer
  if (
    typeof THREE.EffectComposer !== "undefined" &&
    typeof THREE.RenderPass !== "undefined" &&
    typeof THREE.UnrealBloomPass !== "undefined"
  ) {
    composer = new THREE.EffectComposer(renderer)
    composer.addPass(new THREE.RenderPass(scene, camera))

    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.2, // Increased bloom strength
      0.4,
      0.85,
    )
    composer.addPass(bloomPass)
  }

  // ✅ Mouse movement effect
  let mouseX = 0
  let mouseY = 0
  const heroName = document.querySelector("#heroName") // Declare heroName variable

  document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1

    // Move hero name with mouse (subtle effect)
    if (heroName) {
      const moveX = mouseX * 10
      const moveY = mouseY * 10
      heroName.style.transform = `translate(${moveX}px, ${moveY}px)`
    }
  })

  // ✅ Animation Loop
  function animate() {
    requestAnimationFrame(animate)

    // Animate main shapes
    shapes.forEach((shape, index) => {
      if (index < 3) {
        // Main shapes (sphere, cube, torus) - slower rotation
        shape.rotation.x += 0.005
        shape.rotation.y += 0.005
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.005
      } else {
        // Smaller shapes - faster rotation
        shape.rotation.x += 0.01
        shape.rotation.y += 0.01
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01
      }
    })

    // Rotate stars very slowly
    stars.rotation.y += 0.0002

    // Update controls
    if (controls) {
      controls.update()
    }

    renderer.render(scene, camera)
  }
  animate()

  // ✅ Handle Window Resize
  window.addEventListener("resize", () => {
    const width = window.innerWidth
    const height = window.innerHeight

    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    if (composer) {
      composer.setSize(width, height)
    }
  })

  // Debug info
  console.log("Scene initialized with:", {
    stars: stars,
    shapes: shapes.length,
    camera: camera.position,
    renderer: renderer,
  })
})
