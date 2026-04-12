import { loadConfig } from './loader.js';
import { handleRoute } from './router.js';
import { renderShell } from './shell.js';
import { bindSystemEvents } from './events.js';

export const ignite = async (socket) => {
    try {
        // 1. Data
        socket.config = await loadConfig();

        // 2. UI
        renderShell(socket.config);

        // 3. Events
        bindSystemEvents(socket);

        // 4. Initial Route
        handleRoute('terminal', socket.config);

    } catch (err) {
        document.body.innerHTML = `<div class="inf-critical-error">Core Fault: ${err.message}</div>`;
    }
};
