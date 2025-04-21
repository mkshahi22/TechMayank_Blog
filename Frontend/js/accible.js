// Enhanced social sharing script with improved reading time and customizable reading functionality
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

    // Reading preferences configuration (new)
    let readingPreferences = {
        speed: 1, // 0.8 = slower, 1 = normal, 1.25 = faster
        voice: null, // Will be set dynamically
        pitch: 1, // 0.5 to 2
        volume: 1, // 0 to 1
        highlightText: true // Whether to highlight text while reading
    };

    // Load preferences from localStorage if available
    try {
        const savedPrefs = localStorage.getItem('readingPreferences');
        if (savedPrefs) {
            readingPreferences = { ...readingPreferences, ...JSON.parse(savedPrefs) };
        }
    } catch (e) {
        console.warn('Could not load saved reading preferences:', e);
    }

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

        // Handle text-to-speech button with enhanced reading options
        setupTextToSpeech(shareContainer);
    };

    // New function to handle text-to-speech with customization
    function setupTextToSpeech(shareContainer) {
        const ttsButton = shareContainer.querySelector('.text-to-speech');
        if (!ttsButton) return;

        let isSpeaking = false;
        let utterance = null;
        let currentParagraphIndex = 0;
        let paragraphElements = [];
        let activeHighlight = null;

        // Create a settings menu for reading preferences
        const settingsButton = document.createElement('button');
        settingsButton.className = 'reading-settings-btn';
        settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
        settingsButton.setAttribute('aria-label', 'Reading settings');
        settingsButton.style.marginLeft = '8px';
        settingsButton.style.background = 'transparent';
        settingsButton.style.border = 'none';
        settingsButton.style.cursor = 'pointer';
        settingsButton.style.fontSize = ttsButton.style.fontSize || 'inherit';
        settingsButton.style.padding = '5px';
        ttsButton.parentNode.insertBefore(settingsButton, ttsButton.nextSibling);

        // Create settings panel (fixed with proper visibility control)
        const settingsPanel = createSettingsPanel();
        document.body.appendChild(settingsPanel);

        // Display settings panel when clicking the settings button
        settingsButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Stop event from bubbling up

            // Toggle the settings panel
            if (settingsPanel.style.display === 'block') {
                settingsPanel.style.display = 'none';
            } else {
                // Position the panel near the button
                const rect = settingsButton.getBoundingClientRect();
                settingsPanel.style.top = (rect.bottom + window.scrollY) + 'px';
                settingsPanel.style.left = (rect.left + window.scrollX - 100) + 'px'; // Offset to center
                settingsPanel.style.display = 'block';

                // Debug message to confirm panel is being displayed
                console.log('Settings panel should be visible at:', {
                    top: settingsPanel.style.top,
                    left: settingsPanel.style.left,
                    display: settingsPanel.style.display
                });
            }
        });

        // Close settings when clicking outside
        document.addEventListener('click', function (e) {
            if (e.target !== settingsButton &&
                !settingsPanel.contains(e.target) &&
                settingsPanel.style.display === 'block') {
                settingsPanel.style.display = 'none';
            }
        });

        // Handle text-to-speech functionality
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

                    // Remove any active highlights
                    removeHighlights();
                } else {
                    // Show loading state
                    ttsButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                    // Get article content
                    const articleContent = document.querySelector('article') ||
                        document.querySelector('.post-content') ||
                        document.querySelector('.blog-content');

                    if (articleContent) {
                        startReading(articleContent);
                    } else {
                        ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                        alert("Sorry, couldn't find article content to read.");
                    }
                }
            } else {
                alert("Sorry, your browser doesn't support text-to-speech functionality.");
            }
        });

        // Function to start the reading process
        function startReading(articleContent) {
            // First, collect all paragraphs and headings
            paragraphElements = [];
            const contentElements = articleContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');

            contentElements.forEach(element => {
                if (!isElementInFooterOrHeader(element) && element.textContent.trim().length > 0) {
                    paragraphElements.push(element);
                }
            });

            if (paragraphElements.length === 0) {
                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                alert("Sorry, couldn't find any readable content.");
                return;
            }

            // Start with the first paragraph
            currentParagraphIndex = 0;
            readCurrentParagraph();
        }

        // Function to read the current paragraph
        function readCurrentParagraph() {
            if (currentParagraphIndex >= paragraphElements.length) {
                // End of article
                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                ttsButton.setAttribute('aria-label', 'Read article aloud');
                ttsButton.classList.remove('active');
                isSpeaking = false;
                removeHighlights();
                return;
            }

            const paragraph = paragraphElements[currentParagraphIndex];

            // Highlight current paragraph if enabled
            if (readingPreferences.highlightText) {
                removeHighlights(); // Remove any previous highlights
                highlightElement(paragraph);
            }

            // Create new utterance for this paragraph
            utterance = new SpeechSynthesisUtterance(paragraph.textContent);

            // Apply user preferences
            utterance.rate = readingPreferences.speed;
            utterance.pitch = readingPreferences.pitch;
            utterance.volume = readingPreferences.volume;

            // Set language (optional - can be dynamic based on page lang)
            utterance.lang = document.documentElement.lang || 'en-US';

            // Use selected voice if available
            if (readingPreferences.voice) {
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(v => v.name === readingPreferences.voice);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
            }

            // Set up event handlers
            utterance.onstart = () => {
                ttsButton.innerHTML = '<i class="fas fa-pause"></i>';
                ttsButton.setAttribute('aria-label', 'Stop reading');
                ttsButton.classList.add('active');
                isSpeaking = true;

                // Scroll element into view if it's not already visible
                if (readingPreferences.highlightText) {
                    paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };

            utterance.onend = () => {
                // Move to next paragraph
                currentParagraphIndex++;
                readCurrentParagraph();
            };

            utterance.onerror = () => {
                console.error('Speech synthesis error');
                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                ttsButton.setAttribute('aria-label', 'Read article aloud');
                ttsButton.classList.remove('active');
                isSpeaking = false;
                removeHighlights();
            };

            // Start speaking
            try {
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.error('Speech synthesis error:', e);
                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                alert("An error occurred while trying to read the content.");
            }
        }

        // Utility functions for text-to-speech
        function highlightElement(element) {
            // Save original styling
            const originalBackground = element.style.backgroundColor;
            const originalPadding = element.style.padding;
            const originalBorder = element.style.border;

            // Apply highlight
            element.style.backgroundColor = '#ffefd5';
            element.style.padding = '8px';
            element.style.border = '1px solid #ffcc80';
            element.style.borderRadius = '4px';
            element.style.transition = 'all 0.3s ease';

            // Store reference to remove later
            activeHighlight = {
                element,
                originalStyles: {
                    backgroundColor: originalBackground,
                    padding: originalPadding,
                    border: originalBorder
                }
            };
        }

        function removeHighlights() {
            if (activeHighlight) {
                // Restore original styling
                const { element, originalStyles } = activeHighlight;
                element.style.backgroundColor = originalStyles.backgroundColor;
                element.style.padding = originalStyles.padding;
                element.style.border = originalStyles.border;
                activeHighlight = null;
            }
        }

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

        // Create settings panel UI
        function createSettingsPanel() {
            const panel = document.createElement('div');
            panel.className = 'reading-settings-panel';
            panel.style.display = 'none';
            panel.style.position = 'absolute';
            panel.style.zIndex = '9999'; // Ensure it's above other elements
            panel.style.backgroundColor = 'white';
            panel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            panel.style.padding = '15px';
            panel.style.borderRadius = '5px';
            panel.style.width = '250px';
            panel.style.maxHeight = '80vh';
            panel.style.overflowY = 'auto';
            panel.style.border = '1px solid #ccc';

            // Create a header
            const header = document.createElement('h3');
            header.textContent = 'Reading Settings';
            header.style.margin = '0 0 15px 0';
            header.style.fontSize = '16px';
            panel.appendChild(header);

            // Add speed control
            addRangeControl(panel, 'Reading Speed', 'speed', 0.5, 2, 0.25, readingPreferences.speed);

            // Add pitch control
            addRangeControl(panel, 'Voice Pitch', 'pitch', 0.5, 2, 0.1, readingPreferences.pitch);

            // Add volume control
            addRangeControl(panel, 'Volume', 'volume', 0.1, 1, 0.1, readingPreferences.volume);

            // Add voice selection
            const voiceContainer = document.createElement('div');
            voiceContainer.style.marginBottom = '15px';

            const voiceLabel = document.createElement('label');
            voiceLabel.textContent = 'Voice:';
            voiceLabel.style.display = 'block';
            voiceLabel.style.marginBottom = '5px';
            voiceContainer.appendChild(voiceLabel);

            const voiceSelect = document.createElement('select');
            voiceSelect.id = 'voice-select';
            voiceSelect.style.width = '100%';
            voiceSelect.style.padding = '5px';
            voiceContainer.appendChild(voiceSelect);

            // Add event listener for voice selection change
            voiceSelect.addEventListener('change', function () {
                readingPreferences.voice = this.value;
                savePreferences();
            });

            // Populate voices when they're available
            function populateVoiceList() {
                const voices = window.speechSynthesis.getVoices();
                voiceSelect.innerHTML = ''; // Clear existing options

                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.textContent = 'Default voice';
                defaultOption.value = '';
                voiceSelect.appendChild(defaultOption);

                // Add available voices
                voices.forEach(voice => {
                    const option = document.createElement('option');
                    option.textContent = `${voice.name} (${voice.lang})`;
                    option.value = voice.name;
                    if (readingPreferences.voice === voice.name) {
                        option.selected = true;
                    }
                    voiceSelect.appendChild(option);
                });
            }

            // Initialize voice list
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = populateVoiceList;
            }

            // Try to load voices immediately and also after a short delay
            populateVoiceList();
            setTimeout(populateVoiceList, 100);

            panel.appendChild(voiceContainer);

            // Add highlight toggle
            const highlightContainer = document.createElement('div');
            highlightContainer.style.marginBottom = '15px';

            const highlightCheckbox = document.createElement('input');
            highlightCheckbox.type = 'checkbox';
            highlightCheckbox.id = 'highlight-toggle';
            highlightCheckbox.checked = readingPreferences.highlightText;
            highlightCheckbox.style.marginRight = '8px';

            const highlightLabel = document.createElement('label');
            highlightLabel.htmlFor = 'highlight-toggle';
            highlightLabel.textContent = 'Highlight text while reading';

            highlightContainer.appendChild(highlightCheckbox);
            highlightContainer.appendChild(highlightLabel);

            highlightCheckbox.addEventListener('change', function () {
                readingPreferences.highlightText = this.checked;
                savePreferences();

                // If currently reading, apply or remove highlight
                if (isSpeaking && currentParagraphIndex < paragraphElements.length) {
                    if (this.checked) {
                        highlightElement(paragraphElements[currentParagraphIndex]);
                    } else {
                        removeHighlights();
                    }
                }
            });

            panel.appendChild(highlightContainer);

            // Add reset button
            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset to Defaults';
            resetButton.style.padding = '5px 10px';
            resetButton.style.backgroundColor = '#f0f0f0';
            resetButton.style.border = '1px solid #ccc';
            resetButton.style.borderRadius = '3px';
            resetButton.style.cursor = 'pointer';
            resetButton.style.marginTop = '10px';
            resetButton.style.width = '100%';

            resetButton.addEventListener('click', function () {
                readingPreferences = {
                    speed: 1,
                    voice: null,
                    pitch: 1,
                    volume: 1,
                    highlightText: true
                };

                // Update UI
                document.getElementById('speed-range').value = 1;
                document.getElementById('speed-value').textContent = '1';
                document.getElementById('pitch-range').value = 1;
                document.getElementById('pitch-value').textContent = '1';
                document.getElementById('volume-range').value = 1;
                document.getElementById('volume-value').textContent = '1';
                document.getElementById('voice-select').value = '';
                document.getElementById('highlight-toggle').checked = true;

                savePreferences();
            });

            panel.appendChild(resetButton);

            // Add close button for mobile users
            const closeButton = document.createElement('button');
            closeButton.textContent = '✕ Close';
            closeButton.style.padding = '5px 10px';
            closeButton.style.backgroundColor = '#e0e0e0';
            closeButton.style.border = '1px solid #ccc';
            closeButton.style.borderRadius = '3px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.marginTop = '10px';
            closeButton.style.width = '100%';

            closeButton.addEventListener('click', function () {
                panel.style.display = 'none';
            });

            panel.appendChild(closeButton);

            return panel;
        }

        // Helper to create range controls
        function addRangeControl(parent, labelText, id, min, max, step, value) {
            const container = document.createElement('div');
            container.style.marginBottom = '15px';

            const label = document.createElement('label');
            label.textContent = labelText + ': ';
            label.style.display = 'block';
            label.style.marginBottom = '5px';

            const valueSpan = document.createElement('span');
            valueSpan.id = `${id}-value`;
            valueSpan.textContent = value;
            label.appendChild(valueSpan);

            container.appendChild(label);

            const range = document.createElement('input');
            range.type = 'range';
            range.id = `${id}-range`;
            range.min = min;
            range.max = max;
            range.step = step;
            range.value = value;
            range.style.width = '100%';

            range.addEventListener('input', function () {
                const newValue = parseFloat(this.value);
                valueSpan.textContent = newValue;
                readingPreferences[id] = newValue;

                // If currently speaking, update the current utterance
                if (isSpeaking && utterance) {
                    utterance[id] = newValue;

                    // For rate changes, we need to restart speech synthesis
                    if (id === 'speed') {
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(utterance);
                    }
                }

                savePreferences();
            });

            container.appendChild(range);
            parent.appendChild(container);
        }

        // Save preferences to localStorage
        function savePreferences() {
            try {
                localStorage.setItem('readingPreferences', JSON.stringify(readingPreferences));
            } catch (e) {
                console.warn('Could not save reading preferences:', e);
            }
        }
    }

    // ENHANCED READING TIME FUNCTIONALITY
    // Function to calculate reading time in minutes
    function calculateReadingTime(content) {
        // Average reading speed (words per minute) - now customizable
        const wordsPerMinute = 200;

        // Count words by splitting the text on whitespace
        const wordCount = content.trim().split(/\s+/).length;

        // Calculate reading time in minutes
        let readingTime = Math.ceil(wordCount / wordsPerMinute);

        // Minimum reading time of 1 minute
        return Math.max(1, readingTime);
    }

    // Function to update reading time for all matching elements
    function updateReadingTimes() {
        // Get all article content
        const articleContent = document.querySelector('article') ||
            document.querySelector('.post-content') ||
            document.querySelector('.blog-content') ||
            document.body;

        if (!articleContent) {
            console.warn('Blog content container not found');
            return;
        }

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

        // Calculate reading time based on content
        const readingTime = calculateReadingTime(text);

        // Update all elements with the specified classes
        const timeElements = document.querySelectorAll('.post-read-time, .blog-read-time');

        timeElements.forEach(element => {
            // Keep the existing icon but update the time text
            const icon = element.querySelector('i');

            if (icon) {
                // Clear the element
                element.innerHTML = '';
                // Re-add the icon
                element.appendChild(icon);
                // Add the updated reading time
                element.appendChild(document.createTextNode(` ${readingTime} min read`));
            } else {
                // If no icon was found, just update the text
                element.textContent = `${readingTime} min read`;
            }
        });
    }

    // Initialize all functionality
    setupShareLinks();
    updateReadingTimes();

    // Add event listener for dynamic content changes (if you use AJAX)
    document.addEventListener('contentUpdated', function () {
        updateReadingTimes();
    });
});