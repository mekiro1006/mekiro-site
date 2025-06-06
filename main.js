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
    size: 0.5,
    sizeAttenuation: true,
  })

  const starsVertices = []
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starsVertices.push(x, y, z)
  }

  starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
  const stars = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(stars)

  // ✅ Add floating geometric shapes
  const shapes = []
  for (let i = 0; i < 50; i++) {
    const geometry = Math.random() > 0.5 ? new THREE.BoxGeometry(0.5, 0.5, 0.5) : new THREE.SphereGeometry(0.3, 8, 8)

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      transparent: true,
      opacity: 0.8,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

    shapes.push(mesh)
    scene.add(mesh)
  }

  // ✅ Lighting Setup
  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(5, 5, 5)
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
  scene.add(pointLight, ambientLight)

  // ✅ Controls Setup (with fallback)
  let controls
  if (typeof THREE.OrbitControls !== "undefined") {
    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI / 2
    controls.minPolarAngle = Math.PI / 4
  }

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
      0.05,
      0.4,
      0.85,
    )
    composer.addPass(bloomPass)
  }

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

    // Animate shapes
    shapes.forEach((shape, index) => {
      shape.rotation.x += 0.01
      shape.rotation.y += 0.01
      shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01
    })

    // Rotate stars slowly
    stars.rotation.y += 0.0005

    // Mouse interaction
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.05

    if (controls) {
      controls.update()
    }

    // Use composer if available, otherwise use regular renderer
    if (composer) {
      composer.render()
    } else {
      renderer.render(scene, camera)
    }
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
})
