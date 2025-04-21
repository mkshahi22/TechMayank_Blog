// FIREBASE COMMENT SYSTEM IMPLEMENTATION

// Load Firebase from CDN
function loadFirebaseFromCDN() {
    console.log("Loading Firebase from CDN...");

    // Check if Firebase is already loaded (legacy v8)
    if (typeof firebase !== 'undefined' && firebase.database) {
        console.log("Firebase v8 already loaded");
        setupCommentSystemLegacy();
        return;
    }

    // Load Firebase App first (v8)
    const scriptApp = document.createElement('script');
    scriptApp.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';

    scriptApp.onload = function () {
        console.log("Firebase App script loaded");

        // Then load Firebase Database
        const scriptDb = document.createElement('script');
        scriptDb.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js';

        scriptDb.onload = function () {
            console.log("Firebase Database script loaded");

            // Firebase config
            const firebaseConfig = {
                apiKey: "AIzaSyDyhGRHregnd4cGiACYZ41sV58AXyOlYY4",
                authDomain: "techmayank-3aa98.firebaseapp.com",
                databaseURL: "https://techmayank-3aa98-default-rtdb.asia-southeast1.firebasedatabase.app/",
                projectId: "techmayank-3aa98",
                storageBucket: "techmayank-3aa98.firebasestorage.app",
                messagingSenderId: "339110129251",
                appId: "1:339110129251:web:d44f5bebace6c5bdc61256",
                measurementId: "G-8JNQLZ809S"
            };
            // Initialize Firebase with legacy v8 API
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            setupCommentSystemLegacy();
        };
        document.head.appendChild(scriptDb);
    };

    scriptApp.onerror = function () {
        console.error("Failed to load Firebase App script");
        showErrorMessage("Comments system could not be loaded. Please try again later.");
    };

    document.head.appendChild(scriptApp);
}

