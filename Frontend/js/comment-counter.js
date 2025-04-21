// COMMENT COUNTER SYSTEM
// This file handles the comment counting functionality

// Global variables
let commentCountElements = [];
let totalCommentCount = 0;

// Initialize comment counter when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    console.log("Initializing comment counter system...");
    initializeCommentCounter();
});

// Main initialization function for comment counter
function initializeCommentCounter() {
    // Find all elements that should display comment counts
    commentCountElements = document.querySelectorAll('.comment-count');

    // Set up observer for comment list changes
    setupCommentObserver();

    // Initial count update
    updateCommentCountDisplay();

    console.log("Comment counter initialized with", commentCountElements.length, "display elements");
}

// Set up mutation observer to watch for comment list changes
function setupCommentObserver() {
    const commentsList = document.querySelector('.comments-list');

    if (!commentsList) {
        console.error("Comments list element not found");
        return;
    }

    // Create observer to watch for DOM changes in comments list
    const observer = new MutationObserver(function (mutations) {
        console.log("Comments list changed, updating count");
        countComments();
    });

    // Start observing comments list for changes
    observer.observe(commentsList, {
        childList: true,
        subtree: true
    });

    console.log("Comment observer setup complete");
}

// Count comments and store the total
function countComments() {
    const commentsList = document.querySelector('.comments-list');

    if (!commentsList) {
        console.error("Comments list element not found");
        return 0;
    }

    // Count direct comment elements
    const comments = commentsList.querySelectorAll('.comment');
    totalCommentCount = comments.length;

    // If no comments found, check if we have a "no comments" message
    const noCommentsElement = commentsList.querySelector('.no-comments');
    if (noCommentsElement) {
        totalCommentCount = 0;
    }

    console.log("Comment count:", totalCommentCount);

    // Update UI with new count
    updateCommentCountDisplay();

    return totalCommentCount;
}

// Update all comment count displays in the UI
function updateCommentCountDisplay() {
    commentCountElements.forEach(element => {
        element.textContent = totalCommentCount.toString();
    });

    // Also update any heading that contains "Comments (x)" format
    updateCommentsHeadings();
}

// Update headings with comment counts
function updateCommentsHeadings() {
    const headings = document.querySelectorAll('h2, h3, h4');

    headings.forEach(heading => {
        const text = heading.textContent;

        // If heading text contains "Comments" and has parentheses, update the count
        if (text.includes('Comments') && text.includes('(')) {
            const newText = text.replace(/\(\d+\)/, `(${totalCommentCount})`);
            heading.textContent = newText;
        }
    });
}

// Public API for the comment counter
window.CommentCounter = {
    refresh: countComments,
    getCount: function () { return totalCommentCount; }
};

// Expose the comment counter to any external Firebase system
if (typeof window.initializeCommentSystem === 'function') {
    const originalInitFunc = window.initializeCommentSystem;

    window.initializeCommentSystem = function () {
        originalInitFunc();
        initializeCommentCounter();
    };
} else {
    window.initializeCommentSystem = initializeCommentCounter;
}

// Hook into existing comment systems if present
document.addEventListener('commentsLoaded', function (e) {
    // This custom event can be dispatched by the existing comment system when comments are loaded
    countComments();
});