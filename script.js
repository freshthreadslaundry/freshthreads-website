document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('header');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            header.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) { // Ensure it's an internal anchor link
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - header.offsetHeight, // Adjust for fixed header
                        behavior: 'smooth'
                    });
                }
            }

            // Close mobile menu after clicking a link
            if (header.classList.contains('active')) {
                header.classList.remove('active');
            }
        });
    });
});