// Setup comment system with modular v9 Firebase API
function setupCommentSystemModular() {
    console.log("Setting up comment system with modular Firebase v9");

    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');
    const commentMessage = document.getElementById('comment-message');
    const loadingComments = document.querySelector('.loading-comments');
    const commentCount = document.getElementById('comment-count');

    // Create admin login modal
    createAdminLoginModal();

    // Determine post ID
    let postId = determinePostId();
    console.log("Using post ID:", postId);

    // Add delete buttons to comments if admin
    function addDeleteButtons() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (isAdmin) {
            const comments = document.querySelectorAll('.comment');
            comments.forEach(comment => {
                if (!comment.querySelector('.delete-comment-btn')) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-comment-btn';
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteBtn.dataset.commentId = comment.dataset.commentId;

                    const commentHeader = comment.querySelector('.comment-header');
                    if (commentHeader) {
                        commentHeader.appendChild(deleteBtn);

                        deleteBtn.addEventListener('click', function () {
                            deleteComment(this.dataset.commentId);
                        });
                    }
                }
            });
        }
    }

    // Delete a comment using modular API
    function deleteComment(commentId) {
        if (!commentId) {
            console.error("No comment ID provided for deletion");
            return;
        }

        console.log("Deleting comment:", commentId);

        try {
            const commentRef = window.firebase.ref(`comments/${postId}/${commentId}`);
            window.firebase.remove(commentRef)
                .then(() => {
                    console.log("Comment deleted successfully");
                    if (commentMessage) {
                        commentMessage.className = 'form-message success';
                        commentMessage.innerHTML = '<i class="fas fa-check-circle"></i> Comment deleted successfully.';
                        commentMessage.style.display = 'block';

                        setTimeout(() => {
                            commentMessage.style.display = 'none';
                        }, 3000);
                    }
                })
                .catch(error => {
                    console.error("Error deleting comment:", error);
                    if (commentMessage) {
                        commentMessage.className = 'form-message error';
                        commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to delete comment.';
                        commentMessage.style.display = 'block';
                    }
                });
        } catch (error) {
            console.error("Error during comment deletion:", error);
            if (commentMessage) {
                commentMessage.className = 'form-message error';
                commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to delete comment.';
                commentMessage.style.display = 'block';
            }
        }
    }

    // Display comments in the UI
    function displayComments(comments) {
        // Hide loading indicator
        if (loadingComments) {
            loadingComments.style.display = 'none';
        }

        // No comments case
        if (!comments || Object.keys(comments).length === 0) {
            commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>';
            if (commentCount) commentCount.textContent = '0';
            return;
        }

        // Update comment count
        if (commentCount) {
            commentCount.textContent = Object.keys(comments).length.toString();
        }

        // Convert to array and sort
        const commentsArray = Object.keys(comments).map(id => {
            return { ...comments[id], id };
        });

        commentsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Build HTML
        let commentsHTML = '';
        commentsArray.forEach(comment => {
            const safeName = escapeHTML(comment.name);
            const safeContent = escapeHTML(comment.content);
            const timeAgo = getTimeAgo(new Date(comment.created_at));

            commentsHTML += `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">${safeName}</div>
                    <div class="comment-date">${formatDate(comment.created_at)} <span class="time-ago">(${timeAgo})</span></div>
                </div>
                <div class="comment-content">${safeContent}</div>
            </div>
            `;
        });

        commentsList.innerHTML = commentsHTML;

        // Add delete buttons if admin
        addDeleteButtons();

        // Update comment count if counter is available
        if (window.CommentCounter && typeof window.CommentCounter.refresh === 'function') {
            window.CommentCounter.refresh();
        } else {
            // Dispatch event for external counter systems
            document.dispatchEvent(new CustomEvent('commentsLoaded', {
                detail: { count: commentsArray.length }
            }));
        }
    }

    // Fetch comments from Firebase using v9 modular API
    function fetchComments() {
        console.log("Fetching comments for post:", postId);

        // Show loading
        if (loadingComments) {
            loadingComments.style.display = 'block';
        }

        try {
            // Set up listener for comments
            const commentsRef = window.firebase.ref(`comments/${postId}`);

            window.firebase.onValue(commentsRef,
                (snapshot) => {
                    console.log("Comments received from Firebase:", snapshot.val());
                    displayComments(snapshot.val());
                },
                (error) => {
                    console.error("Error fetching comments:", error);
                    showErrorMessage("Unable to load comments. Please try again later.");
                }
            );
        } catch (error) {
            console.error("Error setting up comments listener:", error);
            showErrorMessage("Unable to load comments. Please try again later.");
        }
    }

    // Call fetchComments to load comments initially
    fetchComments();

    // Handle comment form submission - prevent page reload on submit
    commentForm.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log("Comment form submitted");

        const nameInput = document.getElementById('comment-name');
        const emailInput = document.getElementById('comment-email');
        const contentInput = document.getElementById('comment-content');

        if (!nameInput || !emailInput || !contentInput) {
            console.error("Required form fields missing");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const content = contentInput.value.trim();

        console.log("Form values:", { name, email, content });

        // Form validation
        if (!name || !email || !content) {
            if (commentMessage) {
                commentMessage.className = 'form-message error';
                commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill all required fields.';
                commentMessage.style.display = 'block';
            }
            return;
        }

        // Create comment object
        const newComment = {
            name,
            email,
            content,
            created_at: new Date().toISOString(),
            post_id: postId
        };

        console.log("Saving new comment:", newComment);

        try {
            // Add to Firebase using modular API
            const commentsRef = window.firebase.ref(`comments/${postId}`);
            window.firebase.push(commentsRef, newComment)
                .then(() => {
                    console.log("Comment saved successfully");

                    // Show success message
                    if (commentMessage) {
                        commentMessage.className = 'form-message success';
                        commentMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your comment has been posted successfully!';
                        commentMessage.style.display = 'block';

                        setTimeout(() => {
                            commentMessage.style.display = 'none';
                        }, 3000);
                    }

                    // Reset form
                    commentForm.reset();
                })
                .catch(error => {
                    console.error("Error saving comment:", error);

                    if (commentMessage) {
                        commentMessage.className = 'form-message error';
                        commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to post your comment. Please try again.';
                        commentMessage.style.display = 'block';
                    }
                });
        } catch (error) {
            console.error("Error pushing comment:", error);
            if (commentMessage) {
                commentMessage.className = 'form-message error';
                commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to post your comment. Please try again.';
                commentMessage.style.display = 'block';
            }
        }
    });

    // Admin login functionality
    const adminLoginBtn = document.getElementById('admin-login-btn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function () {
            // Show the admin login modal
            document.getElementById('admin-login-modal').style.display = 'flex';
        });
    }
}

