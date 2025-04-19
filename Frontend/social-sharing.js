// social-sharing.js - Handles social sharing functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get blog metadata more reliably
    const getBlogMetadata = () => {
        return {
            title: document.title || document.querySelector('meta[property="og:title"]')?.content || '',
            description: document.querySelector('meta[name="description"]')?.content ||
                document.querySelector('meta[property="og:description"]')?.content || '',
            siteName: document.querySelector('meta[property="og:site_name"]')?.content || 'TechMayank',
            url: window.location.href,
            image: document.querySelector('meta[property="og:image"]')?.content ||
                document.querySelector('article img')?.src || ''
        };
    };

    // Setup share links
    const setupShareLinks = () => {
        const metadata = getBlogMetadata();
        const shareContainer = document.querySelector('.post-share');

        if (!shareContainer) return;

        // Twitter/X share
        const twitterLink = shareContainer.querySelector('.twitter');
        if (twitterLink) {
            // Update href directly for non-JS fallback
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(metadata.url)}&text=${encodeURIComponent(metadata.title)}`;
            twitterLink.setAttribute('href', twitterUrl);

            twitterLink.addEventListener('click', function (e) {
                e.preventDefault();
                window.open(twitterUrl, '_blank', 'width=550,height=420');

                // Visual feedback for share action
                showShareFeedback(twitterLink, 'Shared on Twitter');
            });
        }

        // Facebook share
        const facebookLink = shareContainer.querySelector('.facebook');
        if (facebookLink) {
            // Update href directly for non-JS fallback
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(metadata.url)}`;
            facebookLink.setAttribute('href', facebookUrl);

            facebookLink.addEventListener('click', function (e) {
                e.preventDefault();
                window.open(facebookUrl, '_blank', 'width=550,height=420');

                // Visual feedback for share action
                showShareFeedback(facebookLink, 'Shared on Facebook');
            });
        }

        // LinkedIn share
        const linkedinLink = shareContainer.querySelector('.linkedin');
        if (linkedinLink) {
            // Update href directly for non-JS fallback
            const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(metadata.url)}&title=${encodeURIComponent(metadata.title)}&summary=${encodeURIComponent(metadata.description)}&source=${encodeURIComponent(metadata.siteName)}`;
            linkedinLink.setAttribute('href', linkedinUrl);

            linkedinLink.addEventListener('click', function (e) {
                e.preventDefault();
                window.open(linkedinUrl, '_blank', 'width=550,height=420');

                // Visual feedback for share action
                showShareFeedback(linkedinLink, 'Shared on LinkedIn');
            });
        }

        // Handle copy link button
        const copyLinkButton = shareContainer.querySelector('.copy-link');
        if (copyLinkButton) {
            copyLinkButton.addEventListener('click', function (e) {
                e.preventDefault();

                // Check if button is in cooldown state
                if (copyLinkButton.classList.contains('cooldown')) {
                    return;
                }

                navigator.clipboard.writeText(metadata.url).then(() => {
                    // Visual feedback
                    const originalIcon = copyLinkButton.querySelector('i');
                    const originalClass = originalIcon.className;
                    originalIcon.className = 'fas fa-check';
                    copyLinkButton.classList.add('copied');
                    copyLinkButton.classList.add('cooldown'); // Add cooldown class

                    // Create and append success message
                    const feedbackMsg = document.createElement('div');
                    feedbackMsg.className = 'copy-feedback';
                    feedbackMsg.textContent = 'Link copied!';
                    feedbackMsg.style.position = 'absolute';
                    feedbackMsg.style.backgroundColor = '#4CAF50';
                    feedbackMsg.style.color = 'white';
                    feedbackMsg.style.padding = '5px 10px';
                    feedbackMsg.style.borderRadius = '4px';
                    feedbackMsg.style.fontSize = '14px';
                    feedbackMsg.style.top = '100%';
                    feedbackMsg.style.left = '50%';
                    feedbackMsg.style.transform = 'translateX(-50%)';
                    feedbackMsg.style.zIndex = '100';
                    feedbackMsg.style.marginTop = '5px';
                    feedbackMsg.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                    copyLinkButton.style.position = 'relative';
                    copyLinkButton.appendChild(feedbackMsg);

                    // Revert back after 2 seconds for visual feedback
                    setTimeout(() => {
                        originalIcon.className = originalClass;
                        copyLinkButton.classList.remove('copied');
                        if (copyLinkButton.contains(feedbackMsg)) {
                            copyLinkButton.removeChild(feedbackMsg);
                        }
                    }, 2000);

                    // Remove cooldown after 20 seconds so button can be used again
                    setTimeout(() => {
                        copyLinkButton.classList.remove('cooldown');
                    }, 20000);

                    // Announce to screen readers
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'polite');
                    announcement.className = 'sr-only';
                    announcement.textContent = 'Link copied to clipboard';
                    document.body.appendChild(announcement);

                    setTimeout(() => {
                        document.body.removeChild(announcement);
                    }, 3000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    // Show error message if clipboard fails
                    alert('Failed to copy the link. Please try again.');
                });
            });
        }

        // Set up text-to-speech button by using the imported function
        if (window.readingModule && window.readingModule.setupTextToSpeech) {
            window.readingModule.setupTextToSpeech(shareContainer);
        } else {
            console.warn('Reading module not loaded. Text-to-speech functionality will not be available.');
        }
    };

    // Helper function to show share feedback
    const showShareFeedback = (element, message) => {
        // Add a temporary class for styling
        element.classList.add('share-active');

        // Create feedback tooltip
        const feedbackTooltip = document.createElement('div');
        feedbackTooltip.className = 'share-feedback';
        feedbackTooltip.textContent = message;
        feedbackTooltip.style.position = 'absolute';
        feedbackTooltip.style.backgroundColor = '#3B5998';
        feedbackTooltip.style.color = 'white';
        feedbackTooltip.style.padding = '5px 10px';
        feedbackTooltip.style.borderRadius = '4px';
        feedbackTooltip.style.fontSize = '14px';
        feedbackTooltip.style.top = '100%';
        feedbackTooltip.style.left = '50%';
        feedbackTooltip.style.transform = 'translateX(-50%)';
        feedbackTooltip.style.zIndex = '100';
        feedbackTooltip.style.marginTop = '5px';
        feedbackTooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

        // Make sure the element has position relative
        element.style.position = 'relative';
        element.appendChild(feedbackTooltip);

        // Remove feedback after 2 seconds
        setTimeout(() => {
            element.classList.remove('share-active');
            if (element.contains(feedbackTooltip)) {
                element.removeChild(feedbackTooltip);
            }
        }, 2000);
    };

    // Initialize social sharing functionality
    setupShareLinks();

    // Add event listener for dynamic content changes (if you use AJAX)
    document.addEventListener('contentUpdated', function () {
        setupShareLinks();
    });
});