document.addEventListener("DOMContentLoaded", () => {
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
  camera.position.setZ(10)

  // ✅ Add starfield background
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.3,
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

  // ✅ Add specific geometric shapes like in the reference image
  const shapes = []

  // Blue sphere (like in reference)
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x4169e1,
    transparent: true,
    opacity: 0.8,
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(-8, 2, -5)
  shapes.push(sphere)
  scene.add(sphere)

  // Red cube (like in reference)
  const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xdc143c,
    transparent: true,
    opacity: 0.8,
  })
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.set(8, -2, -3)
  shapes.push(cube)
  scene.add(cube)

  // Green torus (like in reference)
  const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 32)
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x32cd32,
    transparent: true,
    opacity: 0.8,
  })
  const torus = new THREE.Mesh(torusGeometry, torusMaterial)
  torus.position.set(6, 4, -8)
  shapes.push(torus)
  scene.add(torus)

  // Additional smaller shapes for depth
  for (let i = 0; i < 20; i++) {
    const geometry = Math.random() > 0.5 ? new THREE.BoxGeometry(0.3, 0.3, 0.3) : new THREE.SphereGeometry(0.2, 8, 8)
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      transparent: true,
      opacity: 0.4,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40)
    shapes.push(mesh)
    scene.add(mesh)
  }

  // ✅ Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  // ✅ Mouse interaction for hero name
  const heroName = document.getElementById("heroName")
  let mouseX = 0
  let mouseY = 0

  document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1

    // Move hero name with mouse (subtle effect)
    if (heroName) {
      const moveX = mouseX * 20
      const moveY = mouseY * 20
      heroName.style.transform = `translate(${moveX}px, ${moveY}px)`
    }

    // Move camera slightly with mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.05
    camera.position.y += (mouseY * 3 - camera.position.y) * 0.05
  })

  // ✅ Navigation functionality
  const navButtons = document.querySelectorAll(".nav-btn")
  const sections = document.querySelectorAll(".content-section")

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetSection = button.getAttribute("data-section")

      // Update active nav button
      navButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      // Update active section
      sections.forEach((section) => section.classList.remove("active"))
      document.getElementById(targetSection).classList.add("active")
    })
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
  })
})
