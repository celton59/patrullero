import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const container = document.getElementById('iphone-3d-container');
if (container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.001, 10);
  camera.position.set(0, 0, 0.45);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Environment map
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(2, 3, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x2159E2, 0.6);
  fill.position.set(-3, 1, -2);
  scene.add(fill);

  // State that GSAP tweens
  const phoneState = { rotY: -0.35, rotX: 0.14, posY: 0 };

  // Load model
  let model = null;
  const loader = new GLTFLoader();
  loader.load('/iphone-17-pro.glb', (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    model.position.sub(box.getCenter(new THREE.Vector3()));
    model.rotation.x = phoneState.rotX;
    model.rotation.y = phoneState.rotY;
    scene.add(model);
    initScrollAnimation();
  });

  // Render loop
  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (model) {
      model.rotation.y = phoneState.rotY;
      model.rotation.x = phoneState.rotX;
      model.position.y = phoneState.posY + Math.sin(t * 0.8) * 0.003;
    }
    renderer.render(scene, camera);
  })();

  // Resize
  new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }).observe(container);

  // GSAP ScrollTrigger
  function initScrollAnimation() {
    const section = document.getElementById('study-anywhere');
    const cards = gsap.utils.toArray('.scroll-card');

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: '#iphone-pin-wrapper',
      pinSpacing: false,
    });

    gsap.to(phoneState, {
      rotY: Math.PI * 2 - 0.35,
      rotX: 0.0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      }
    });

    cards.forEach((card, i) => {
      if (i === 0) return;
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
        }
      });
    });
  }
}
