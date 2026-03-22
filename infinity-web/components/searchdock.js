export function bindSearchDock({
  dock,
  panel,
  input,
  toggleButton,
  onChange,
  onOpen,
  onClose
} = {}) {
  if (!dock || !panel || !input || !toggleButton) {
    return {
      open() {},
      close() {},
      toggle() {},
      isOpen() {
        return false;
      }
    };
  }

  const sync = () => {
    panel.hidden = !dock.classList.contains('is-open');
  };

  const open = () => {
    dock.classList.add('is-open');
    sync();
    input.focus();
    onOpen?.();
  };

  const close = () => {
    dock.classList.remove('is-open');
    sync();
    onClose?.();
  };

  const toggle = () => {
    if (dock.classList.contains('is-open')) close();
    else open();
  };

  toggleButton.addEventListener('click', toggle);
  input.addEventListener('input', () => onChange?.(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  sync();

  return {
    open,
    close,
    toggle,
    isOpen() {
      return dock.classList.contains('is-open');
    },
    setValue(value = '') {
      input.value = value;
      onChange?.(value);
    }
  };
}
