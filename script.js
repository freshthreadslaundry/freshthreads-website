document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('header');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            header.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    
// Enhanced nav link handling: smooth-scroll only for on-page hashes
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href') || '';
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(href);
            const header = document.querySelector('header');
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - (header ? header.offsetHeight : 0),
                    behavior: 'smooth'
                });
            }
            const headerEl = document.querySelector('header');
            if (headerEl && headerEl.classList.contains('active')) {
                headerEl.classList.remove('active');
            }
        }
    });
});
