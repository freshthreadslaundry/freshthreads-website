document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('header');

    // New: Corner Notification Pop-up elements
    const offerNotificationPopup = document.getElementById('offer-notification-popup');
    const closeNotificationButton = document.querySelector('.close-notification-button');
    const learnMoreNotificationButton = document.querySelector('.notification-btn-learn-more');
    const doNotShowNotificationAgainCheckbox = document.getElementById('do-not-show-notification-again');

    // --- Header & Navigation Toggle ---
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            header.classList.toggle('active');
        });
    }

    // --- Smooth Scrolling for Navigation Links ---
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

    // --- Corner Notification Pop-up Functionality ---

    const NOTIFICATION_SHOWN_KEY = 'freshThreadsNotificationShown';
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    function showNotificationPopup() {
        // Check if the user has opted not to see it for 7 days
        const lastShownTime = localStorage.getItem(NOTIFICATION_SHOWN_KEY);
        if (lastShownTime && (Date.now() - parseInt(lastShownTime, 10) < SEVEN_DAYS_MS)) {
            return; // Don't show if it's within 7 days
        }
        
        // Short delay before showing the notification
        setTimeout(() => {
            if (offerNotificationPopup) {
                offerNotificationPopup.classList.add('show');
            }
        }, 2500); // 2.5 second delay for a less immediate appearance
    }

    function hideNotificationPopup() {
        if (offerNotificationPopup) {
            offerNotificationPopup.classList.remove('show');
            // If checkbox is checked, set a timestamp in local storage
            if (doNotShowNotificationAgainCheckbox && doNotShowNotificationAgainCheckbox.checked) {
                localStorage.setItem(NOTIFICATION_SHOWN_KEY, Date.now().toString());
            }
        }
    }

    // Event listeners for closing the notification
    if (closeNotificationButton) {
        closeNotificationButton.addEventListener('click', hideNotificationPopup);
    }

    // Hide notification and scroll to section when "Learn More" is clicked
    if (learnMoreNotificationButton) {
        learnMoreNotificationButton.addEventListener('click', (e) => {
            // No e.preventDefault() here if you want the link to work naturally
            hideNotificationPopup();
            // The anchor link will handle scrolling. If you want a smooth scroll:
            const targetElement = document.querySelector('#refer-earn');
            if (targetElement) {
                setTimeout(() => {
                    window.scrollTo({
                        top: targetElement.offsetTop - header.offsetHeight,
                        behavior: 'smooth'
                    });
                }, 300); // Small delay to allow notification to hide
            }
        });
    }

    // Show notification on page load
    showNotificationPopup();
});