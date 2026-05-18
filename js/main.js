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
    var animatedSelectors = [
        '.program-card',
        '.why-card',
        '.philosophy-item',
        '.review-card',
        '.achievement-card',
        '.credential',
        '.about-highlight',
        '.fide-highlight'
    ].join(', ');

    var animatedEls = document.querySelectorAll(animatedSelectors);

    animatedEls.forEach(function (el) {
        el.classList.add('fade-up');
    });

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, idx) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        entry.target.classList.add('visible');
                    }, idx * 60);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

        animatedEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        /* Fallback for older browsers */
        animatedEls.forEach(function (el) { el.classList.add('visible'); });
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

    /* ===== COUNTER ANIMATION (Stats Strip) ===== */
    var counters = document.querySelectorAll('.strip-num[data-target]');
    var counterStarted = false;

    function animateCounters() {
        if (counterStarted) return;
        var strip = document.querySelector('.stats-strip');
        if (!strip) return;
        var rect = strip.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            counterStarted = true;
            counters.forEach(function (counter) {
                var target = parseInt(counter.getAttribute('data-target'));
                var duration = 1800;
                var step = target / (duration / 16);
                var current = 0;
                var timer = setInterval(function () {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 16);
            });
        }
    }
    window.addEventListener('scroll', animateCounters, { passive: true });
    animateCounters();

    /* ===== INIT ===== */
    handleScroll();

})();
