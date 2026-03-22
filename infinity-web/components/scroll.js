export function bindScrollChrome({ topbar, floatingLogo, shell, threshold = 28 } = {}) {
  const update = () => {
    const currentY = window.scrollY || 0;
    const hideTop = currentY > threshold;

    if (topbar) topbar.classList.toggle('is-hidden', hideTop);
    if (floatingLogo) floatingLogo.hidden = !hideTop;
    if (shell) shell.classList.toggle('is-scrolled', hideTop);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  return () => {
    window.removeEventListener('scroll', update);
  };
}
