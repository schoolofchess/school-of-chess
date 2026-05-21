/* ============================================================
   SCHOOL OF CHESS — Main JavaScript
   schoolofchess.org
   ============================================================ */

(function () {
    'use strict';

    /* ===== NAVBAR — scroll behaviour ===== */
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    function handleScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        highlightActiveNav();
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    /* ===== MOBILE MENU ===== */
    hamburger.addEventListener('click', function () {
        this.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    /* ===== ACTIVE NAV LINK on scroll ===== */
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navItems = Array.from(document.querySelectorAll('.nav-links a'));

    function highlightActiveNav() {
        var current = '';
        sections.forEach(function (sec) {
            if (window.scrollY >= sec.offsetTop - 140) {
                current = sec.getAttribute('id');
            }
        });
        navItems.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    }

    /* ===== SCROLL-REVEAL ANIMATIONS ===== */
    /* Elements that get individual stagger via CSS nth-child delays */
    var staggeredSelectors = [
        '.program-card',
        '.why-card',
        '.philosophy-item',
        '.review-card',
        '.achievement-card',
        '.credential',
        '.about-highlight',
        '.fide-highlight',
        '.blog-preview-card',
        '.faq-item',
    ].join(', ');

    /* Elements that reveal as a single unit */
    var singleSelectors = [
        '.section-header',
        '.about-text',
        '.about-subtitle',
        '.achievement-col-header',
        '.achievement-actions',
        '.programs-cta',
        '.blog-section-cta',
        '.fide-ratings-bar',
        '.enquiry-info h3',
        '.trial-benefits',
        '.contact-details',
        '.map-embed',
    ].join(', ');

    var allAnimated = document.querySelectorAll(staggeredSelectors + ', ' + singleSelectors);

    allAnimated.forEach(function (el) {
        el.classList.add('fade-up');
    });

    if ('IntersectionObserver' in window) {
        /* Group elements by their parent so stagger is per-visible-group not global */
        var revealObserver = new IntersectionObserver(function (entries) {
            /* Bucket entries by their parent grid/container for in-group stagger */
            var parentMap = {};
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var parentKey = entry.target.parentElement
                    ? (entry.target.parentElement.className || 'root')
                    : 'root';
                if (!parentMap[parentKey]) parentMap[parentKey] = [];
                parentMap[parentKey].push(entry.target);
            });

            Object.values(parentMap).forEach(function (group) {
                group.forEach(function (el, idx) {
                    /* Single elements reveal immediately; staggered elements get per-group delay */
                    var isStaggered = el.matches(staggeredSelectors);
                    var delay = isStaggered ? idx * 65 : 0;
                    setTimeout(function () {
                        el.classList.add('visible');
                    }, delay);
                    revealObserver.unobserve(el);
                });
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        allAnimated.forEach(function (el) { revealObserver.observe(el); });
    } else {
        /* Fallback for older browsers */
        allAnimated.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ===== ENQUIRY FORM — submit handler ===== */
    var form      = document.getElementById('enquiryForm');
    var submitBtn = document.getElementById('submitBtn');

    if (form && submitBtn) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var originalHTML = submitBtn.innerHTML;

            /* Basic validation */
            var mode = form.querySelector('input[name="mode"]:checked');
            if (!mode) {
                showFormMessage('Please select a preferred mode (Online / Offline / Both).', 'error');
                return;
            }

            /* Visual feedback */
            submitBtn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Sending…';
            submitBtn.disabled    = true;
            submitBtn.style.opacity = '0.85';

            /* Simulate submission (replace this setTimeout with real fetch/formspree/google-script) */
            setTimeout(function () {
                submitBtn.innerHTML       = '<i class="fas fa-check-circle"></i> Submitted! We\'ll contact you soon.';
                submitBtn.style.background = '#16a34a';
                submitBtn.style.opacity    = '1';

                showFormMessage('Thank you! We will reach you within 24 hours to schedule your free trial.', 'success');

                setTimeout(function () {
                    submitBtn.innerHTML        = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled         = false;
                    form.reset();
                    removeFormMessage();
                }, 5000);
            }, 1200);
        });
    }

    function showFormMessage(text, type) {
        removeFormMessage();
        var msg = document.createElement('div');
        msg.id          = 'formMessage';
        msg.textContent = text;
        msg.style.cssText = [
            'padding: 0.9rem 1.25rem',
            'border-radius: 10px',
            'font-size: 0.9rem',
            'font-weight: 500',
            'margin-top: 0.5rem',
            type === 'success'
                ? 'background: rgba(22,163,74,0.1); color: #15803d; border: 1px solid rgba(22,163,74,0.25);'
                : 'background: rgba(220,38,38,0.08); color: #dc2626; border: 1px solid rgba(220,38,38,0.2);'
        ].join(';');
        form.appendChild(msg);
    }

    function removeFormMessage() {
        var old = document.getElementById('formMessage');
        if (old) old.remove();
    }

    /* ===== SMOOTH ANCHOR OFFSET (fixed navbar) ===== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            var offset = navbar.offsetHeight + 12;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });

    /* ===== FAQ ACCORDION ===== */
    document.querySelectorAll('.faq-question').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = this.closest('.faq-item');
            var isOpen = item.classList.contains('open');
            /* Close all */
            document.querySelectorAll('.faq-item.open').forEach(function (el) {
                el.classList.remove('open');
                el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            /* Open clicked if it was closed */
            if (!isOpen) {
                item.classList.add('open');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ===== COUNTER ANIMATION — easeOut curve (Stats Strip) ===== */
    var counters = document.querySelectorAll('.strip-num[data-target]');
    var counterStarted = false;

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(counter, target, duration) {
        var startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed  = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased    = easeOutQuart(progress);
            counter.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                counter.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    function animateCounters() {
        if (counterStarted) return;
        var strip = document.querySelector('.stats-strip');
        if (!strip) return;
        var rect = strip.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            counterStarted = true;
            counters.forEach(function (counter) {
                var target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target, 1600);
            });
        }
    }
    window.addEventListener('scroll', animateCounters, { passive: true });
    animateCounters();

    /* ===== LAZY IMAGE — fade in on load ===== */
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function () {
                img.classList.add('loaded');
            });
        }
    });

    /* ===== INIT ===== */
    handleScroll();

})();
