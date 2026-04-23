export function bindScrollChrome({ shell, threshold = 18, onChange } = {}) {
  const update = () => {
    const scrolled = (window.scrollY || 0) > threshold;
    if (shell) shell.classList.toggle('is-scrolled', scrolled);
    onChange?.(scrolled);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  return () => window.removeEventListener('scroll', update);
}

export function bindHeroParallax(root, options = {}) {
  const hero = root?.querySelector?.('[data-hero-parallax]');
  if (!hero) {
    return () => {};
  }

  const layers = [
    hero.querySelector('.inf-hero-layer-back'),
    hero.querySelector('.inf-hero-layer-mid'),
    hero.querySelector('.inf-hero-layer-front')
  ].filter(Boolean);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || layers.length === 0) {
    return () => {};
  }

  const amplitudes = options.amplitudes || [140, 80, 36];
  const speeds = options.speeds || [0.18, 0.26, 0.36];
  const scrollWeights = options.scrollWeights || [0.030, 0.055, 0.085];
  const yWeights = options.yWeights || [8, 5, 3];

  let rafId = 0;
  let active = true;

  const frame = (now) => {
    if (!active) return;

    const t = now * 0.001;
    const scrollY = window.scrollY || 0;

    layers.forEach((layer, i) => {
      const x = Math.sin(t * speeds[i]) * amplitudes[i] - scrollY * scrollWeights[i];
      const y = Math.cos(t * (speeds[i] * 0.85)) * yWeights[i];
      layer.style.backgroundPosition = `${x}px calc(50% + ${y}px)`;
    });

    rafId = requestAnimationFrame(frame);
  };

  const start = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  };

  const stop = () => {
    cancelAnimationFrame(rafId);
  };

  const onVisibilityChange = () => {
    if (document.hidden) stop();
    else start();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  start();

  return () => {
    active = false;
    stop();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
