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

    // UPDATED COMMENT SYSTEM FUNCTIONALITY - WITH FIREBASE INTEGRATION
    // Check if comment elements exist before initializing
    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');

    if (commentForm && commentsList) {
        console.log("Comment form and list found. Initializing comment system...");

        // First, check if Firebase scripts are loaded
        if (typeof firebase === 'undefined') {
            console.error("Firebase is not defined. Make sure to include Firebase scripts in your HTML.");

            // Add Firebase scripts dynamically if they're missing
            const firebaseAppScript = document.createElement('script');
            firebaseAppScript.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
            document.head.appendChild(firebaseAppScript);

            const firebaseDatabaseScript = document.createElement('script');
            firebaseDatabaseScript.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js";
            document.head.appendChild(firebaseDatabaseScript);

            // Wait for scripts to load
            firebaseDatabaseScript.onload = function () {
                initializeFirebase();
            };
        } else {
            initializeFirebase();
        }

        function initializeFirebase() {
            console.log("Initializing Firebase...");

            // Initialize Firebase (Add your Firebase config here)
            const firebaseConfig = {
                apiKey: "AIzaSyDyhGRHregnd4cGiACYZ41sV58AXyOlYY4",
                authDomain: "techmayank-3aa98.firebaseapp.com",
                projectId: "techmayank-3aa98",
                storageBucket: "techmayank-3aa98.firebasestorage.app",
                messagingSenderId: "339110129251",
                appId: "1:339110129251:web:d44f5bebace6c5bdc61256",
                measurementId: "G-8JNQLZ809S",
                // Add the database URL as it's required for the Realtime Database
                databaseURL: "https://techmayank-3aa98-default-rtdb.firebaseio.com/"
            };
            // Check if Firebase is already initialized
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                    console.log("Firebase initialized successfully");
                } else {
                    console.log("Firebase already initialized");
                }
            } catch (error) {
                console.error("Error initializing Firebase:", error);
                return;
            }

            // Make sure database module is available
            if (!firebase.database) {
                console.error("Firebase database module is not available");
                return;
            }

            // Get a reference to the database service
            const database = firebase.database();
            console.log("Database reference created");

            const commentMessage = document.getElementById('comment-message');
            const loadingComments = document.querySelector('.loading-comments');
            const commentCount = document.getElementById('comment-count');

            // Get post ID from meta tag or data attribute
            const postIdElement = document.querySelector('[data-post-id]');
            const postId = postIdElement ? postIdElement.getAttribute('data-post-id') : 'building-accessible-first';
            console.log("Using post ID:", postId);

            // Function to format date nicely
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

            // Function to safely escape HTML to prevent XSS
            function escapeHTML(str) {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            }

            // Function to add delete buttons to comments if admin
            function addDeleteButtons() {
                // Check if user is admin
                const isAdmin = localStorage.getItem('isAdmin') === 'true';

                if (isAdmin) {
                    // Add delete buttons to all comments
                    const comments = document.querySelectorAll('.comment');
                    comments.forEach(comment => {
                        // Check if delete button already exists
                        if (!comment.querySelector('.delete-comment-btn')) {
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = 'delete-comment-btn';
                            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                            deleteBtn.dataset.commentId = comment.dataset.commentId;

                            // Add button to comment header
                            const commentHeader = comment.querySelector('.comment-header');
                            if (commentHeader) {
                                commentHeader.appendChild(deleteBtn);
                            }

                            // Add click event to delete button
                            deleteBtn.addEventListener('click', function () {
                                deleteComment(this.dataset.commentId);
                            });
                        }
                    });
                }
            }

            // Function to delete a comment from Firebase
            function deleteComment(commentId) {
                try {
                    console.log("Deleting comment with ID:", commentId);
                    // Reference to the specific comment to delete
                    const commentRef = database.ref(`comments/${postId}/${commentId}`);

                    // Remove the comment
                    commentRef.remove()
                        .then(() => {
                            console.log("Comment deleted successfully");
                            // Show success message
                            if (commentMessage) {
                                commentMessage.className = 'form-message success';
                                commentMessage.innerHTML = '<i class="fas fa-check-circle"></i> Comment has been successfully removed.';
                                commentMessage.style.display = 'block';

                                // Hide message after delay
                                setTimeout(() => {
                                    commentMessage.style.display = 'none';
                                }, 3000);
                            }
                        })
                        .catch((error) => {
                            console.error('Error removing comment:', error);
                            if (commentMessage) {
                                commentMessage.className = 'form-message error';
                                commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem removing the comment. Please try again.';
                                commentMessage.style.display = 'block';
                            }
                        });
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    if (commentMessage) {
                        commentMessage.className = 'form-message error';
                        commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem removing the comment. Please try again.';
                        commentMessage.style.display = 'block';
                    }
                }
            }

            // Function to display comments
            function displayComments(comments) {
                console.log("Displaying comments:", comments);
                if (loadingComments) {
                    loadingComments.style.display = 'none';
                }

                if (!comments || Object.keys(comments).length === 0) {
                    commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>';
                    if (commentCount) commentCount.textContent = '0';
                    return;
                }

                if (commentCount) commentCount.textContent = Object.keys(comments).length;

                // Convert object to array for sorting
                let commentsArray = [];
                for (let id in comments) {
                    comments[id].id = id; // Add the Firebase key as an id property
                    commentsArray.push(comments[id]);
                }

                // Sort comments by date (newest first)
                commentsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                let commentsHTML = '';
                commentsArray.forEach(comment => {
                    // Escape user input to prevent XSS
                    const safeName = escapeHTML(comment.name);
                    const safeContent = escapeHTML(comment.content);

                    // Calculate time ago for comment
                    const timeAgo = getTimeAgo(new Date(comment.created_at));

                    commentsHTML += `
                    <div class="comment" data-comment-id="${comment.id}">
                        <div class="comment-header">
                            <div class="comment-author">${safeName}</div>
                            <div class="comment-date">${formatDate(comment.created_at)} <span class="time-ago">(${timeAgo})</span></div>
                            <!-- Delete button will be added here for admins -->
                        </div>
                        <div class="comment-content">${safeContent}</div>
                    </div>
                    `;
                });

                commentsList.innerHTML = commentsHTML;

                // Add delete buttons to comments if admin
                addDeleteButtons();
            }

            // Function to fetch comments from Firebase
            function fetchComments() {
                try {
                    console.log("Fetching comments for post:", postId);
                    // Show loading indicator
                    if (loadingComments) {
                        loadingComments.style.display = 'block';
                    }

                    // Reference to comments for this post
                    const commentsRef = database.ref(`comments/${postId}`);

                    // Listen for comments
                    commentsRef.on('value', (snapshot) => {
                        console.log("Comments data received from Firebase");
                        const comments = snapshot.val();
                        displayComments(comments);
                        updateCommentsTimeAgo(); // Update time ago for comments
                    }, (error) => {
                        console.error("Error fetching comments:", error);
                        commentsList.innerHTML = '<div class="no-comments">Unable to load comments. Please try again later.</div>';
                        if (loadingComments) {
                            loadingComments.style.display = 'none';
                        }
                    });
                } catch (error) {
                    console.error('Error setting up comments listener:', error);
                    commentsList.innerHTML = '<div class="no-comments">Unable to load comments. Please try again later.</div>';
                    if (loadingComments) {
                        loadingComments.style.display = 'none';
                    }
                }
            }

            // Fetch comments on page load
            fetchComments();

            // Handle comment form submission
            commentForm.addEventListener('submit', function (e) {
                e.preventDefault();
                console.log("Comment form submitted");

                const nameInput = document.getElementById('comment-name');
                const emailInput = document.getElementById('comment-email');
                const contentInput = document.getElementById('comment-content');

                if (!nameInput || !emailInput || !contentInput) {
                    console.error('Required form fields not found');
                    return;
                }

                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                const content = contentInput.value.trim();

                console.log("Form values:", { name, email, content });

                // Basic validation
                if (!name || !email || !content) {
                    console.log("Validation failed - missing fields");
                    if (commentMessage) {
                        commentMessage.className = 'form-message error';
                        commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';
                        commentMessage.style.display = 'block';
                    }
                    return;
                }

                // Create new comment object
                const newComment = {
                    name: name,
                    email: email,
                    content: content,
                    created_at: new Date().toISOString(),
                    post_id: postId
                };

                console.log("Saving new comment:", newComment);

                try {
                    // Get reference to the comments list for this post
                    const commentsRef = database.ref(`comments/${postId}`);

                    // Push the new comment to Firebase
                    commentsRef.push(newComment)
                        .then(() => {
                            console.log("Comment saved successfully");
                            // Show success message
                            if (commentMessage) {
                                commentMessage.className = 'form-message success';
                                commentMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for your comment! It has been posted.';
                                commentMessage.style.display = 'block';

                                // Hide message after a delay
                                setTimeout(() => {
                                    commentMessage.style.display = 'none';
                                }, 5000);
                            }

                            // Clear form
                            commentForm.reset();

                            // Scroll to the comments list
                            const commentsListElement = document.querySelector('.comments-list');
                            if (commentsListElement) {
                                setTimeout(() => {
                                    commentsListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 500);
                            }
                        })
                        .catch((error) => {
                            console.error('Error saving comment:', error);
                            if (commentMessage) {
                                commentMessage.className = 'form-message error';
                                commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem posting your comment. Please try again.';
                                commentMessage.style.display = 'block';
                            }
                        });
                } catch (error) {
                    console.error('Error saving comment:', error);
                    if (commentMessage) {
                        commentMessage.className = 'form-message error';
                        commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem posting your comment. Please try again.';
                        commentMessage.style.display = 'block';
                    }
                }
            });

            // Add admin login functionality
            const adminLoginBtn = document.getElementById('admin-login-btn');
            if (adminLoginBtn) {
                adminLoginBtn.addEventListener('click', function () {
                    const password = prompt('Enter admin password:');
                    // In production, you would use proper authentication
                    // This is just for demonstration purposes
                    if (password === 'Mayank#123') {
                        localStorage.setItem('isAdmin', 'true');
                        alert('Hii, Mitthu Kumar Mayank! You are now logged in as admin.');
                        // Add delete buttons to existing comments
                        addDeleteButtons();
                    } else {
                        alert('Incorrect password');
                    }
                });
            }
        }
    }

    // Call updateCommentsTimeAgo to apply time ago to comment dates
    updateCommentsTimeAgo();

    // Update comment times every minute
    setInterval(updateCommentsTimeAgo, 60000);
});