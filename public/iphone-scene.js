// iPhone frame sequence — CSS sticky (desktop) + inline (mobile)
(() => {
  // Pick container: desktop (sticky) or mobile (inline)
  const container = document.getElementById('iphone-3d-container') || document.getElementById('iphone-3d-container-mobile');
  if (!container) return;

  const TOTAL = 48;
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 700;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.objectFit = 'contain';
  container.appendChild(canvas);

  // Also add canvas to mobile container if desktop exists
  const mobileContainer = document.getElementById('iphone-3d-container-mobile');
  if (mobileContainer && container.id !== 'iphone-3d-container-mobile') {
    const canvas2 = document.createElement('canvas');
    canvas2.width = 400;
    canvas2.height = 700;
    canvas2.style.width = '100%';
    canvas2.style.height = '100%';
    canvas2.style.objectFit = 'contain';
    mobileContainer.appendChild(canvas2);
  }

  const ctx = canvas.getContext('2d');

  // Preload + decode all frames
  const frames = [];
  let ready = false;
  let currentFrame = -1;

  Promise.all(
    Array.from({ length: TOTAL }, (_, i) => {
      const img = new Image();
      img.src = `/iphone-frames/frame-${String(i).padStart(2, '0')}.webp`;
      frames.push(img);
      return img.decode ? img.decode().then(() => img) : new Promise(r => { img.onload = () => r(img); });
    })
  ).then(() => {
    ready = true;
    draw(0);
    loop();
  });

  function draw(i) {
    i = Math.max(0, Math.min(TOTAL - 1, Math.round(i)));
    if (i === currentFrame) return;
    currentFrame = i;
    ctx.clearRect(0, 0, 400, 700);
    ctx.drawImage(frames[i], 0, 0, 400, 700);
  }

  // rAF loop — reads scroll, draws frame
  function loop() {
    if (!ready) return;
    const section = document.getElementById('study-anywhere');
    if (!section) { requestAnimationFrame(loop); return; }

    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const viewH = window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / (sectionH - viewH)));
    draw(progress * (TOTAL - 1));
    requestAnimationFrame(loop);
  }

  // Cards: IntersectionObserver fade-in
  const cards = document.querySelectorAll('.scroll-card[data-card]:not([data-card="0"])');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => {
    c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(c);
  });
})();
