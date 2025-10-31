document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('header');

  if (menuToggle && header) {
    menuToggle.addEventListener('click', () => {
      header.classList.toggle('active');
    });
  }

  // Smooth scrolling for on-page hash links (e.g., #services)
  document.querySelectorAll('nav a').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';

      // Same-page section links
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          const headerEl = document.querySelector('header');
          const offset = headerEl ? headerEl.offsetHeight : 0;
          window.scrollTo({
            top: targetElement.offsetTop - offset,
            behavior: 'smooth',
          });
        }
        // Close mobile menu if open
        const headerEl = document.querySelector('header');
        if (headerEl && headerEl.classList.contains('active')) {
          headerEl.classList.remove('active');
        }
      } else {
        // Non-hash links: just close the menu if it's open (e.g., navigating to prices.html)
        const headerEl = document.querySelector('header');
        if (headerEl && headerEl.classList.contains('active')) {
          headerEl.classList.remove('active');
        }
      }
    });
  });
});