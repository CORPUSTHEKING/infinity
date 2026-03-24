export const Scroll = {
    init: () => {
        const topBar = document.getElementById('topbar-container');
        
        window.addEventListener('scroll', () => {
            // Apply glass morphism effect on scroll for high-res displays
            if (window.scrollY > 60) {
                topBar.style.backdropFilter = "blur(20px)";
                topBar.style.background = "rgba(5, 5, 5, 0.85)";
                topBar.style.borderBottom = "1px solid rgba(0, 255, 204, 0.2)";
            } else {
                topBar.style.backdropFilter = "none";
                topBar.style.background = "transparent";
                topBar.style.borderBottom = "1px solid transparent";
            }
        });
    }
};
