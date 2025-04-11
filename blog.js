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

    // COMMENT SYSTEM FUNCTIONALITY
    // Check if comment elements exist before initializing
    const commentForm = document.querySelector('.comment-form');

    // Fixed: Use querySelector for a class instead of getElementById
    const commentsList = document.querySelector('.comments-list');

    if (commentForm && commentsList) {
        const commentMessage = document.getElementById('comment-message');
        // Fixed: Use querySelector instead of getElementById for loading comments
        const loadingComments = document.querySelector('.loading-comments');
        const commentCount = document.getElementById('comment-count');

        // Get post ID from meta tag or data attribute
        // Fixed: Better handling of the post ID acquisition
        const postIdElement = document.querySelector('[data-post-id]');
        const postId = postIdElement ? postIdElement.getAttribute('data-post-id') : 'building-accessible-first';

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

        // Function to display comments
        function displayComments(comments) {
            if (loadingComments) {
                loadingComments.style.display = 'none';
            }

            if (comments.length === 0) {
                commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>';
                if (commentCount) commentCount.textContent = '0';
                return;
            }

            if (commentCount) commentCount.textContent = comments.length;

            // Sort comments by date (newest first)
            comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            let commentsHTML = '';
            comments.forEach(comment => {
                // Escape user input to prevent XSS
                const safeName = escapeHTML(comment.name);
                const safeContent = escapeHTML(comment.content);

                commentsHTML += `
                <div class="comment">
                    <div class="comment-header">
                        <div class="comment-author">${safeName}</div>
                        <div class="comment-date">${formatDate(comment.created_at)}</div>
                    </div>
                    <div class="comment-content">${safeContent}</div>
                </div>
            `;
            });

            commentsList.innerHTML = commentsHTML;
        }

        // Function to fetch comments using localStorage
        function fetchComments() {
            try {
                let comments = localStorage.getItem(`comments-${postId}`);

                if (comments) {
                    comments = JSON.parse(comments);
                    displayComments(comments);
                } else {
                    // Initialize with empty array if no comments exist
                    localStorage.setItem(`comments-${postId}`, JSON.stringify([]));
                    displayComments([]);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
                commentsList.innerHTML = '<div class="no-comments">Unable to load comments. Please try again later.</div>';
            }
        }

        // Fetch comments on page load
        fetchComments();

        // Handle comment form submission
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();

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

            // Basic validation
            if (!name || !email || !content) {
                if (commentMessage) {
                    commentMessage.className = 'form-message error';
                    commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';
                    commentMessage.style.display = 'block';
                }
                return;
            }

            // In a production environment, this would go to Netlify Forms
            // For demo purposes, we'll store in localStorage
            const newComment = {
                name: name,
                email: email,
                content: content,
                created_at: new Date().toISOString(),
                post_id: postId
            };

            try {
                // Get existing comments
                let comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];

                // Add new comment
                comments.push(newComment);

                // Save updated comments
                localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));

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

                // Refresh comments display
                fetchComments();

                // Fixed: Use querySelector to find the comments list for scrolling
                const commentsListElement = document.querySelector('.comments-list');

                // Scroll to the comments list if it exists
                if (commentsListElement) {
                    setTimeout(() => {
                        commentsListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 500);
                }

            } catch (error) {
                console.error('Error saving comment:', error);
                if (commentMessage) {
                    commentMessage.className = 'form-message error';
                    commentMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem posting your comment. Please try again.';
                    commentMessage.style.display = 'block';
                }
            }
        });
    }

    // Subscription form functionality
    const newsletterForm = document.querySelector('form[name="newsletter"]');
    const formSuccess = document.getElementById('form-success');

    if (newsletterForm && formSuccess) {
        newsletterForm.addEventListener('submit', function (e) {
            // For demo purposes, prevent the actual form submission
            // In production, you would let Netlify handle this
            e.preventDefault();

            const emailInput = newsletterForm.querySelector('input[name="email"]');
            if (emailInput && emailInput.value.trim()) {
                // Show success message
                formSuccess.style.display = 'block';

                // Clear form
                newsletterForm.reset();

                // Hide success message after delay
                setTimeout(() => {
                    formSuccess.style.display = 'none';
                }, 5000);
            }
        });
    }
});