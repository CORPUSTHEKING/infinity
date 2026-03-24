import { Assistance } from '../pages/assistance.js';
import { Download } from '../pages/download.js';
import { Upload } from '../pages/upload.js';
import { IWL } from '../pages/iwl.js';
import { Platforms } from '../pages/platforms.js';

const routes = {
    '': Download,
    '#assistance': Assistance,
    '#download': Download,
    '#upload': Upload,
    '#iwl': IWL,
    '#platforms': Platforms
};

export class Router {
    constructor(viewPort) {
        this.viewPort = viewPort;
        window.addEventListener('hashchange', () => this.route());
        this.route();
    }

    async route() {
        const hash = window.location.hash;
        const PageComponent = routes[hash] || Download;
        
        this.viewPort.innerHTML = '<div class="loader">Initializing...</div>';
        this.viewPort.innerHTML = await PageComponent.render();
        
        if (PageComponent.afterRender) {
            await PageComponent.afterRender();
        }
    }
}
