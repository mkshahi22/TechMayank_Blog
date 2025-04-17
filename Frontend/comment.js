function initializeCommentSystem() {
    console.log("Initializing comment system");

    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');

    if (!commentForm || !commentsList) {
        console.log("Comment form or list not found. Skipping comment system initialization.");
        return;
    }

    // Check if we already have Firebase from the module import
    if (window.firebase && window.firebase.push) {
        console.log("Using Firebase from modular import");
        setupCommentSystemModular();
    } else {
        // Fall back to loading Firebase from CDN (v8)
        loadFirebaseFromCDN();
    }
}

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

function showErrorMessage(message) {
    const loadingIndicator = document.querySelector('.loading-comments');
    const commentsList = document.querySelector('.comments-list');

    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (commentsList) commentsList.innerHTML = `<div class="comments-error">${message}</div>`;
}

// Determine post ID from URL or fallback to default
function determinePostId() {
    const urlPath = window.location.pathname;
    const pageName = urlPath.split('/').filter(Boolean).pop() || 'index';
    return pageName.replace('.html', '');
}

// Setup comment system with modular v9 Firebase API
function setupCommentSystemModular() {
    console.log("Setting up comment system with modular Firebase v9");

    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');
    const commentMessage = document.getElementById('comment-message');
    const loadingComments = document.querySelector('.loading-comments');
    const commentCount = document.getElementById('comment-count');

    // Add admin login form to the DOM
    addAdminLoginForm();

    // Determine post ID
    let postId = determinePostId();
    console.log("Using post ID:", postId);

    // Track if we're in reply mode
    let replyingToComment = null;

    // Safely escape HTML to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Add delete buttons to comments if admin
    function addAdminControls() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (isAdmin) {
            const comments = document.querySelectorAll('.comment');
            comments.forEach(comment => {
                if (!comment.querySelector('.delete-comment-btn')) {
                    const commentHeader = comment.querySelector('.comment-header');
                    if (commentHeader) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete-comment-btn';
                        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                        deleteBtn.dataset.commentId = comment.dataset.commentId;
                        deleteBtn.title = "Delete comment";

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

                    // Also delete all replies to this comment
                    const repliesRef = window.firebase.ref(`replies/${postId}/${commentId}`);
                    window.firebase.remove(repliesRef).catch(error => {
                        console.error("Error deleting replies:", error);
                    });

                    // Also delete all likes for this comment
                    const likesRef = window.firebase.ref(`likes/${postId}/${commentId}`);
                    window.firebase.remove(likesRef).catch(error => {
                        console.error("Error deleting likes:", error);
                    });
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

    // Add reply form under a comment
    function addReplyForm(commentId, authorName) {
        // Remove any existing reply forms
        const existingForm = document.querySelector('.reply-form-container');
        if (existingForm) {
            existingForm.remove();
        }

        // Find the comment
        const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
        if (!comment) return;

        // Create reply form
        const replyFormContainer = document.createElement('div');
        replyFormContainer.className = 'reply-form-container';

        replyFormContainer.innerHTML = `
            <form class="reply-form">
                <div class="form-group">
                    <label for="reply-name" class="required-field">Name</label>
                    <input type="text" id="reply-name" placeholder="Your name" required>
                    <i class="fas fa-user input-icon"></i>
                </div>
                <div class="form-group">
                    <label for="reply-email" class="required-field">Email</label>
                    <input type="email" id="reply-email" placeholder="Your email" required>
                    <i class="fas fa-envelope input-icon"></i>
                    <div class="form-text">Your email won't be published</div>
                </div>
                <div class="form-group">
                    <label for="reply-content" class="required-field">Reply to ${escapeHTML(authorName)}</label>
                    <textarea id="reply-content" placeholder="Your reply..." required></textarea>
                    <i class="fas fa-comment input-icon"></i>
                </div>
                <div id="reply-message" class="form-message" style="display: none;"></div>
                <div class="reply-actions">
                    <button type="button" class="submit-reply-btn"><i class="fas fa-reply"></i> Post Reply</button>
                    <button type="button" class="cancel-reply-btn"><i class="fas fa-times"></i> Cancel</button>
                </div>
            </form>
        `;

        // Insert after the comment
        comment.after(replyFormContainer);

        // Set global state
        replyingToComment = commentId;

        // Add event listeners
        const replyForm = replyFormContainer.querySelector('.reply-form');
        const submitButton = replyFormContainer.querySelector('.submit-reply-btn');
        const cancelButton = replyFormContainer.querySelector('.cancel-reply-btn');

        submitButton.addEventListener('click', handleReplySubmit);
        cancelButton.addEventListener('click', () => {
            replyFormContainer.remove();
            replyingToComment = null;
        });

        // Focus name field
        replyFormContainer.querySelector('#reply-name').focus();
    }

    // Handle reply form submission
    function handleReplySubmit(e) {
        e.preventDefault();

        const nameInput = document.getElementById('reply-name');
        const emailInput = document.getElementById('reply-email');
        const contentInput = document.getElementById('reply-content');
        const replyMessage = document.getElementById('reply-message');

        if (!nameInput || !emailInput || !contentInput) {
            console.error("Required reply form fields missing");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const content = contentInput.value.trim();

        // Form validation
        if (!name || !email || !content) {
            if (replyMessage) {
                replyMessage.className = 'form-message error';
                replyMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill all required fields.';
                replyMessage.style.display = 'block';
            }
            return;
        }

        // Create reply object
        const newReply = {
            name,
            email,
            content,
            created_at: new Date().toISOString(),
            parent_id: replyingToComment,
            post_id: postId
        };

        try {
            // Save reply to Firebase
            const repliesRef = window.firebase.ref(`replies/${postId}/${replyingToComment}`);
            window.firebase.push(repliesRef, newReply)
                .then(() => {
                    console.log("Reply saved successfully");

                    if (replyMessage) {
                        replyMessage.className = 'form-message success';
                        replyMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your reply has been posted!';
                        replyMessage.style.display = 'block';

                        setTimeout(() => {
                            document.querySelector('.reply-form-container').remove();
                            replyingToComment = null;
                        }, 2000);
                    }
                })
                .catch(error => {
                    console.error("Error saving reply:", error);

                    if (replyMessage) {
                        replyMessage.className = 'form-message error';
                        replyMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to post reply. Please try again.';
                        replyMessage.style.display = 'block';
                    }
                });
        } catch (error) {
            console.error("Error pushing reply:", error);

            if (replyMessage) {
                replyMessage.className = 'form-message error';
                replyMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to post reply. Please try again.';
                replyMessage.style.display = 'block';
            }
        }
    }

    // Handle comment like
    function handleLike(commentId) {
        const likeButton = document.querySelector(`.like-btn[data-comment-id="${commentId}"]`);
        if (!likeButton) return;

        // Generate a unique user ID (simple implementation - in production use proper authentication)
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }

        // Check if already liked
        const likeRef = window.firebase.ref(`likes/${postId}/${commentId}/${userId}`);

        window.firebase.get(likeRef).then((snapshot) => {
            if (snapshot.exists()) {
                // User already liked, so unlike
                window.firebase.remove(likeRef).then(() => {
                    console.log("Like removed");
                    likeButton.classList.remove('liked');
                    updateLikeCount(commentId);
                });
            } else {
                // Add new like
                window.firebase.set(likeRef, true).then(() => {
                    console.log("Like added");
                    likeButton.classList.add('liked');
                    updateLikeCount(commentId);
                });
            }
        }).catch(error => {
            console.error("Error toggling like:", error);
        });
    }

    // Update like count for a comment
    function updateLikeCount(commentId) {
        const likesRef = window.firebase.ref(`likes/${postId}/${commentId}`);
        const likeCountElem = document.querySelector(`.like-count[data-comment-id="${commentId}"]`);

        if (likeCountElem) {
            window.firebase.get(likesRef).then((snapshot) => {
                const likeCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                likeCountElem.textContent = likeCount;

                // Check if current user liked this comment
                let userId = localStorage.getItem('user_id');
                if (userId && snapshot.exists() && snapshot.val()[userId]) {
                    document.querySelector(`.like-btn[data-comment-id="${commentId}"]`)
                        .classList.add('liked');
                }
            });
        }
    }

    // Add admin login form to the page
    function addAdminLoginForm() {
        const adminLoginBtn = document.getElementById('admin-login-btn');
        if (!adminLoginBtn) return;

        // Create modal for admin login
        const adminLoginModal = document.createElement('div');
        adminLoginModal.id = 'admin-login-modal';
        adminLoginModal.className = 'admin-login-modal';
        adminLoginModal.style.display = 'none';

        adminLoginModal.innerHTML = `
            <div class="admin-login-content">
                <span class="close-modal">&times;</span>
                <h3>Admin Login</h3>
                <form id="admin-login-form">
                    <div class="form-group">
                        <label for="admin-password">Password</label>
                        <input type="password" id="admin-password" placeholder="Enter admin password">
                    </div>
                    <div class="form-group">
                        <label for="show-password" class="checkbox-label">
                            <input type="checkbox" id="show-password">
                            <span>Show password</span>
                        </label>
                    </div>
                    <button type="button" id="admin-login-submit">Login</button>
                </form>
                <div id="admin-login-message" class="form-message" style="display: none;"></div>
            </div>
        `;

        document.body.appendChild(adminLoginModal);

        // Show modal when button clicked
        adminLoginBtn.addEventListener('click', function () {
            adminLoginModal.style.display = 'flex';
        });

        // Close modal functionality
        const closeModal = adminLoginModal.querySelector('.close-modal');
        closeModal.addEventListener('click', function () {
            adminLoginModal.style.display = 'none';
        });

        // Show/hide password
        const showPasswordCheck = document.getElementById('show-password');
        const passwordInput = document.getElementById('admin-password');

        if (showPasswordCheck && passwordInput) {
            showPasswordCheck.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        }

        // Handle admin login form submission
        const adminLoginSubmit = document.getElementById('admin-login-submit');
        const adminLoginMessage = document.getElementById('admin-login-message');

        if (adminLoginSubmit) {
            adminLoginSubmit.addEventListener('click', function (e) {
                e.preventDefault();

                const password = passwordInput.value.trim();

                if (password === "Mayank#123") {
                    localStorage.setItem('isAdmin', 'true');

                    if (adminLoginMessage) {
                        adminLoginMessage.className = 'form-message success';
                        adminLoginMessage.innerHTML = '<i class="fas fa-check-circle"></i> Hii, Mitthu Kumar Mayank! Logged in successfully.';
                        adminLoginMessage.style.display = 'block';
                    }

                    setTimeout(() => {
                        adminLoginModal.style.display = 'none';
                        addAdminControls();
                    }, 1500);
                } else {
                    if (adminLoginMessage) {
                        adminLoginMessage.className = 'form-message error';
                        adminLoginMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Incorrect password.';
                        adminLoginMessage.style.display = 'block';

                        setTimeout(() => {
                            adminLoginMessage.style.display = 'none';
                        }, 3000);
                    }
                }
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', function (e) {
            if (e.target === adminLoginModal) {
                adminLoginModal.style.display = 'none';
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
            const timeAgo = window.getTimeAgo ? window.getTimeAgo(new Date(comment.created_at)) : '';

            commentsHTML += `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">${safeName}</div>
                    <div class="comment-date">${window.formatDate ? window.formatDate(comment.created_at) : new Date(comment.created_at).toLocaleString()} <span class="time-ago">${timeAgo ? `(${timeAgo})` : ''}</span></div>
                </div>
                <div class="comment-content">${safeContent}</div>
                <div class="comment-actions">
                    <button class="like-btn" data-comment-id="${comment.id}">
                        <i class="fas fa-heart"></i> 
                        <span class="like-count" data-comment-id="${comment.id}">0</span>
                    </button>
                    <button class="reply-btn" data-comment-id="${comment.id}" data-author="${safeName}">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                </div>
                <div class="replies-container" data-parent-id="${comment.id}"></div>
            </div>
            `;
        });

        commentsList.innerHTML = commentsHTML;

        // Add event listeners for likes and replies
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                handleLike(this.dataset.commentId);
            });

            // Initialize like counts
            updateLikeCount(btn.dataset.commentId);
        });

        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                addReplyForm(this.dataset.commentId, this.dataset.author);
            });
        });

        // Fetch and display replies for each comment
        commentsArray.forEach(comment => {
            fetchReplies(comment.id);
        });

        // Add admin controls
        addAdminControls();
    }

    // Fetch replies for a comment
    function fetchReplies(commentId) {
        const repliesContainer = document.querySelector(`.replies-container[data-parent-id="${commentId}"]`);
        if (!repliesContainer) return;

        const repliesRef = window.firebase.ref(`replies/${postId}/${commentId}`);

        window.firebase.get(repliesRef).then((snapshot) => {
            if (snapshot.exists()) {
                const replies = snapshot.val();

                // Convert to array and sort
                const repliesArray = Object.keys(replies).map(id => {
                    return { ...replies[id], id };
                });

                repliesArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                // Build HTML for replies
                let repliesHTML = '';
                repliesArray.forEach(reply => {
                    const safeName = escapeHTML(reply.name);
                    const safeContent = escapeHTML(reply.content);
                    const timeAgo = window.getTimeAgo ? window.getTimeAgo(new Date(reply.created_at)) : '';

                    repliesHTML += `
                    <div class="comment reply" data-reply-id="${reply.id}" data-parent-id="${commentId}">
                        <div class="comment-header">
                            <div class="comment-author">${safeName}</div>
                            <div class="comment-date">${window.formatDate ? window.formatDate(reply.created_at) : new Date(reply.created_at).toLocaleString()} <span class="time-ago">${timeAgo ? `(${timeAgo})` : ''}</span></div>
                        </div>
                        <div class="comment-content">${safeContent}</div>
                    </div>
                    `;
                });

                repliesContainer.innerHTML = repliesHTML;

                // Add delete buttons to replies if admin
                addAdminControls();
            }
        }).catch(error => {
            console.error("Error fetching replies:", error);
        });
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

    // Handle comment form submission - FIXED: Changed to click handler and removed form submission
    if (commentForm) {
        const submitBtn = commentForm.querySelector('button[type="submit"]');

        // Convert the submit button to a regular button to prevent form submission
        if (submitBtn) {
            submitBtn.type = "button";

            submitBtn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log("Comment button clicked");

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
        }

        // Prevent default form submission which causes the 405 error
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Form submission prevented");
            return false;
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

    // Add admin login form to the DOM
    addAdminLoginForm();

    // Determine post ID
    let postId = determinePostId();
    console.log("Using post ID:", postId);

    // Track if we're in reply mode
    let replyingToComment = null;

    // Safely escape HTML to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Add delete buttons to comments if admin
    function addAdminControls() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (isAdmin) {
            const comments = document.querySelectorAll('.comment');
            comments.forEach(comment => {
                if (!comment.querySelector('.delete-comment-btn')) {
                    const commentHeader = comment.querySelector('.comment-header');
                    if (commentHeader) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete-comment-btn';
                        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                        deleteBtn.title = "Delete comment";

                        if (comment.dataset.replyId) {
                            deleteBtn.dataset.replyId = comment.dataset.replyId;
                            deleteBtn.dataset.parentId = comment.dataset.parentId;

                            deleteBtn.addEventListener('click', function () {
                                deleteReply(this.dataset.parentId, this.dataset.replyId);
                            });
                        } else {
                            deleteBtn.dataset.commentId = comment.dataset.commentId;

                            deleteBtn.addEventListener('click', function () {
                                deleteComment(this.dataset.commentId);
                            });
                        }

                        commentHeader.appendChild(deleteBtn);
                    }
                }
            });
        }
    }

    // Delete a comment function
    // Delete a comment function
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

                // Also delete all replies to this comment
                database.ref(`replies/${postId}/${commentId}`).remove().catch(error => {
                    console.error("Error deleting replies:", error);
                });

                // Also delete all likes for this comment
                database.ref(`likes/${postId}/${commentId}`).remove().catch(error => {
                    console.error("Error deleting likes:", error);
                });
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

    // Delete a reply
    function deleteReply(parentId, replyId) {
        if (!parentId || !replyId) {
            console.error("Missing parent ID or reply ID for deletion");
            return;
        }

        console.log("Deleting reply:", replyId);

        database.ref(`replies/${postId}/${parentId}/${replyId}`).remove()
            .then(() => {
                console.log("Reply deleted successfully");
                if (commentMessage) {
                    commentMessage.className = 'form-message success';
                    commentMessage.innerHTML = '<i class="fas fa-check-circle"></i> Reply deleted successfully.';
                    commentMessage.style.display = 'block';

                    setTimeout(() => {
                        commentMessage.style.display = 'none';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error("Error deleting reply:", error);
                if (commentMessage) {
                    commentMessage.className = 'form-message error';
                    commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to delete reply.';
                    commentMessage.style.display = 'block';
                }
            });
    }

    // Add reply form under a comment
    function addReplyForm(commentId, authorName) {
        // Remove any existing reply forms
        const existingForm = document.querySelector('.reply-form-container');
        if (existingForm) {
            existingForm.remove();
        }

        // Find the comment
        const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
        if (!comment) return;

        // Create reply form
        const replyFormContainer = document.createElement('div');
        replyFormContainer.className = 'reply-form-container';

        replyFormContainer.innerHTML = `
        <form class="reply-form">
            <div class="form-group">
                <label for="reply-name" class="required-field">Name</label>
                <input type="text" id="reply-name" placeholder="Your name" required>
                <i class="fas fa-user input-icon"></i>
            </div>
            <div class="form-group">
                <label for="reply-email" class="required-field">Email</label>
                <input type="email" id="reply-email" placeholder="Your email" required>
                <i class="fas fa-envelope input-icon"></i>
                <div class="form-text">Your email won't be published</div>
            </div>
            <div class="form-group">
                <label for="reply-content" class="required-field">Reply to ${escapeHTML(authorName)}</label>
                <textarea id="reply-content" placeholder="Your reply..." required></textarea>
                <i class="fas fa-comment input-icon"></i>
            </div>
            <div id="reply-message" class="form-message" style="display: none;"></div>
            <div class="reply-actions">
                <button type="button" class="submit-reply-btn"><i class="fas fa-reply"></i> Post Reply</button>
                <button type="button" class="cancel-reply-btn"><i class="fas fa-times"></i> Cancel</button>
            </div>
        </form>
    `;

        // Insert after the comment
        comment.after(replyFormContainer);

        // Set global state
        replyingToComment = commentId;

        // Add event listeners
        const submitButton = replyFormContainer.querySelector('.submit-reply-btn');
        const cancelButton = replyFormContainer.querySelector('.cancel-reply-btn');

        submitButton.addEventListener('click', handleReplySubmit);
        cancelButton.addEventListener('click', () => {
            replyFormContainer.remove();
            replyingToComment = null;
        });

        // Focus name field
        replyFormContainer.querySelector('#reply-name').focus();
    }

    // Handle reply form submission
    function handleReplySubmit() {
        const nameInput = document.getElementById('reply-name');
        const emailInput = document.getElementById('reply-email');
        const contentInput = document.getElementById('reply-content');
        const replyMessage = document.getElementById('reply-message');

        if (!nameInput || !emailInput || !contentInput) {
            console.error("Required reply form fields missing");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const content = contentInput.value.trim();

        // Form validation
        if (!name || !email || !content) {
            if (replyMessage) {
                replyMessage.className = 'form-message error';
                replyMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill all required fields.';
                replyMessage.style.display = 'block';
            }
            return;
        }

        // Create reply object
        const newReply = {
            name,
            email,
            content,
            created_at: new Date().toISOString(),
            parent_id: replyingToComment,
            post_id: postId
        };

        // Save reply to Firebase
        database.ref(`replies/${postId}/${replyingToComment}`).push(newReply)
            .then(() => {
                console.log("Reply saved successfully");

                if (replyMessage) {
                    replyMessage.className = 'form-message success';
                    replyMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your reply has been posted!';
                    replyMessage.style.display = 'block';

                    setTimeout(() => {
                        document.querySelector('.reply-form-container').remove();
                        replyingToComment = null;
                    }, 2000);
                }
            })
            .catch(error => {
                console.error("Error saving reply:", error);

                if (replyMessage) {
                    replyMessage.className = 'form-message error';
                    replyMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to post reply. Please try again.';
                    replyMessage.style.display = 'block';
                }
            });
    }

    // Handle comment like
    function handleLike(commentId) {
        const likeButton = document.querySelector(`.like-btn[data-comment-id="${commentId}"]`);
        if (!likeButton) return;

        // Generate a unique user ID (simple implementation - in production use proper authentication)
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }

        // Check if already liked
        const likeRef = database.ref(`likes/${postId}/${commentId}/${userId}`);

        likeRef.once('value').then((snapshot) => {
            if (snapshot.exists()) {
                // User already liked, so unlike
                likeRef.remove().then(() => {
                    console.log("Like removed");
                    likeButton.classList.remove('liked');
                    updateLikeCount(commentId);
                });
            } else {
                // Add new like
                likeRef.set(true).then(() => {
                    console.log("Like added");
                    likeButton.classList.add('liked');
                    updateLikeCount(commentId);
                });
            }
        }).catch(error => {
            console.error("Error toggling like:", error);
        });
    }

    // Update like count for a comment
    function updateLikeCount(commentId) {
        const likesRef = database.ref(`likes/${postId}/${commentId}`);
        const likeCountElem = document.querySelector(`.like-count[data-comment-id="${commentId}"]`);

        if (likeCountElem) {
            likesRef.once('value').then((snapshot) => {
                const likeCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                likeCountElem.textContent = likeCount;

                // Check if current user liked this comment
                let userId = localStorage.getItem('user_id');
                if (userId && snapshot.exists() && snapshot.val()[userId]) {
                    document.querySelector(`.like-btn[data-comment-id="${commentId}"]`)
                        .classList.add('liked');
                }
            });
        }
    }

    // Add admin login form to the page
    function addAdminLoginForm() {
        const adminLoginBtn = document.getElementById('admin-login-btn');
        if (!adminLoginBtn) return;

        // Create modal for admin login
        const adminLoginModal = document.createElement('div');
        adminLoginModal.id = 'admin-login-modal';
        adminLoginModal.className = 'admin-login-modal';
        adminLoginModal.style.display = 'none';

        adminLoginModal.innerHTML = `
        <div class="admin-login-content">
            <span class="close-modal">&times;</span>
            <h3>Admin Login</h3>
            <form id="admin-login-form">
                <div class="form-group">
                    <label for="admin-password">Password</label>
                    <input type="password" id="admin-password" placeholder="Enter admin password">
                </div>
                <div class="form-group">
                    <label for="show-password" class="checkbox-label">
                        <input type="checkbox" id="show-password">
                        <span>Show password</span>
                    </label>
                </div>
                <button type="button" id="admin-login-submit">Login</button>
            </form>
            <div id="admin-login-message" class="form-message" style="display: none;"></div>
        </div>
    `;

        document.body.appendChild(adminLoginModal);

        // Show modal when button clicked
        adminLoginBtn.addEventListener('click', function () {
            adminLoginModal.style.display = 'flex';
        });

        // Close modal functionality
        const closeModal = adminLoginModal.querySelector('.close-modal');
        closeModal.addEventListener('click', function () {
            adminLoginModal.style.display = 'none';
        });

        // Show/hide password
        const showPasswordCheck = document.getElementById('show-password');
        const passwordInput = document.getElementById('admin-password');

        if (showPasswordCheck && passwordInput) {
            showPasswordCheck.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        }

        // Handle admin login form submission
        const adminLoginSubmit = document.getElementById('admin-login-submit');
        const adminLoginMessage = document.getElementById('admin-login-message');

        if (adminLoginSubmit) {
            adminLoginSubmit.addEventListener('click', function (e) {
                e.preventDefault();

                const password = passwordInput.value.trim();

                if (password === "Mayank#123") {
                    localStorage.setItem('isAdmin', 'true');

                    if (adminLoginMessage) {
                        adminLoginMessage.className = 'form-message success';
                        adminLoginMessage.innerHTML = '<i class="fas fa-check-circle"></i> Hii, Mitthu Kumar Mayank! Logged in successfully.';
                        adminLoginMessage.style.display = 'block';
                    }

                    setTimeout(() => {
                        adminLoginModal.style.display = 'none';
                        addAdminControls();
                    }, 1500);
                } else {
                    if (adminLoginMessage) {
                        adminLoginMessage.className = 'form-message error';
                        adminLoginMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Incorrect password.';
                        adminLoginMessage.style.display = 'block';

                        setTimeout(() => {
                            adminLoginMessage.style.display = 'none';
                        }, 3000);
                    }
                }
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', function (e) {
            if (e.target === adminLoginModal) {
                adminLoginModal.style.display = 'none';
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
            const timeAgo = window.getTimeAgo ? window.getTimeAgo(new Date(comment.created_at)) : '';

            commentsHTML += `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author">${safeName}</div>
                <div class="comment-date">${window.formatDate ? window.formatDate(comment.created_at) : new Date(comment.created_at).toLocaleString()} <span class="time-ago">${timeAgo ? `(${timeAgo})` : ''}</span></div>
            </div>
            <div class="comment-content">${safeContent}</div>
            <div class="comment-actions">
                <button class="like-btn" data-comment-id="${comment.id}">
                    <i class="fas fa-heart"></i> 
                    <span class="like-count" data-comment-id="${comment.id}">0</span>
                </button>
                <button class="reply-btn" data-comment-id="${comment.id}" data-author="${safeName}">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
            <div class="replies-container" data-parent-id="${comment.id}"></div>
        </div>
        `;
        });

        commentsList.innerHTML = commentsHTML;

        // Add event listeners for likes and replies
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                handleLike(this.dataset.commentId);
            });

            // Initialize like counts
            updateLikeCount(btn.dataset.commentId);
        });

        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                addReplyForm(this.dataset.commentId, this.dataset.author);
            });
        });

        // Fetch and display replies for each comment
        commentsArray.forEach(comment => {
            fetchReplies(comment.id);
        });

        // Add admin controls
        addAdminControls();
    }

    // Fetch replies for a comment
    function fetchReplies(commentId) {
        const repliesContainer = document.querySelector(`.replies-container[data-parent-id="${commentId}"]`);
        if (!repliesContainer) return;

        database.ref(`replies/${postId}/${commentId}`).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const replies = snapshot.val();

                // Convert to array and sort
                const repliesArray = Object.keys(replies).map(id => {
                    return { ...replies[id], id };
                });

                repliesArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                // Build HTML for replies
                let repliesHTML = '';
                repliesArray.forEach(reply => {
                    const safeName = escapeHTML(reply.name);
                    const safeContent = escapeHTML(reply.content);
                    const timeAgo = window.getTimeAgo ? window.getTimeAgo(new Date(reply.created_at)) : '';

                    repliesHTML += `
                <div class="comment reply" data-reply-id="${reply.id}" data-parent-id="${commentId}">
                    <div class="comment-header">
                        <div class="comment-author">${safeName}</div>
                        <div class="comment-date">${window.formatDate ? window.formatDate(reply.created_at) : new Date(reply.created_at).toLocaleString()} <span class="time-ago">${timeAgo ? `(${timeAgo})` : ''}</span></div>
                    </div>
                    <div class="comment-content">${safeContent}</div>
                </div>
                `;
                });

                repliesContainer.innerHTML = repliesHTML;

                // Add delete buttons to replies if admin
                addAdminControls();
            }
        }).catch(error => {
            console.error("Error fetching replies:", error);
        });
    }

    // Fetch comments from Firebase using v8 legacy API
    function fetchComments() {
        console.log("Fetching comments for post:", postId);

        // Show loading
        if (loadingComments) {
            loadingComments.style.display = 'block';
        }

        // Set up listener for comments
        database.ref(`comments/${postId}`).on('value',
            (snapshot) => {
                console.log("Comments received from Firebase:", snapshot.val());
                displayComments(snapshot.val());
            },
            (error) => {
                console.error("Error fetching comments:", error);
                showErrorMessage("Unable to load comments. Please try again later.");
            }
        );
    }

    // Call fetchComments to load comments initially
    fetchComments();

    // Handle comment form submission - FIXED: Changed to click handler
    if (commentForm) {
        const submitBtn = commentForm.querySelector('button[type="submit"]');

        // Convert the submit button to a regular button to prevent form submission
        if (submitBtn) {
            submitBtn.type = "button";

            submitBtn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log("Comment button clicked");

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

                // Add to Firebase using legacy v8 API
                database.ref(`comments/${postId}`).push(newComment)
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
        }

        // Prevent default form submission which causes the 405 error
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Form submission prevented");
            return false;
        });
    }
}

// Initialize comment system when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Helper functions for date formatting if not already defined
    window.formatDate = window.formatDate || function (dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    window.getTimeAgo = window.getTimeAgo || function (date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";

        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";

        return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
    };

    initializeCommentSystem();
});