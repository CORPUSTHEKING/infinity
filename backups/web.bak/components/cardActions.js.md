export function bindCardActions(root, handlers = {}) {
  if (!root) return () => {};

  const onClick = (event) => {
    const expandButton = event.target.closest('[data-script-expand]');
    const actionButton = event.target.closest('[data-action]');
    const card = event.target.closest('[data-script-card]');

    if (!card) return;

    const itemId = card.getAttribute('data-script-id');

    if (expandButton) {
      handlers.onExpand?.(itemId, card);
      return;
    }

    if (actionButton) {
      const action = actionButton.getAttribute('data-action');
      handlers.onAction?.(action, itemId, card);
    }
  };

  root.addEventListener('click', onClick);

  return () => root.removeEventListener('click', onClick);
}
