// Handle Netlify form submission and success message display
const newsletterForm = document.querySelector('form[name="newsletter"]');
const formSuccess = document.getElementById('form-success');

// Check for success parameter in URL (for when returning from Netlify's success page)
function checkForSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' ||
        window.location.hash === '#success' ||
        window.location.pathname.includes('success')) {
        showSuccessMessage();
    }
}

// Function to show success message
function showSuccessMessage() {
    if (formSuccess) {
        formSuccess.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(function () {
            formSuccess.style.display = 'none';
        }, 5000);
    }
}

// Check for success on page load
checkForSuccess();

// Add form submission handling
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
        // Let Netlify handle the form submission
        // This just adds any extra client-side behavior if needed

        // If we're in development or want to test the success message:
        // e.preventDefault();
        // showSuccessMessage();
    });
}
