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

    // COMMENT SYSTEM WITH FIREBASE
    // Check if comment elements exist before initializing
    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');

    if (commentForm && commentsList) {
        console.log("Comment form and list found. Initializing comment system...");

        // Initialize comment system using Firebase v9 modular SDK if available
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
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            commentsList.innerHTML = `<div class="comments-error">${message}</div>`;
        }

        // Setup comment system with modular v9 Firebase API
        function setupCommentSystemModular() {
            console.log("Setting up comment system with modular Firebase v9");

            const commentMessage = document.getElementById('comment-message');
            const loadingComments = document.querySelector('.loading-comments');
            const commentCount = document.getElementById('comment-count');

            // Determine post ID
            let postId = determinePostId();
            console.log("Using post ID:", postId);

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
                    const password = prompt("Enter admin password:");

                    if (password === "Mayank#123") {
                        localStorage.setItem('isAdmin', 'true');
                        alert("Hii, Mitthu Kumar Mayank! You are now logged in as admin.");
                        addDeleteButtons();
                    } else {
                        alert("Incorrect password");
                    }
                });
            }
        }

        // Setup comment system with legacy v8 Firebase API
        function setupCommentSystemLegacy() {
            console.log("Setting up comment system with legacy Firebase v8");

            const database = firebase.database();
            const commentMessage = document.getElementById('comment-message');
            const loadingComments = document.querySelector('.loading-comments');
            const commentCount = document.getElementById('comment-count');

            // Determine post ID
            let postId = determinePostId();
            console.log("Using post ID:", postId);

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

            // Admin login functionality (continued)
            const adminLoginBtn = document.getElementById('admin-login-btn');
            if (adminLoginBtn) {
                adminLoginBtn.addEventListener('click', function () {
                    const password = prompt("Enter admin password:");

                    if (password === "Mayank#123") {
                        localStorage.setItem('isAdmin', 'true');
                        alert("Hii, Mitthu Kumar Mayank! You are now logged in as admin.");
                        addDeleteButtons();
                    } else {
                        alert("Incorrect password");
                    }
                });
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

        // Start the comment system initialization
        initializeCommentSystem();
    }

    // Call updateCommentsTimeAgo to apply time ago to comment dates
    updateCommentsTimeAgo();

    // Update comment times every minute
    setInterval(updateCommentsTimeAgo, 60000);
});