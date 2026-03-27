/* ============================================
   Code4Boy - Mobile Interactive Animations
   Touch-friendly animations, ripple effects,
   swipe gestures, and micro-interactions
   ============================================ */

(function () {
  'use strict';

  // Only run on mobile/touch devices
  if (window.innerWidth > 768) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ============================================
     TAP RIPPLE EFFECT
     Creates a beautiful ripple on tap
     ============================================ */
  function initTapRipple() {
    var rippleTargets = document.querySelectorAll(
      '.btn-primary, .btn-secondary, .btn-download, ' +
      '.card, .project-card, .tool-card, .category-card, ' +
      '.download-card, .roadmap-card, .stat-card, ' +
      '.faq-question, .skill-action-btn, .social-link, ' +
      '.nav-links li a, .tab-btn, .cookie-accept, .cookie-decline'
    );

    rippleTargets.forEach(function (el) {
      el.addEventListener('touchstart', function (e) {
        var rect = el.getBoundingClientRect();
        var touch = e.touches[0];
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;
        var size = Math.max(rect.width, rect.height) * 2;

        var ripple = document.createElement('span');
        ripple.className = 'mobile-ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';

        el.appendChild(ripple);

        setTimeout(function () {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 700);
      }, { passive: true });
    });
  }

  /* ============================================
     TOUCH GLOW ON CARDS
     Adds glow effect when touching cards
     ============================================ */
  function initTouchGlow() {
    var glowTargets = document.querySelectorAll(
      '.card, .project-card, .tool-card, .download-card, ' +
      '.roadmap-card, .error-card, .video-card, ' +
      '.security-feature-card, .why-card'
    );

    glowTargets.forEach(function (card) {
      card.addEventListener('touchstart', function () {
        card.classList.add('mobile-glow');
      }, { passive: true });

      card.addEventListener('touchend', function () {
        setTimeout(function () {
          card.classList.remove('mobile-glow');
        }, 300);
      }, { passive: true });

      card.addEventListener('touchcancel', function () {
        card.classList.remove('mobile-glow');
      }, { passive: true });
    });
  }

  /* ============================================
     SWIPE GESTURES FOR TESTIMONIALS
     Swipe left/right to navigate
     ============================================ */
  function initSwipeTestimonials() {
    var carousel = document.querySelector('.testimonials-carousel');
    if (!carousel) return;

    var startX = 0;
    var startY = 0;
    var threshold = 50;

    carousel.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;
      var diffX = endX - startX;
      var diffY = endY - startY;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        var nextBtn = carousel.querySelector('.testimonial-next, .next-btn');
        var prevBtn = carousel.querySelector('.testimonial-prev, .prev-btn');

        if (diffX < 0 && nextBtn) {
          // Swipe left = next
          nextBtn.click();
        } else if (diffX > 0 && prevBtn) {
          // Swipe right = prev
          prevBtn.click();
        }
      }
    }, { passive: true });
  }

  /* ============================================
     SCROLL-TRIGGERED ENTRANCE ANIMATIONS
     Smooth fade-in for cards as they enter viewport
     ============================================ */
  function initMobileScrollReveal() {
    var animateTargets = document.querySelectorAll(
      '.card, .project-card, .tool-card, .download-card, ' +
      '.roadmap-card, .error-card, .video-card, ' +
      '.security-feature-card, .why-card, .skill-tracker-card, ' +
      '.category-card, .stat-card, .faq-item'
    );

    if (!animateTargets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var parent = el.parentElement;
          var delay = 0;

          // Calculate stagger delay based on position among siblings
          if (parent) {
            var siblings = Array.from(parent.children).filter(function (child) {
              return child.matches('.card, .project-card, .tool-card, .download-card, ' +
                '.roadmap-card, .error-card, .video-card, .security-feature-card, ' +
                '.why-card, .skill-tracker-card, .category-card, .stat-card, .faq-item');
            });
            var idx = siblings.indexOf(el);
            delay = idx * 80;
          }

          setTimeout(function () {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
          }, delay);

          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    animateTargets.forEach(function (el) {
      // Set initial state
      el.style.opacity = '0';
      el.style.transform = 'translateY(25px) scale(0.97)';
      el.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(el);
    });
  }

  /* ============================================
     COUNTER ANIMATION ON MOBILE
     Animated number counting
     ============================================ */
  function initMobileCounters() {
    var counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var end = parseInt(el.getAttribute('data-count') || el.textContent.replace(/[^0-9]/g, ''));
          var suffix = el.textContent.replace(/[0-9]/g, '').trim();

          if (isNaN(end) || end === 0) return;

          var duration = 1500;
          var startTime = null;

          var animateCount = function(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current = Math.floor(eased * end);
            el.textContent = current + suffix;

            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              el.textContent = end + suffix;
            }
          }

          requestAnimationFrame(animateCount);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  /* ============================================
     TILT ON TOUCH (Subtle 3D card tilt)
     ============================================ */
  function initTouchTilt() {
    var tiltCards = document.querySelectorAll('.card, .project-card, .stat-card');

    tiltCards.forEach(function (card) {
      card.addEventListener('touchmove', function (e) {
        var touch = e.touches[0];
        var rect = card.getBoundingClientRect();
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = ((y - centerY) / centerY) * -4;
        var rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.01)';
        card.style.transition = 'transform 0.1s ease';
      }, { passive: true });

      card.addEventListener('touchend', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      }, { passive: true });

      card.addEventListener('touchcancel', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      }, { passive: true });
    });
  }

  /* ============================================
     HAPTIC FEEDBACK SIMULATION (Visual)
     Micro-bounce on buttons for tactile feel
     ============================================ */
  function initHapticFeedback() {
    var buttons = document.querySelectorAll(
      '.btn-primary, .btn-secondary, .btn-download, ' +
      '.social-link, .theme-toggle, .nav-search-btn, ' +
      '.back-to-top, .chat-toggle, .playground-fab'
    );

    buttons.forEach(function (btn) {
      btn.addEventListener('touchstart', function () {
        btn.style.transition = 'transform 0.1s ease';
        btn.style.transform = 'scale(0.94)';
      }, { passive: true });

      btn.addEventListener('touchend', function () {
        btn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btn.style.transform = 'scale(1)';
      }, { passive: true });
    });
  }

  /* ============================================
     PULL-DOWN INDICATOR (Visual bounce on scroll top)
     ============================================ */
  function initScrollBounce() {
    var lastScrollY = 0;
    var hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;

      // When at top and scrolling up, add subtle bounce
      if (scrollY === 0 && lastScrollY > 0) {
        hero.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        hero.style.transform = 'translateY(4px)';
        setTimeout(function () {
          hero.style.transform = 'translateY(0)';
        }, 150);
      }

      lastScrollY = scrollY;
    }, { passive: true });
  }

  /* ============================================
     SMOOTH SECTION TRANSITIONS
     Fade sections as they enter/leave viewport
     ============================================ */
  function initSectionFade() {
    var sections = document.querySelectorAll('.section');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -30px 0px'
    });

    sections.forEach(function (section) {
      // Skip sections already in viewport (e.g. very tall sections)
      var rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        return; // Already visible, don't hide it
      }
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(section);
    });
  }

  /* ============================================
     INITIALIZE ALL MOBILE ANIMATIONS
     ============================================ */
  function initAll() {
    // Wait a bit for page to settle
    setTimeout(function () {
      initTapRipple();
      initTouchGlow();
      initSwipeTestimonials();
      initMobileScrollReveal();
      initTouchTilt();
      initHapticFeedback();
      initScrollBounce();
      initSectionFade();
    }, 500);
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-init on orientation change
  window.addEventListener('orientationchange', function () {
    setTimeout(initAll, 500);
  });

})();
