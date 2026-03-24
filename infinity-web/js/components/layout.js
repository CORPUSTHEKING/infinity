export function initLayout() {
    const topBar = document.getElementById('top-bar');
    let lastScrollY = window.scrollY;

    // Hide Top Bar on Scroll Down, Show on Scroll Up
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && window.scrollY > 50) {
            topBar.classList.add('hidden');
        } else {
            topBar.classList.remove('hidden');
        }
        lastScrollY = window.scrollY;
    });
}
