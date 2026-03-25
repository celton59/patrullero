// iPhone 3D frame sequence — Apple-style scroll animation
// 48 pre-rendered frames, ~416KB total. Zero WebGL at runtime.

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const container = document.getElementById('iphone-3d-container');
if (container) {
  const TOTAL_FRAMES = 48;
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 700;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.objectFit = 'contain';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Preload all frames
  const frames = [];
  let loadedCount = 0;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = `/iphone-frames/frame-${String(i).padStart(2, '0')}.webp`;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) {
        // All loaded — draw first frame and setup scroll
        drawFrame(0);
        setupScroll();
      }
    };
    frames.push(img);
  }

  function drawFrame(index) {
    const i = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[i], 0, 0, canvas.width, canvas.height);
  }

  function setupScroll() {
    const section = document.getElementById('study-anywhere');
    const cards = gsap.utils.toArray('.scroll-card');

    // Pin iPhone while scrolling
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: '#iphone-pin-wrapper',
      pinSpacing: false,
    });

    // Frame sequence driven by scroll
    const frameObj = { frame: 0 };
    gsap.to(frameObj, {
      frame: TOTAL_FRAMES - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
        onUpdate: () => drawFrame(frameObj.frame),
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
