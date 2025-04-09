/**
 * TechMayank Newsletter Subscription Handler
 * Fixed version to properly handle subscription status messages
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find the subscription form on the page
    const subscribeForm = document.getElementById('mc-embedded-subscribe-form');
    
    // If the form exists on this page, set up the subscription handlers
    if (subscribeForm) {
        const subscribeButton = document.getElementById('mc-embedded-subscribe');
        const emailInput = document.getElementById('mce-EMAIL');
        const mceSuccessResponse = document.getElementById('mce-success-response');
        const mceErrorResponse = document.getElementById('mce-error-response');
        
        // Create a new status element for already subscribed message
        let alreadySubscribedMessage = document.createElement('div');
        alreadySubscribedMessage.id = 'already-subscribed-message';
        alreadySubscribedMessage.className = 'subscribe-message error-message';
        alreadySubscribedMessage.style.display = 'none';
        alreadySubscribedMessage.innerHTML = '<p>This email is already subscribed to our newsletter.</p>';
        
        // Create a new status element for general subscription messages if it doesn't exist
        let subscribeStatus = document.getElementById('subscribe-status');
        if (!subscribeStatus) {
            subscribeStatus = document.createElement('div');
            subscribeStatus.id = 'subscribe-status';
            subscribeStatus.className = 'subscribe-message';
            subscribeStatus.style.display = 'none';
            
            const statusText = document.createElement('p');
            statusText.textContent = 'Thank you for subscribing! Please check your inbox to confirm your subscription.';
            subscribeStatus.appendChild(statusText);
        }
        
        // Insert messages after the mce-responses div
        const mceResponses = document.getElementById('mce-responses');
        if (mceResponses) {
            mceResponses.parentNode.insertBefore(alreadySubscribedMessage, mceResponses.nextSibling);
            mceResponses.parentNode.insertBefore(subscribeStatus, mceResponses.nextSibling);
        } else {
            subscribeForm.appendChild(alreadySubscribedMessage);
            subscribeForm.appendChild(subscribeStatus);
        }
        
        // Form submission handling
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default to handle form submission manually
            
            const emailValue = emailInput.value.trim().toLowerCase();
            
            // Hide any previous messages
            hideAllMessages();
            
            // Check if email is valid
            if (emailInput.validity.valid) {
                // Show loading state
                showLoadingState();
                
                // Use Mailchimp's API directly instead of trying to validate emails client-side
                submitToMailchimp(emailValue);
            }
        });
        
        function hideAllMessages() {
            // Hide all possible message elements
            mceSuccessResponse.style.display = 'none';
            mceErrorResponse.style.display = 'none';
            subscribeStatus.style.display = 'none';
            alreadySubscribedMessage.style.display = 'none';
        }
        
        function showLoadingState() {
            subscribeButton.classList.add('loading');
            subscribeButton.disabled = true;
            subscribeButton.textContent = 'Subscribing...';
        }
        
        function resetButtonState() {
            subscribeButton.classList.remove('loading');
            subscribeButton.disabled = false;
            subscribeButton.textContent = 'Subscribe';
        }
        
        // Function to submit to Mailchimp
        function submitToMailchimp(email) {
            // Get form's action URL and convert it to the JSON endpoint
            const actionUrl = subscribeForm.getAttribute('action').replace('post?', 'post-json?');
            
            // Add callback parameter for JSONP
            const url = actionUrl + '&c=?';
            
            // Create form data from the form
            const formData = new FormData(subscribeForm);
            
            // Use jQuery if available for JSONP (which Mailchimp requires)
            if (window.jQuery) {
                jQuery.ajax({
                    type: 'GET',
                    url: url,
                    data: formData,
                    dataType: 'jsonp',
                    contentType: "application/json; charset=utf-8",
                    success: function(response) {
                        resetButtonState();
                        
                        // Check response from Mailchimp
                        if (response.result === 'success') {
                            // New subscriber success
                            mceSuccessResponse.style.display = 'block';
                            emailInput.value = '';
                            
                            setTimeout(function() {
                                mceSuccessResponse.style.display = 'none';
                            }, 5000);
                        } else {
                            // Handle error cases
                            if (response.msg && response.msg.toLowerCase().includes('already subscribed')) {
                                // If already subscribed message from Mailchimp
                                alreadySubscribedMessage.style.display = 'block';
                                
                                setTimeout(function() {
                                    alreadySubscribedMessage.style.display = 'none';
                                }, 5000);
                            } else {
                                // Other errors
                                mceErrorResponse.innerHTML = response.msg;
                                mceErrorResponse.style.display = 'block';
                                
                                setTimeout(function() {
                                    mceErrorResponse.style.display = 'none';
                                }, 5000);
                            }
                        }
                    },
                    error: function() {
                        // Handle AJAX errors
                        resetButtonState();
                        
                        // Generic error handling
                        mceErrorResponse.innerHTML = '<p>There was an error processing your subscription. Please try again later.</p>';
                        mceErrorResponse.style.display = 'block';
                        
                        setTimeout(function() {
                            mceErrorResponse.style.display = 'none';
                        }, 5000);
                    }
                });
            } else {
                // Fallback when jQuery is not available
                const hiddenForm = document.createElement('form');
                hiddenForm.method = 'POST';
                hiddenForm.action = subscribeForm.getAttribute('action');
                hiddenForm.style.display = 'none';
                
                // Add email field
                const emailField = document.createElement('input');
                emailField.type = 'email';
                emailField.name = 'EMAIL';
                emailField.value = email;
                hiddenForm.appendChild(emailField);
                
                // Copy any other fields from original form
                const otherFields = subscribeForm.querySelectorAll('input:not([type="email"]):not([type="submit"])');
                otherFields.forEach(field => {
                    const clone = field.cloneNode(true);
                    hiddenForm.appendChild(clone);
                });
                
                // Add form to body and submit
                document.body.appendChild(hiddenForm);
                hiddenForm.submit();
            }
        }
    }
});