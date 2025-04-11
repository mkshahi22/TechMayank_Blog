/**
 * TechMayank Newsletter Subscription Handler - Netlify Version
 * Simplified for Netlify form handling
 */
document.addEventListener('DOMContentLoaded', function () {
    // Find the subscription form on the page
    const subscribeForm = document.getElementById('newsletter-form');

    // If the form exists on this page, set up the subscription handlers
    if (subscribeForm) {
        const subscribeButton = document.getElementById('subscribe');
        const emailInput = document.getElementById('email');
        const subscribeStatus = document.getElementById('subscribe-status');

        // Create status elements if they don't exist
        if (!subscribeStatus) {
            const statusDiv = document.createElement('div');
            statusDiv.id = 'subscribe-status';
            statusDiv.className = 'subscribe-message';
            statusDiv.style.display = 'none';

            const statusText = document.createElement('p');
            statusText.textContent = 'Thank you for subscribing! Please check your inbox for updates.';
            statusDiv.appendChild(statusText);

            // Insert after the form
            subscribeForm.parentNode.insertBefore(statusDiv, subscribeForm.nextSibling);
        }

        // Form submission handling
        subscribeForm.addEventListener('submit', function (e) {
            // We don't prevent default - let Netlify handle the submission
            // But we can show a loading state
            showLoadingState();

            // Check if we're returning from a successful submission via URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('success') === 'true') {
                showSuccessMessage();
            }
        });

        // Check URL parameters on page load for success message
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            showSuccessMessage();
        }

        function showLoadingState() {
            subscribeButton.classList.add('loading');
            subscribeButton.disabled = true;
            subscribeButton.textContent = 'Subscribing...';

            // Reset button state after form is likely submitted
            // This is just for UX since Netlify will navigate away from page
            setTimeout(function () {
                resetButtonState();
            }, 3000);
        }

        function resetButtonState() {
            subscribeButton.classList.remove('loading');
            subscribeButton.disabled = false;
            subscribeButton.textContent = 'Subscribe';
        }

        function showSuccessMessage() {
            if (subscribeStatus) {
                subscribeStatus.style.display = 'block';

                // Hide after 5 seconds
                setTimeout(function () {
                    subscribeStatus.style.display = 'none';
                }, 5000);
            }
        }

        // Handle form errors
        const formErrors = document.querySelectorAll('.netlify-error-message');
        if (formErrors.length > 0) {
            formErrors.forEach(error => {
                error.style.color = '#dc3545';
                error.style.fontSize = '14px';
                error.style.marginTop = '5px';
                error.style.display = 'block';
            });
        }
    }

    // For success page detection
    if (window.location.pathname.includes('success') ||
        window.location.pathname.includes('thank-you')) {
        // We're on a success page!
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.style.display = 'block';
        }
    }
});