// Setup comment system with legacy v8 Firebase API
function setupCommentSystemLegacy() {
    console.log("Setting up comment system with legacy Firebase v8");

    const database = firebase.database();
    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');
    const commentMessage = document.getElementById('comment-message');
    const loadingComments = document.querySelector('.loading-comments');
    const commentCount = document.getElementById('comment-count');

    // Create admin login modal
    createAdminLoginModal();

    // Determine post ID
    let postId = determinePostId();
    console.log("Using post ID:", postId);

    // Add delete buttons to comments if admin
    function addDeleteButtons() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (isAdmin) {
            const comments = document.querySelectorAll('.comment');
            comments.forEach(comment => {
                if (!comment.querySelector('.delete-comment-btn')) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-comment-btn';
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteBtn.dataset.commentId = comment.dataset.commentId;

                    const commentHeader = comment.querySelector('.comment-header');
                    if (commentHeader) {
                        commentHeader.appendChild(deleteBtn);

                        deleteBtn.addEventListener('click', function () {
                            deleteComment(this.dataset.commentId);
                        });
                    }
                }
            });
        }
    }

    // Delete a comment
    function deleteComment(commentId) {
        if (!commentId) {
            console.error("No comment ID provided for deletion");
            return;
        }

        console.log("Deleting comment:", commentId);

        database.ref(`comments/${postId}/${commentId}`).remove()
            .then(() => {
                console.log("Comment deleted successfully");
                if (commentMessage) {
                    commentMessage.className = 'form-message success';
                    commentMessage.innerHTML = '<i class="fas fa-check-circle"></i> Comment deleted successfully.';
                    commentMessage.style.display = 'block';

                    setTimeout(() => {
                        commentMessage.style.display = 'none';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error("Error deleting comment:", error);
                if (commentMessage) {
                    commentMessage.className = 'form-message error';
                    commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to delete comment.';
                    commentMessage.style.display = 'block';
                }
            });
    }

    // Display comments in the UI
    function displayComments(comments) {
        // Hide loading indicator
        if (loadingComments) {
            loadingComments.style.display = 'none';
        }

        // No comments case
        if (!comments || Object.keys(comments).length === 0) {
            commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>';
            if (commentCount) commentCount.textContent = '0';
            return;
        }

        // Update comment count
        if (commentCount) {
            commentCount.textContent = Object.keys(comments).length.toString();
        }

        // Convert to array and sort
        const commentsArray = Object.keys(comments).map(id => {
            return { ...comments[id], id };
        });

        commentsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Build HTML
        let commentsHTML = '';
        commentsArray.forEach(comment => {
            const safeName = escapeHTML(comment.name);
            const safeContent = escapeHTML(comment.content);
            const timeAgo = getTimeAgo(new Date(comment.created_at));

            commentsHTML += `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">${safeName}</div>
                    <div class="comment-date">${formatDate(comment.created_at)} <span class="time-ago">(${timeAgo})</span></div>
                </div>
                <div class="comment-content">${safeContent}</div>
            </div>
            `;
        });

        commentsList.innerHTML = commentsHTML;

        // Add delete buttons if admin
        addDeleteButtons();

        // Update comment count if counter is available
        if (window.CommentCounter && typeof window.CommentCounter.refresh === 'function') {
            window.CommentCounter.refresh();
        } else {
            // Dispatch event for external counter systems
            document.dispatchEvent(new CustomEvent('commentsLoaded', {
                detail: { count: commentsArray ? commentsArray.length : 0 }
            }));
        }
    }

    // Fetch comments from Firebase
    function fetchComments() {
        console.log("Fetching comments for post:", postId);

        // Show loading
        if (loadingComments) {
            loadingComments.style.display = 'block';
        }

        try {
            // Set up listener for comments
            const commentsRef = database.ref(`comments/${postId}`);

            commentsRef.on('value',
                (snapshot) => {
                    console.log("Comments received from Firebase:", snapshot.val());
                    displayComments(snapshot.val());
                },
                (error) => {
                    console.error("Error fetching comments:", error);
                    showErrorMessage("Unable to load comments. Please try again later.");
                }
            );
        } catch (error) {
            console.error("Error setting up comments listener:", error);
            showErrorMessage("Unable to load comments. Please try again later.");
        }
    }

    // Call fetchComments to load comments initially
    fetchComments();

    // Handle comment form submission
    commentForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form from causing page reload
        console.log("Comment form submitted");

        const nameInput = document.getElementById('comment-name');
        const emailInput = document.getElementById('comment-email');
        const contentInput = document.getElementById('comment-content');

        if (!nameInput || !emailInput || !contentInput) {
            console.error("Required form fields missing");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const content = contentInput.value.trim();

        console.log("Form values:", { name, email, content });

        // Form validation
        if (!name || !email || !content) {
            if (commentMessage) {
                commentMessage.className = 'form-message error';
                commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill all required fields.';
                commentMessage.style.display = 'block';
            }
            return;
        }

        // Create comment object
        const newComment = {
            name,
            email,
            content,
            created_at: new Date().toISOString(),
            post_id: postId
        };

        console.log("Saving new comment:", newComment);

        // Add to Firebase
        const commentsRef = database.ref(`comments/${postId}`);

        commentsRef.push(newComment)
            .then(() => {
                console.log("Comment saved successfully");

                // Show success message
                if (commentMessage) {
                    commentMessage.className = 'form-message success';
                    commentMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your comment has been posted successfully!';
                    commentMessage.style.display = 'block';

                    setTimeout(() => {
                        commentMessage.style.display = 'none';
                    }, 3000);
                }

                // Reset form
                commentForm.reset();
            })
            .catch(error => {
                console.error("Error saving comment:", error);

                if (commentMessage) {
                    commentMessage.className = 'form-message error';
                    commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to post your comment. Please try again.';
                    commentMessage.style.display = 'block';
                }
            });
    });

    // Admin login functionality
    const adminLoginBtn = document.getElementById('admin-login-btn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function () {
            // Show the admin login modal
            document.getElementById('admin-login-modal').style.display = 'flex';
        });
    }
}

