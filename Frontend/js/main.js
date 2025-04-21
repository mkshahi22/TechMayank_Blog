document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });
    }

    // Mobile dropdown toggle
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');

        if (dropdownLink && window.innerWidth <= 768) {
            dropdownLink.addEventListener('click', function (e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (navLinks && !event.target.closest('nav') && !event.target.closest('.mobile-menu-btn')) {
            navLinks.classList.remove('active');
        }
    });

    // Navbar scroll effect
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Copy code button functionality
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const codeBlock = this.previousElementSibling.textContent;
            navigator.clipboard.writeText(codeBlock.trim())
                .then(() => {
                    // Change button icon/text to indicate success
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-check';
                        setTimeout(() => {
                            icon.className = 'far fa-copy';
                        }, 2000);
                    }
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        });
    });

    // Table of contents smooth scrolling
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    tocLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80; // Adjust based on your header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // UPDATED TIME AGO FUNCTIONALITY - WITH FUTURE DATE HANDLING
    // Function to calculate and display time ago
    function updateTimeAgo() {
        // Get all elements with data-published attribute
        const timeElements = document.querySelectorAll('[data-published]');

        timeElements.forEach(element => {
            // Skip if the element already has time-ago span
            if (element.querySelector('.time-ago')) {
                return;
            }

            const publishDate = new Date(element.getAttribute('data-published'));
            const currentDate = new Date();

            // Check if date is in the future
            if (publishDate > currentDate) {
                // Handle future date - show as "Scheduled"
                const timeAgoSpan = document.createElement('span');
                timeAgoSpan.className = 'time-ago';

                // Calculate days until publication
                const diffMs = publishDate - currentDate;
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    timeAgoSpan.textContent = ` (Publishing today)`;
                } else if (diffDays === 1) {
                    timeAgoSpan.textContent = ` (Publishing tomorrow)`;
                } else {
                    timeAgoSpan.textContent = ` (Publishing in ${diffDays} days)`;
                }

                element.appendChild(timeAgoSpan);
                return;
            }

            // Calculate difference in milliseconds for past dates
            const diffMs = currentDate - publishDate;
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);

            // Create time ago text
            let timeAgo;
            if (diffYears > 0) {
                timeAgo = diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
            } else if (diffMonths > 0) {
                timeAgo = diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
            } else if (diffDays > 0) {
                timeAgo = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
            } else if (diffHours > 0) {
                timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
            } else if (diffMinutes > 0) {
                timeAgo = diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
            } else {
                timeAgo = 'just now';
            }

            // Create a span for time ago text
            const timeAgoSpan = document.createElement('span');
            timeAgoSpan.className = 'time-ago';
            timeAgoSpan.textContent = ` (${timeAgo})`;

            // Append the span to the element
            element.appendChild(timeAgoSpan);
        });
    }

    // Call the function when the page loads
    updateTimeAgo();

    // Update time ago text every minute
    setInterval(updateTimeAgo, 60000);

    // Helper function to calculate time ago for any date
    function getTimeAgo(date) {
        const currentDate = new Date();

        // Check if date is in the future
        if (date > currentDate) {
            // Calculate days until publication
            const diffMs = date - currentDate;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                return 'Publishing today';
            } else if (diffDays === 1) {
                return 'Publishing tomorrow';
            } else {
                return `Publishing in ${diffDays} days`;
            }
        }

        // Calculate for past dates
        const diffMs = currentDate - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffYears > 0) {
            return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
        } else if (diffMonths > 0) {
            return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
        } else if (diffDays > 0) {
            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        } else if (diffHours > 0) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffMinutes > 0) {
            return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
        } else {
            return 'just now';
        }
    }

    // Apply time ago to comment dates
    function updateCommentsTimeAgo() {
        const commentDates = document.querySelectorAll('.comment-date');
        commentDates.forEach(element => {
            const dateText = element.textContent;
            if (!dateText.includes('ago') && !dateText.includes('Publishing') && dateText.trim() !== '') {
                try {
                    const date = new Date(dateText);
                    if (!isNaN(date.getTime())) {
                        const timeAgo = getTimeAgo(date);
                        element.innerHTML = `${dateText} <span class="time-ago">(${timeAgo})</span>`;
                    }
                } catch (e) {
                    console.error('Error parsing date:', e);
                }
            }
        });
    }

    // Call updateCommentsTimeAgo to apply time ago to comment dates
    updateCommentsTimeAgo();

    // Update comment times every minute
    setInterval(updateCommentsTimeAgo, 60000);

    // Initialize comments if the system exists on the page
    if (typeof initializeCommentSystem === 'function') {
        initializeCommentSystem();
    }
});