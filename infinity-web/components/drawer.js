export function bindDrawerToggle({ drawer, button } = {}) {
  if (!drawer || !button) {
    return {
      open() {},
      close() {},
      toggle() {},
      isOpen() {
        return false;
      }
    };
  }

  const open = () => {
    drawer.hidden = false;
  };

  const close = () => {
    drawer.hidden = true;
  };

  const toggle = () => {
    drawer.hidden = !drawer.hidden;
  };

  button.addEventListener('click', toggle);

  return {
    open,
    close,
    toggle,
    isOpen() {
      return !drawer.hidden;
    }
  };
}
