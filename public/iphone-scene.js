import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const container = document.getElementById('iphone-3d-container');
if (container) {
  // --- Scene ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.001, 10);
  camera.position.set(0, 0, 0.45);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // --- Lights (simple, no env map) ---
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x4488ff, 1.0);
  fill.position.set(-3, 2, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x8855ff, 0.6);
  rim.position.set(-1, -2, -3);
  scene.add(rim);

  const top = new THREE.DirectionalLight(0xffffff, 0.8);
  top.position.set(0, 5, 0);
  scene.add(top);

  // --- Scroll state (mutated directly by ScrollTrigger) ---
  let scrollProgress = 0;
  const BASE_ROT_Y = -0.35;
  const BASE_ROT_X = 0.14;

  // --- Load model ---
  let model = null;
  const loader = new GLTFLoader();
  loader.load('/iphone-17-pro.glb', (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    model.position.sub(box.getCenter(new THREE.Vector3()));
    model.rotation.x = BASE_ROT_X;
    model.rotation.y = BASE_ROT_Y;
    scene.add(model);

    // --- GSAP ScrollTrigger ---
    setupScroll();
  });

  // --- Render loop (lightweight — just reads scrollProgress) ---
  let raf;
  let needsRender = true;
  const clock = new THREE.Clock();

  function render() {
    raf = requestAnimationFrame(render);
    if (!model) return;

    const t = clock.getElapsedTime();

    // Smooth rotation driven by scroll
    model.rotation.y = BASE_ROT_Y + scrollProgress * Math.PI * 2;
    model.rotation.x = BASE_ROT_X * (1 - scrollProgress * 0.8);

    // Gentle float
    model.position.y = Math.sin(t * 0.8) * 0.003;

    renderer.render(scene, camera);
  }
  render();

  // --- Resize ---
  new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }).observe(container);

  // --- ScrollTrigger setup ---
  function setupScroll() {
    const section = document.getElementById('study-anywhere');
    const cards = gsap.utils.toArray('.scroll-card');

    // Pin iPhone while scrolling through cards
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: '#iphone-pin-wrapper',
      pinSpacing: false,
    });

    // Track scroll progress → drives phone rotation directly
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      onUpdate: (self) => {
        scrollProgress = self.progress;
      }
    });

    // Cards fade in
    cards.forEach((card, i) => {
      if (i === 0) return;
      gsap.to(card, {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 55%',
          scrub: 0,
        }
      });
    });
  }
}
