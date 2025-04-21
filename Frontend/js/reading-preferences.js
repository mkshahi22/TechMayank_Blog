// reading-preferences.js - Handles text-to-speech and reading preferences
document.addEventListener("DOMContentLoaded", function () {
    // Reading preferences configuration
    let readingPreferences = {
        speed: 1, // 0.8 = slower, 1 = normal, 1.25 = faster
        voice: null, // Will be set dynamically
        pitch: 1, // 0.5 to 2
        volume: 1, // 0 to 1
        highlightText: true, // Whether to highlight text while reading
        chunkSize: 120 // Number of words per chunk to reduce buffering
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

    // Cache for voices to avoid repeated fetching
    let cachedVoices = [];

    // Function to handle text-to-speech with customization
    function setupTextToSpeech(shareContainer) {
        const ttsButton = shareContainer.querySelector('.text-to-speech');
        if (!ttsButton) return;

        let isSpeaking = false;
        let isPaused = false;
        let utterance = null;
        let currentParagraphIndex = 0;
        let currentChunkIndex = 0;
        let paragraphElements = [];
        let paragraphChunks = [];
        let activeHighlight = null;

        // Pre-fetch voices when possible
        if ('speechSynthesis' in window) {
            cachedVoices = window.speechSynthesis.getVoices();

            if (cachedVoices.length === 0) {
                // If voices aren't loaded yet, set up event listener
                window.speechSynthesis.onvoiceschanged = () => {
                    cachedVoices = window.speechSynthesis.getVoices();
                };
            }
        }

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

        // Create settings panel
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
                    if (isPaused) {
                        // Resume speaking
                        window.speechSynthesis.resume();
                        ttsButton.innerHTML = '<i class="fas fa-pause"></i>';
                        isPaused = false;
                    } else {
                        // Pause speaking
                        window.speechSynthesis.pause();
                        ttsButton.innerHTML = '<i class="fas fa-play"></i>';
                        isPaused = true;
                    }
                } else {
                    // Show loading state
                    ttsButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                    // Get article content
                    const articleContent = document.querySelector('article') ||
                        document.querySelector('.post-content') ||
                        document.querySelector('.blog-content');

                    if (articleContent) {
                        // Reset state for new reading session
                        currentParagraphIndex = 0;
                        currentChunkIndex = 0;
                        paragraphElements = [];
                        paragraphChunks = [];

                        // Cancel any ongoing speech
                        window.speechSynthesis.cancel();

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

        // Function to split text into chunks to avoid buffering issues
        function splitTextIntoChunks(text, chunkSize) {
            // Split the text into words
            const words = text.trim().split(/\s+/);
            const chunks = [];

            // Create chunks of approximately chunkSize words
            for (let i = 0; i < words.length; i += chunkSize) {
                chunks.push(words.slice(i, i + chunkSize).join(' '));
            }

            return chunks;
        }

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
            currentChunkIndex = 0;
            isSpeaking = true;
            isPaused = false;

            // Pre-process all paragraphs into chunks
            paragraphChunks = paragraphElements.map(element =>
                splitTextIntoChunks(element.textContent, readingPreferences.chunkSize)
            );

            readNextChunk();
        }

        // Function to read the next chunk
        function readNextChunk() {
            // Check if we've reached the end of all paragraphs
            if (currentParagraphIndex >= paragraphElements.length) {
                finishReading();
                return;
            }

            const paragraph = paragraphElements[currentParagraphIndex];
            const chunks = paragraphChunks[currentParagraphIndex];

            // If first chunk of paragraph, highlight the paragraph
            if (currentChunkIndex === 0 && readingPreferences.highlightText) {
                removeHighlights(); // Remove any previous highlights
                highlightElement(paragraph);

                // Scroll element into view if it's not already visible
                paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Check if we've processed all chunks in this paragraph
            if (currentChunkIndex >= chunks.length) {
                // Move to next paragraph
                currentParagraphIndex++;
                currentChunkIndex = 0;
                readNextChunk();
                return;
            }

            // Get the current chunk text
            const chunkText = chunks[currentChunkIndex];

            // Create utterance for this chunk
            utterance = new SpeechSynthesisUtterance(chunkText);

            // Apply user preferences
            utterance.rate = readingPreferences.speed;
            utterance.pitch = readingPreferences.pitch;
            utterance.volume = readingPreferences.volume;

            // Set language (optional - can be dynamic based on page lang)
            utterance.lang = document.documentElement.lang || 'en-US';

            // Use selected voice if available
            if (readingPreferences.voice) {
                const selectedVoice = cachedVoices.find(v => v.name === readingPreferences.voice);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
            }

            // Set up event handlers
            utterance.onstart = () => {
                ttsButton.innerHTML = '<i class="fas fa-pause"></i>';
                ttsButton.setAttribute('aria-label', 'Pause reading');
                ttsButton.classList.add('active');
            };

            utterance.onend = () => {
                // Move to next chunk
                currentChunkIndex++;

                // Use setTimeout to prevent potential speech synthesis queue issues
                setTimeout(readNextChunk, 50);
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);

                // If it's a network error or audio output error, try again with the next chunk
                if (event.error === 'network' || event.error === 'audio-busy') {
                    currentChunkIndex++;
                    setTimeout(readNextChunk, 250); // Wait a bit longer before retry
                } else {
                    finishReading();
                }
            };

            // Start speaking
            try {
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.error('Speech synthesis error:', e);
                finishReading();
                alert("An error occurred while trying to read the content.");
            }
        }

        // Function to clean up when reading is finished
        function finishReading() {
            ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            ttsButton.setAttribute('aria-label', 'Read article aloud');
            ttsButton.classList.remove('active');
            isSpeaking = false;
            isPaused = false;
            removeHighlights();

            // Make sure any pending speech is canceled
            window.speechSynthesis.cancel();
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

            // Add chunk size control (for buffering reduction)
            addRangeControl(panel, 'Buffer Size (words)', 'chunkSize', 50, 200, 10, readingPreferences.chunkSize);

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
                // Cache the voices
                cachedVoices = voices;

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
                    highlightText: true,
                    chunkSize: 120
                };

                // Update UI
                document.getElementById('speed-range').value = 1;
                document.getElementById('speed-value').textContent = '1';
                document.getElementById('pitch-range').value = 1;
                document.getElementById('pitch-value').textContent = '1';
                document.getElementById('volume-range').value = 1;
                document.getElementById('volume-value').textContent = '1';
                document.getElementById('chunkSize-range').value = 120;
                document.getElementById('chunkSize-value').textContent = '120';
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

                // If currently speaking, update the current utterance if possible
                if (isSpeaking && utterance && id !== 'chunkSize') {
                    utterance[id] = newValue;
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

        // Set up a periodic check to keep speech synthesis active
        // (Some browsers have issues with long text and stop speaking)
        setInterval(() => {
            if (isSpeaking && !isPaused && !window.speechSynthesis.speaking) {
                // If we should be speaking but nothing is being spoken,
                // try to continue from the current position
                readNextChunk();
            }
        }, 1000);
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

    // Export functions that need to be accessible from the social-sharing module
    window.readingModule = {
        setupTextToSpeech: setupTextToSpeech,
        updateReadingTimes: updateReadingTimes
    };

    // Initialize reading time functionality
    updateReadingTimes();

    // Add event listener for dynamic content changes (if you use AJAX)
    document.addEventListener('contentUpdated', function () {
        updateReadingTimes();
    });
});