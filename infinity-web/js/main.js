import { Router } from './router.js';
import { QuickRail } from '../components/quickrail.js';
import { Layout } from '../components/layout.js';
import { SearchDock } from '../components/searchdock.js';
import { Scroll } from '../components/scroll.js';

document.addEventListener('DOMContentLoaded', async () => {
    const topBarContainer = document.getElementById('topbar-container');
    const railContainer = document.getElementById('quickrail-container');
    const searchContainer = document.getElementById('searchdock-container');
    const viewPort = document.getElementById('view-port');

    // Initialize UI Components - Await Layout for the Real-time Count
    await Layout.init(topBarContainer);
    QuickRail.init(railContainer);
    SearchDock.init(searchContainer);
    Scroll.init();

    // Start Routing
    new Router(viewPort);
});
