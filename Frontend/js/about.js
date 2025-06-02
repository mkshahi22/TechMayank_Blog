document.addEventListener('DOMContentLoaded', function () {
    // -------- MOBILE MENU FUNCTIONALITY --------
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });

        // Mobile dropdown toggle
        const dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            const dropdownLink = dropdown.querySelector('a');

            if (window.innerWidth <= 768 && dropdownLink) {
                dropdownLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                });
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!event.target.closest('nav') && !event.target.closest('.mobile-menu-btn')) {
                navLinks.classList.remove('active');
            }
        });
    }

    // -------- SCROLL EFFECTS --------
    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        const header = document.getElementById('main-header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // -------- HERO ANIMATION --------
    // Hero content animation on load
    const heroContent = document.querySelector('.about-hero-content');
    if (heroContent) {
        setTimeout(function () {
            heroContent.classList.add('animate');
        }, 300);
    }

    // -------- SKILLS ANIMATION --------
    const animateSkills = function () {
        document.querySelectorAll('.skill-card').forEach((card, index) => {
            const skillPercentage = card.getAttribute('data-skill') + '%';
            const delay = 300 + (index * 150);

            setTimeout(() => {
                card.classList.add('animate');
                setTimeout(() => {
                    const skillBar = card.querySelector('.skill-bar');
                    if (skillBar) {
                        skillBar.style.width = skillPercentage;
                    }
                }, 300);
            }, delay);
        });
    };

    // -------- COUNTER ANIMATION --------
    const animateCounters = function () {
        const counters = document.querySelectorAll('.counter-value');
        const speed = 200; // Lower = faster

        counters.forEach(counter => {
            counter.parentElement.classList.add('animate');

            const target = parseInt(counter.getAttribute('data-count'));
            let count = 0;

            const updateCount = setInterval(() => {
                const increment = target / speed;
                count += Math.ceil(increment);

                if (count >= target) {
                    counter.innerText = target.toLocaleString();
                    clearInterval(updateCount);
                } else {
                    counter.innerText = Math.floor(count).toLocaleString();
                }
            }, 10);
        });
    };

    // -------- SET INDICES FOR STAGGERED ANIMATIONS --------
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.setProperty('--index', index);
    });

    document.querySelectorAll('.fun-card').forEach((item, index) => {
        item.style.setProperty('--index', index);
    });

    document.querySelectorAll('.value-item').forEach((item, index) => {
        item.style.setProperty('--index', index);
    });

    // -------- INTERSECTION OBSERVER FOR ANIMATIONS --------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('skills-container')) {
                    animateSkills();
                } else if (entry.target.classList.contains('counter-section')) {
                    animateCounters();
                } else if (
                    entry.target.classList.contains('project-card') ||
                    entry.target.classList.contains('timeline-item') ||
                    entry.target.classList.contains('fun-card') ||
                    entry.target.classList.contains('value-item') ||
                    entry.target.classList.contains('about-content') ||
                    entry.target.classList.contains('about-image')
                ) {
                    entry.target.classList.add('animate');
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    // -------- OBSERVE ELEMENTS FOR ANIMATION --------
    // Observe section containers
    const elementsToObserve = [
        '.skills-container',
        '.counter-section',
        '.about-content',
        '.about-image'
    ];

    elementsToObserve.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            observer.observe(element);
        }
    });

    // Observe individual elements
    const individualElements = document.querySelectorAll(
        '.project-card, .timeline-item, .fun-card, .value-item'
    );

    individualElements.forEach(element => {
        observer.observe(element);
    });

    // -------- HOVER EFFECTS --------
    // Timeline hover effects
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('mouseover', function () {
            const timelineContent = this.querySelector('.timeline-content');
            if (timelineContent) {
                timelineContent.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
            }
        });

        item.addEventListener('mouseout', function () {
            const timelineContent = this.querySelector('.timeline-content');
            if (timelineContent) {
                timelineContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }
        });
    });

    // Skill hover effects
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mouseover', function () {
            const skillBar = this.querySelector('.skill-bar');
            if (skillBar) {
                skillBar.style.backgroundColor = '#2ecc71';
            }
        });

        card.addEventListener('mouseout', function () {
            const skillBar = this.querySelector('.skill-bar');
            if (skillBar) {
                skillBar.style.backgroundColor = '';
            }
        });
    });

    // Mission card hover effects
    document.querySelectorAll('.mission-card').forEach(card => {
        card.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#f8fdff';
        });

        card.addEventListener('mouseout', function () {
            this.style.backgroundColor = '#fff';
        });
    });

    // Project card hover effects
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.2}s`;

        card.addEventListener('mouseenter', function () {
            this.querySelectorAll('.project-tag').forEach((tag, index) => {
                tag.style.transitionDelay = `${0.1 + (index * 0.1)}s`;
            });
        });

        card.addEventListener('mouseleave', function () {
            this.querySelectorAll('.project-tag').forEach(tag => {
                tag.style.transitionDelay = '0s';
            });
        });
    });

    // -------- BUTTON RIPPLE EFFECT --------
    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;

            let ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(function () {
                ripple.remove();
            }, 600);
        });
    });

    // -------- NEWSLETTER FORM HANDLING --------
    const form = document.querySelector('.newsletter-form');
    const formSuccess = document.getElementById('form-success');

    if (form && formSuccess) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Simulate form submission - in real implementation, you'd submit to Netlify
            setTimeout(function () {
                form.style.display = 'none';
                formSuccess.style.display = 'block';
            }, 1000);
        });
    }
});