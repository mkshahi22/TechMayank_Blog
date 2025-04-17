// Enhanced social sharing script with fixes
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

        // Fix: Replace the existing href attributes with dynamically generated ones

        // Twitter/X share
        const twitterLink = shareContainer.querySelector('.twitter');
        if (twitterLink) {
            // Update href directly for non-JS fallback
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(metadata.url)}&text=${encodeURIComponent(metadata.title)}`;
            twitterLink.setAttribute('href', twitterUrl);

            twitterLink.addEventListener('click', function (e) {
                e.preventDefault();
                window.open(twitterUrl, '_blank', 'width=550,height=420');
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
            });
        }

        // Handle copy link button
        const copyLinkButton = shareContainer.querySelector('.copy-link');
        if (copyLinkButton) {
            copyLinkButton.addEventListener('click', function (e) {
                e.preventDefault();
                navigator.clipboard.writeText(metadata.url).then(() => {
                    // Visual feedback
                    const originalIcon = copyLinkButton.querySelector('i');
                    const originalClass = originalIcon.className;
                    originalIcon.className = 'fas fa-check';
                    copyLinkButton.classList.add('copied');

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

                    // Revert back after 2 seconds
                    setTimeout(() => {
                        originalIcon.className = originalClass;
                        copyLinkButton.classList.remove('copied');
                        if (copyLinkButton.contains(feedbackMsg)) {
                            copyLinkButton.removeChild(feedbackMsg);
                        }
                    }, 2000);

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

        // Handle text-to-speech button
        const ttsButton = shareContainer.querySelector('.text-to-speech');
        if (ttsButton) {
            let isSpeaking = false;
            let utterance = null;

            ttsButton.addEventListener('click', function (e) {
                e.preventDefault();

                // Check if browser supports speech synthesis
                if ('speechSynthesis' in window) {
                    if (isSpeaking) {
                        // Stop speaking
                        window.speechSynthesis.cancel();
                        ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                        ttsButton.setAttribute('aria-label', 'Read article aloud');
                        ttsButton.classList.remove('active');
                        isSpeaking = false;
                    } else {
                        // Show loading state
                        ttsButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                        // Get article content
                        const articleContent = document.querySelector('article') ||
                            document.querySelector('.post-content') ||
                            document.querySelector('.blog-content');

                        if (articleContent) {
                            // First, get the title
                            let textToRead = metadata.title + ". ";

                            // Then get paragraphs and headings
                            const contentElements = articleContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
                            contentElements.forEach(element => {
                                // Skip elements that might be in navigation or sidebars
                                if (!isElementInFooterOrHeader(element)) {
                                    textToRead += element.textContent + ". ";
                                }
                            });

                            // Create utterance
                            utterance = new SpeechSynthesisUtterance(textToRead);

                            // Set language (optional - can be dynamic based on page lang)
                            utterance.lang = document.documentElement.lang || 'en-US';

                            // Set a reasonable voice if available
                            try {
                                const voices = window.speechSynthesis.getVoices();
                                if (voices.length > 0) {
                                    // Try to find a good voice
                                    const preferredVoice = voices.find(voice =>
                                        voice.lang === (document.documentElement.lang || 'en-US') &&
                                        !voice.name.includes('Google'));

                                    if (preferredVoice) {
                                        utterance.voice = preferredVoice;
                                    }
                                }
                            } catch (e) {
                                console.log("Error setting voice:", e);
                            }

                            // Event handlers
                            utterance.onstart = () => {
                                ttsButton.innerHTML = '<i class="fas fa-pause"></i>';
                                ttsButton.setAttribute('aria-label', 'Stop reading');
                                ttsButton.classList.add('active');
                                isSpeaking = true;
                            };

                            utterance.onend = () => {
                                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                                ttsButton.setAttribute('aria-label', 'Read article aloud');
                                ttsButton.classList.remove('active');
                                isSpeaking = false;
                            };

                            utterance.onerror = () => {
                                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                                ttsButton.setAttribute('aria-label', 'Read article aloud');
                                ttsButton.classList.remove('active');
                                isSpeaking = false;
                                console.error('Speech synthesis error');
                            };

                            // Start speaking
                            window.speechSynthesis.cancel(); // Cancel any ongoing speech
                            window.speechSynthesis.speak(utterance);
                        } else {
                            ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                            alert("Sorry, couldn't find article content to read.");
                        }
                    }
                } else {
                    alert("Sorry, your browser doesn't support text-to-speech functionality.");
                }
            });

            // Helper function to check if element is likely in footer or header
            function isElementInFooterOrHeader(element) {
                let parent = element.parentElement;
                while (parent) {
                    if (
                        parent.tagName === 'FOOTER' ||
                        parent.tagName === 'HEADER' ||
                        parent.id.toLowerCase().includes('footer') ||
                        parent.id.toLowerCase().includes('header') ||
                        parent.className.toLowerCase().includes('footer') ||
                        parent.className.toLowerCase().includes('header') ||
                        parent.className.toLowerCase().includes('sidebar')
                    ) {
                        return true;
                    }
                    parent = parent.parentElement;
                }
                return false;
            }
        }
    };

    // Calculate and update read time
    const updateReadTime = () => {
        const readTimeSpan = document.querySelector('.post-read-time');
        if (!readTimeSpan) return;

        // Get all article content
        const articleContent = document.querySelector('article') ||
            document.querySelector('.post-content') ||
            document.querySelector('.blog-content') ||
            document.body;

        // Get just the article text, avoiding navigation, sidebars, etc.
        let text = '';
        const contentElements = articleContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        contentElements.forEach(element => {
            // Try to avoid counting text in menus, headers, footers
            const parentClasses = element.parentElement.className.toLowerCase();
            if (!parentClasses.includes('nav') &&
                !parentClasses.includes('menu') &&
                !parentClasses.includes('footer') &&
                !parentClasses.includes('header') &&
                !parentClasses.includes('sidebar')) {
                text += element.textContent + ' ';
            }
        });

        // If we couldn't find much content, fall back to the main content
        if (text.length < 100) {
            text = articleContent.textContent || articleContent.innerText;
        }

        // Calculate read time (average reading speed: 200 words per minute)
        const wordCount = text.trim().split(/\s+/).length;
        const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

        // Update read time display
        const timeIcon = readTimeSpan.querySelector('i') ? readTimeSpan.querySelector('i').outerHTML : '';
        readTimeSpan.innerHTML = `${timeIcon} ${readTimeMinutes} min read`;
    };

    // Initialize all functionality
    setupShareLinks();
    updateReadTime();
});