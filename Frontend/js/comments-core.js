// COMMENT SYSTEM CORE
// Main initialization function
document.addEventListener('DOMContentLoaded', function () {
    // Check if comment elements exist before initializing
    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');

    if (commentForm && commentsList) {
        console.log("Comment form and list found. Initializing comment system...");
        initializeCommentSystem();
    }

    // Apply time ago to comment dates when page loads
    updateCommentsTimeAgo();

    // Update comment times every minute
    setInterval(updateCommentsTimeAgo, 60000);
});

// Main initialization function for the comment system
function initializeCommentSystem() {
    console.log("Initializing comment system");

    // Check if we already have Firebase from the module import
    if (window.firebase && window.firebase.push) {
        console.log("Using Firebase from modular import");
        setupCommentSystemModular();
    } else {
        // Fall back to loading Firebase from CDN (v8)
        loadFirebaseFromCDN();
    }
}

// Helper function to determine post ID from various sources
function determinePostId() {
    let postId = 'default-post';

    // First try data attribute
    const postIdElement = document.querySelector('[data-post-id]');
    if (postIdElement) {
        postId = postIdElement.getAttribute('data-post-id');
    } else {
        // Try to extract from URL
        const urlPath = window.location.pathname;

        // Remove trailing slash if present
        const cleanPath = urlPath.endsWith('/') ? urlPath.slice(0, -1) : urlPath;

        // Get the last segment and remove .html extension if present
        const pathSegments = cleanPath.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1].replace(/\.html$/, '');

        if (lastSegment && lastSegment !== '') {
            postId = lastSegment;
        }
    }

    // Sanitize postId to be valid in Firebase path
    return postId.replace(/[.#$\/\[\]]/g, '_');
}

// Helper function to get time ago for any date
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

// Safely escape HTML to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Show error message
function showErrorMessage(message) {
    const loadingIndicator = document.querySelector('.loading-comments');
    const commentsList = document.querySelector('.comments-list');
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (commentsList) commentsList.innerHTML = `<div class="comments-error">${message}</div>`;
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