// Create the admin login modal
function createAdminLoginModal() {
    // Check if modal already exists
    if (document.getElementById('admin-login-modal')) {
        return;
    }

    // Create modal HTML
    const modalHTML = `
    <div id="admin-login-modal" class="admin-modal">
        <div class="admin-modal-content">
            <span class="admin-modal-close">&times;</span>
            <h2>Admin Login</h2>
            <div class="admin-form">
                <label for="admin-password">Password:</label>
                <input type="password" id="admin-password" placeholder="Enter admin password">
                <button id="admin-submit-btn">Login</button>
                <div id="admin-login-message" class="form-message"></div>
            </div>
        </div>
    </div>
    `;

    // Add modal HTML to the document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    // Add styles for the modal
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .admin-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            justify-content: center;
            align-items: center;
        }
        
        .admin-modal-content {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            width: 90%;
            max-width: 400px;
            position: relative;
        }
        
        .admin-modal-close {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
        }
        
        .admin-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 15px;
        }
        
        .admin-form label {
            font-weight: bold;
        }
        
        .admin-form input {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .admin-form button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .admin-form button:hover {
            background-color: #388E3C;
        }
    `;
    document.head.appendChild(styleElement);

    // Add event listeners
    const modal = document.getElementById('admin-login-modal');
    const closeBtn = document.querySelector('.admin-modal-close');
    const submitBtn = document.getElementById('admin-submit-btn');
    const loginMessage = document.getElementById('admin-login-message');

    // Close button event
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Submit button event
    submitBtn.addEventListener('click', function () {
        const passwordInput = document.getElementById('admin-password');
        const password = passwordInput.value.trim();

        if (password === "Mayank#123") {
            localStorage.setItem('isAdmin', 'true');
            loginMessage.className = 'form-message success';
            loginMessage.innerHTML = '<i class="fas fa-check-circle"></i> Login successful!';
            loginMessage.style.display = 'block';

            setTimeout(() => {
                modal.style.display = 'none';
                alert("Hii, Mitthu Kumar Mayank! You are now logged in as admin.");
                // Refresh delete buttons
                const addDeleteButtons = document.querySelectorAll('.comment');
                if (addDeleteButtons) {
                    addDeleteButtons();
                }
            }, 1000);
        } else {
            loginMessage.className = 'form-message error';
            loginMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Incorrect password.';
            loginMessage.style.display = 'block';

            // Clear password field
            passwordInput.value = '';
        }
    });
}

// Helper Functions

// Determine post ID from URL or page title
function determinePostId() {
    // Try to get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        return urlParams.get('id');
    }

    // Try to get from URL path
    const pathMatch = window.location.pathname.match(/\/post\/([^\/]+)/);
    if (pathMatch) {
        return pathMatch[1];
    }

    // Fallback to page title or location hash
    const titleElement = document.querySelector('h1') || document.querySelector('title');
    if (titleElement) {
        // Generate slug from title
        const titleSlug = titleElement.textContent
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        return titleSlug;
    }

    // Final fallback to pathname
    return window.location.pathname.replace(/\//g, '-').substring(1) || 'default-post';
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    if (interval === 1) return "1 year ago";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    if (interval === 1) return "1 month ago";

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    if (interval === 1) return "1 day ago";

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    if (interval === 1) return "1 hour ago";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    if (interval === 1) return "1 minute ago";

    return "just now";
}

// Show error message
function showErrorMessage(message) {
    const loadingComments = document.querySelector('.loading-comments');
    const commentsList = document.querySelector('.comments-list');

    if (loadingComments) {
        loadingComments.style.display = 'none';
    }

    if (commentsList) {
        commentsList.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    }

    console.error(message);
}

// Initialize the comment system
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, initializing comment system");
    loadFirebaseFromCDN();
});