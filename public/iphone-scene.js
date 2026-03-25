// iPhone frame sequence — CSS sticky + rAF (no GSAP pin)
(() => {
  const container = document.getElementById('iphone-3d-container');
  if (!container) return;

  const TOTAL = 48;
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 700;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.objectFit = 'contain';
  container.appendChild(canvas);
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

  // Scroll-driven frame update via rAF (not scroll event)
  function loop() {
    if (!ready) return;
    const section = document.getElementById('study-anywhere');
    if (!section) return requestAnimationFrame(loop);

    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const viewH = window.innerHeight;

    // progress: 0 when section top hits viewport top, 1 when section bottom hits viewport bottom
    const progress = Math.max(0, Math.min(1, -rect.top / (sectionH - viewH)));
    draw(progress * (TOTAL - 1));

    requestAnimationFrame(loop);
  }

  // Cards fade-in with IntersectionObserver (no GSAP needed)
  const cards = document.querySelectorAll('.scroll-card[data-card]:not([data-card="0"])');
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => {
    c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObs.observe(c);
  });
})();
