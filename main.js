import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// ✅ Create Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(10);

// ✅ Lighting Setup (Ambient & Point Light)
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// ✅ Controls Setup for Interactive View
const controls = new OrbitControls(camera, renderer.domElement);

// ✅ Create Desk with RGB Neon Glow (Gradient applied to bottom)
const deskGeometry = new THREE.BoxGeometry(12, 0.75, 6);
const loader = new THREE.TextureLoader();
const gradientTexture = loader.load("gradient-texture.png"); // Ensure this file exists in assets

// ✅ Restrict glow to bottom area using UV scaling
gradientTexture.wrapS = THREE.RepeatWrapping;
gradientTexture.wrapT = THREE.ClampToEdgeWrapping;
gradientTexture.repeat.set(1, 0.5); // Limits gradient to lower half

const gradientMaterial = new THREE.MeshStandardMaterial({ 
    map: gradientTexture,
    emissive: new THREE.Color(0xff0000), // Base glow color
    emissiveIntensity: 0.05, // Boosted glow
    side: THREE.DoubleSide // Ensures both top and bottom render correctly
});

const desk = new THREE.Mesh(deskGeometry, gradientMaterial);
desk.position.set(0, -5, -7);
scene.add(desk);

// ✅ Smooth RGB Color Transitions
let targetColor = new THREE.Color(0xff0000); // Initial target color

function smoothRGBGlow() {
    desk.material.emissive.lerp(targetColor, 0.02); // Smoothly transition
}

// Change color every 2 seconds, but fade smoothly
function changeTargetColor() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
    targetColor.set(colors[Math.floor(Math.random() * colors.length)]);
}

setInterval(changeTargetColor, 2000); // Pick new target color
setInterval(smoothRGBGlow, 50); // Gradual blend effect

// ✅ Add Pulsing Effect to Glow
let pulseSpeed = 0.02;
let emissiveStrength = .025;
let increasing = true;

function pulseRGBGlow() {
    if (increasing) {
        emissiveStrength += pulseSpeed;
        if (emissiveStrength >= 3) increasing = false;
    } else {
        emissiveStrength -= pulseSpeed;
        if (emissiveStrength <= 1) increasing = true;
    }

    desk.material.emissiveIntensity = emissiveStrength; // Apply pulsing effect
}
setInterval(pulseRGBGlow, 100); // Adjust timing for smooth pulsing

// ✅ Create Monitor With Front-Only Texture
const screenTexture = loader.load("roombckgrnd.png");
const frontMaterial = new THREE.MeshStandardMaterial({ map: screenTexture });
const backMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });

const monitorMaterials = [
    backMaterial, backMaterial, backMaterial, backMaterial, frontMaterial, backMaterial
];

const monitorGeometry = new THREE.BoxGeometry(6, 4, 0.5);
const monitor = new THREE.Mesh(monitorGeometry, monitorMaterials);
monitor.position.set(0, -2, -9);
scene.add(monitor);

// ✅ Keyboard and Mouse (Now in Front of Monitor)
const keyboardGeometry = new THREE.BoxGeometry(5, 0.5, 2);
const keyboardMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
keyboard.position.set(-1, -4, -6.5);
scene.add(keyboard);

const mouseGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const mouseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const mouse = new THREE.Mesh(mouseGeometry, mouseMaterial);
mouse.position.set(3.5, -4, -6.5);
scene.add(mouse);

// ✅ Add RGB Glow Behind the Monitor
const rgbBacklight = new THREE.PointLight(0x00ffff, 1, 10);
rgbBacklight.position.set(0, -2, -8);
scene.add(rgbBacklight);

// ✅ Background Stars for a Futuristic Look
function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
}
Array(200).fill().forEach(addStar);

// ✅ Shadow & Reflection Settings
renderer.shadowMap.enabled = true;
monitor.castShadow = true;
desk.receiveShadow = true;
const reflectiveMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.8,
});

// ✅ Bloom Effect for Better Neon Glow
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.05, // Stronger glow intensity
    0.4,
    0.85
);
composer.addPass(bloomPass);

// ✅ Animation Loop (For Interactive View and Rotation)
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render(); // Use bloom effect
}
animate();

// ✅ Ensure Scene Resizes Dynamically
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
