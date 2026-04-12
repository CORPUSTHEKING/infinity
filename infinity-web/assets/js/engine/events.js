import { handleRoute } from './router.js';

export const bindSystemEvents = (socket) => {
    // Navigation listener
    document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-key]');
        if (trigger) {
            e.preventDefault();
            handleRoute(trigger.dataset.key, socket.config);
        }
    });

    // Search Toggle listener
    document.addEventListener('click', e => {
        const fab = e.target.closest('#searchFab');
        if (fab) {
            const dock = document.getElementById('searchDock');
            if (dock) dock.classList.toggle('is-open');
        }
    });
};
