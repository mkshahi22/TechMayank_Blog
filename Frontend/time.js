function initializeTimeUtilities() {
    // Initial update of time ago elements
    updateTimeAgo();
    updateCommentsTimeAgo();

    // Update time ago text every minute
    setInterval(updateTimeAgo, 60000);
    setInterval(updateCommentsTimeAgo, 60000);
}

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
        let timeAgoSpan = document.createElement('span');
        timeAgoSpan.className = 'time-ago';

        // Check if date is in the future
        if (publishDate > currentDate) {
            // Handle future date - show as "Scheduled"
            const diffMs = publishDate - currentDate;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                timeAgoSpan.textContent = ` (Publishing today)`;
            } else if (diffDays === 1) {
                timeAgoSpan.textContent = ` (Publishing tomorrow)`;
            } else {
                timeAgoSpan.textContent = ` (Publishing in ${diffDays} days)`;
            }
        } else {
            // Calculate difference in milliseconds for past dates
            const timeAgo = getTimeAgo(publishDate);
            timeAgoSpan.textContent = ` (${timeAgo})`;
        }

        // Append the span to the element
        element.appendChild(timeAgoSpan);
    });
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

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Make functions available globally
window.getTimeAgo = getTimeAgo;
window.formatDate = formatDate;
window.initializeTimeUtilities = initializeTimeUtilities;