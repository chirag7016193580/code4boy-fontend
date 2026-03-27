/* ============================================
   Code4Boy - Ultra Advanced GSAP Animations v10.0
   Cinematic loader, split-text reveals, magnetic buttons,
   scrub parallax, horizontal scroll, morphing shapes,
   scroll-velocity text, smooth section transitions
   ============================================ */

(function () {
  'use strict';

  // Wait for GSAP to load
  if (typeof gsap === 'undefined') return;

  // Register plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Global config
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ ease: 'power3.out', duration: 1 });

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  /* ============================================
     CUSTOM CURSOR
     ============================================ */
  function initCustomCursor() {
    if (window.innerWidth < 768) return;

    const cursor = document.createElement('div');
    cursor.className = 'c4b-cursor';
    cursor.innerHTML = '<div class="c4b-cursor-dot"></div><div class="c4b-cursor-ring"></div>';
    document.body.appendChild(cursor);

    const dot = cursor.querySelector('.c4b-cursor-dot');
    const ring = cursor.querySelector('.c4b-cursor-ring');

    let mouseX = -100, mouseY = -100;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth cursor follow with GSAP
    gsap.ticker.add(function () {
      gsap.set(dot, { x: mouseX, y: mouseY });
      gsap.to(ring, { x: mouseX, y: mouseY, duration: 0.15, ease: 'power2.out' });
    });

    // Hover effects on interactive elements
    var interactiveEls = document.querySelectorAll('a, button, .card, .project-card, .tool-card, .category-card, .download-card, .roadmap-card, .stat-card, .faq-question, input, textarea');
    interactiveEls.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.classList.add('hover');
        dot.classList.add('hover');
      });
      el.addEventListener('mouseleave', function () {
        ring.classList.remove('hover');
        dot.classList.remove('hover');
      });
    });

    // Click effect
    document.addEventListener('mousedown', function () {
      ring.classList.add('click');
      dot.classList.add('click');
    });
    document.addEventListener('mouseup', function () {
      ring.classList.remove('click');
      dot.classList.remove('click');
    });
  }

  /* ============================================
     CINEMATIC LOADER SEQUENCE
     ============================================ */
  function initCinematicLoader() {
    var loader = document.querySelector('.loader');
    if (!loader) return;

    var loaderLogo = loader.querySelector('.loader-logo');
    var loaderBar = loader.querySelector('.loader-bar-fill');
    var loaderText = loader.querySelector('.loader-text');

    var tl = gsap.timeline({
      onComplete: function () {
        // Reveal page with dramatic effect
        gsap.to(loader, {
          clipPath: 'circle(0% at 50% 50%)',
          duration: 1.2,
          ease: 'power4.inOut',
          onComplete: function () {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
            // Trigger hero entrance after loader
            initHeroEntrance();
          }
        });
      }
    });

    if (loaderLogo) {
      tl.fromTo(loaderLogo,
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
      );
    }

    if (loaderBar) {
      tl.to(loaderBar, { width: '100%', duration: 1.5, ease: 'power2.inOut' }, '-=0.5');
    }

    if (loaderText) {
      tl.fromTo(loaderText,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=1.2'
      );
    }

    // Pulsing glow on logo
    if (loaderLogo) {
      gsap.to(loaderLogo, {
        boxShadow: '0 0 60px rgba(0, 212, 255, 0.6), 0 0 120px rgba(139, 92, 246, 0.3)',
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'sine.inOut'
      });
    }
  }

  /* ============================================
     HERO ENTRANCE - Epic reveal
     ============================================ */
  function initHeroEntrance() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var badge = hero.querySelector('.hero-badge');
    var h1 = hero.querySelector('h1');
    var desc = hero.querySelector('.hero-desc');
    var buttons = hero.querySelector('.hero-buttons');
    var statsGrid = hero.querySelector('.hero-stats-grid');
    var shapes = hero.querySelectorAll('.hero-float-shape');

    // Kill any existing CSS animations on these elements
    if (h1) h1.style.animation = 'none';
    if (desc) desc.style.animation = 'none';
    if (buttons) buttons.style.animation = 'none';
    if (badge) badge.style.animation = 'none';

    var tl = gsap.timeline({ delay: 0.2 });

    // Floating shapes morph in
    if (shapes.length) {
      tl.fromTo(shapes,
        { scale: 0, opacity: 0, rotation: -90 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.5, stagger: 0.15, ease: 'elastic.out(1, 0.5)' },
        0
      );
    }

    // Badge slides in
    if (badge) {
      tl.fromTo(badge,
        { opacity: 0, y: -30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
        0.2
      );
    }

    // H1 - split text character reveal
    if (h1) {
      var gradientText = h1.querySelector('.gradient-text');
      var glowText = h1.querySelector('.glow-text');

      tl.fromTo(h1,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: 'power4.out' },
        0.4
      );

      // Gradient text shimmer
      if (gradientText) {
        tl.fromTo(gradientText,
          { backgroundSize: '200% 200%', backgroundPosition: '200% 50%' },
          { backgroundPosition: '0% 50%', duration: 1.5, ease: 'power2.inOut' },
          0.8
        );
      }

      // Glow text pulse
      if (glowText) {
        tl.fromTo(glowText,
          { textShadow: '0 0 0px rgba(0,212,255,0)' },
          { textShadow: '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)', duration: 1 },
          1.0
        );
      }
    }

    // Description fade up
    if (desc) {
      tl.fromTo(desc,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.7
      );
    }

    // Buttons - stagger with bounce
    if (buttons) {
      var btns = buttons.querySelectorAll('a, button');
      tl.fromTo(btns,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)' },
        0.9
      );
    }

    // Stats grid - stagger cascade
    if (statsGrid) {
      var statCards = statsGrid.querySelectorAll('.stat-card');
      tl.fromTo(statCards,
        { opacity: 0, y: 50, scale: 0.85, rotationX: 15 },
        { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.4)' },
        0.6
      );
    }
  }

  /* ============================================
     MAGNETIC BUTTONS
     ============================================ */
  function initMagneticButtons() {
    if (window.innerWidth < 768) return;

    var magneticEls = document.querySelectorAll('.btn-primary, .btn-secondary, .social-link, .nav-search-btn, .theme-toggle, .back-to-top');

    magneticEls.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    });
  }

  /* ============================================
     SCROLL-TRIGGERED SECTION REVEALS
     ============================================ */
  function initSectionReveals() {
    var sections = document.querySelectorAll('.section');

    sections.forEach(function (section) {
      var header = section.querySelector('.section-header');
      var badge = section.querySelector('.section-badge');
      var title = section.querySelector('.section-title');
      var desc = section.querySelector('.section-desc');
      var neonLine = section.querySelector('.neon-line');

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none none'
        }
      });

      // Badge entrance
      if (badge) {
        tl.fromTo(badge,
          { opacity: 0, scale: 0.5, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' },
          0
        );
      }

      // Title with clip-path reveal
      if (title) {
        tl.fromTo(title,
          { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.out' },
          0.15
        );
      }

      // Description
      if (desc) {
        tl.fromTo(desc,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.3
        );
      }

      // Neon line expand
      if (neonLine) {
        tl.fromTo(neonLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.out' },
          0.4
        );
      }
    });
  }

  /* ============================================
     ADVANCED CARD ANIMATIONS
     ============================================ */
  function initCardAnimations() {
    // Cards grid stagger
    var cardGrids = document.querySelectorAll('.cards-grid, .category-cards, .tools-grid, .download-grid, .video-grid, .security-grid');

    cardGrids.forEach(function (grid) {
      var cards = grid.children;

      gsap.fromTo(cards,
        {
          opacity: 0,
          y: 80,
          scale: 0.9,
          rotationY: 8
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Roadmap cards - sequential cascade
    var roadmapGrid = document.querySelector('.roadmap-grid');
    if (roadmapGrid) {
      var roadmapCards = roadmapGrid.querySelectorAll('.roadmap-card');
      roadmapCards.forEach(function (card, i) {
        gsap.fromTo(card,
          {
            opacity: 0,
            x: i % 2 === 0 ? -80 : 80,
            rotationY: i % 2 === 0 ? -10 : 10,
            scale: 0.85
          },
          {
            opacity: 1,
            x: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }
  }

  /* ============================================
     PARALLAX LAYERS WITH GSAP
     ============================================ */
  function initGSAPParallax() {
    if (window.innerWidth < 768) return;

    // Hero parallax layers
    var heroShapes = document.querySelectorAll('.hero-float-shape');
    heroShapes.forEach(function (shape, i) {
      gsap.to(shape, {
        y: function () { return (i + 1) * -80; },
        rotation: function () { return (i % 2 === 0 ? 1 : -1) * 15; },
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    // Section headers subtle parallax
    var sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(function (header) {
      gsap.fromTo(header,
        { y: 30 },
        {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: header,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2
          }
        }
      );
    });

    // Background grid parallax
    var bgGrid = document.querySelector('.bg-grid');
    if (bgGrid) {
      gsap.to(bgGrid, {
        backgroundPositionY: '200px',
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 3
        }
      });
    }
  }

  /* ============================================
     SMOOTH SCROLL PROGRESS WITH GSAP
     ============================================ */
  function initGSAPScrollProgress() {
    var progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) return;

    gsap.to(progressBar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
  }

  /* ============================================
     TESTIMONIALS SCROLL ANIMATION
     ============================================ */
  function initTestimonialAnimation() {
    var carousel = document.querySelector('.testimonials-carousel');
    if (!carousel) return;

    gsap.fromTo(carousel,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: carousel,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  /* ============================================
     FAQ ACCORDION GSAP ENHANCEMENT
     ============================================ */
  function initFAQAnimations() {
    var faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item, i) {
      gsap.fromTo(item,
        { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  /* ============================================
     NAVBAR SCROLL ANIMATION
     ============================================ */
  function initNavbarAnimation() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var navLinks = navbar.querySelectorAll('.nav-links li a');
    var navLogo = navbar.querySelector('.nav-logo');

    // Initial navbar entrance
    var tl = gsap.timeline({ delay: 0.5 });

    if (navLogo) {
      tl.fromTo(navLogo,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6 },
        0
      );
    }

    if (navLinks.length) {
      tl.fromTo(navLinks,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 },
        0.2
      );
    }

    // Hide/Show navbar on scroll direction
    var showAnim = gsap.from(navbar, {
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: 'power2.inOut'
    }).progress(1);

    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: function (self) {
        if (self.direction === -1) {
          showAnim.play();
        } else if (self.progress > 0.05) {
          showAnim.reverse();
        }
      }
    });
  }

  /* ============================================
     FLOATING SHAPES CONTINUOUS ANIMATION
     ============================================ */
  function initFloatingShapes() {
    var shapes = document.querySelectorAll('.hero-float-shape');

    shapes.forEach(function (shape, i) {
      // Continuous floating animation
      gsap.to(shape, {
        y: 'random(-30, 30)',
        x: 'random(-20, 20)',
        rotation: 'random(-10, 10)',
        duration: 'random(3, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5
      });

      // Scale breathing
      gsap.to(shape, {
        scale: 'random(0.9, 1.1)',
        duration: 'random(2, 4)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3
      });
    });
  }

  /* ============================================
     COUNTER ANIMATION WITH GSAP
     ============================================ */
  function initGSAPCounters() {
    var counters = document.querySelectorAll('.stat-number');

    counters.forEach(function (counter) {
      var end = parseInt(counter.getAttribute('data-count')) || 0;
      var suffix = counter.getAttribute('data-suffix') || '';
      var obj = { val: 0 };

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: end,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              counter.textContent = Math.floor(obj.val) + suffix;
            }
          });
        }
      });
    });
  }

  /* ============================================
     NEWSLETTER SECTION ANIMATION
     ============================================ */
  function initNewsletterAnimation() {
    var newsletter = document.querySelector('.newsletter-wrapper');
    if (!newsletter) return;

    gsap.fromTo(newsletter,
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
        boxShadow: '0 0 0 rgba(139, 92, 246, 0)'
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: '0 0 80px rgba(139, 92, 246, 0.15)',
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: newsletter,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  /* ============================================
     FOOTER REVEAL ANIMATION
     ============================================ */
  function initFooterAnimation() {
    var footer = document.querySelector('.footer');
    if (!footer) return;

    var footerCols = footer.querySelectorAll('.footer-col');
    var socialLinks = footer.querySelectorAll('.social-link');

    gsap.fromTo(footerCols,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );

    if (socialLinks.length) {
      gsap.fromTo(socialLinks,
        { opacity: 0, scale: 0, rotation: -180 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: socialLinks[0].parentElement,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }

  /* ============================================
     HOVER GLOW EFFECT ON CARDS
     ============================================ */
  function initCardGlowEffect() {
    if (window.innerWidth < 768) return;

    var glowCards = document.querySelectorAll('.card, .project-card, .tool-card, .category-card, .download-card, .stat-card, .security-feature-card');

    glowCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), 0 0 40px rgba(0, 212, 255, 0.1)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          boxShadow: '',
          borderColor: '',
          duration: 0.5,
          ease: 'power2.inOut',
          clearProps: 'boxShadow,borderColor'
        });
      });
    });
  }

  /* ============================================
     SMOOTH SCROLL TO SECTIONS
     ============================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          gsap.to(window, {
            scrollTo: { y: target, offsetY: 80 },
            duration: 1.2,
            ease: 'power3.inOut'
          });
        }
      });
    });
  }

  /* ============================================
     BACK TO TOP WITH GSAP
     ============================================ */
  function initGSAPBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    // Show/hide with GSAP
    ScrollTrigger.create({
      start: 400,
      onEnter: function () {
        gsap.to(btn, { opacity: 1, scale: 1, pointerEvents: 'all', duration: 0.4, ease: 'back.out(1.7)' });
      },
      onLeaveBack: function () {
        gsap.to(btn, { opacity: 0, scale: 0.5, pointerEvents: 'none', duration: 0.3 });
      }
    });

    btn.addEventListener('click', function () {
      gsap.to(window, { scrollTo: 0, duration: 1.5, ease: 'power3.inOut' });
    });
  }

  /* ============================================
     SKILL TRACKER BARS ANIMATION
     ============================================ */
  function initSkillBarsAnimation() {
    var skillCards = document.querySelectorAll('.skill-tracker-card');

    skillCards.forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  /* ============================================
     TEXT REVEAL ON SCROLL (Clip Path)
     ============================================ */
  function initTextReveal() {
    var highlights = document.querySelectorAll('.section-title .highlight');

    highlights.forEach(function (el) {
      gsap.fromTo(el,
        { backgroundSize: '0% 100%' },
        {
          backgroundSize: '200% 100%',
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  /* ============================================
     SCROLL VELOCITY TEXT MARQUEE
     ============================================ */
  function initScrollVelocityMarquee() {
    // Create marquee element
    var marqueeWrap = document.createElement('div');
    marqueeWrap.className = 'c4b-marquee-wrap';
    marqueeWrap.innerHTML = '<div class="c4b-marquee"><div class="c4b-marquee-content">' +
      '<span>HTML5</span><span class="dot-sep"></span>' +
      '<span>CSS3</span><span class="dot-sep"></span>' +
      '<span>JavaScript</span><span class="dot-sep"></span>' +
      '<span>Python</span><span class="dot-sep"></span>' +
      '<span>React</span><span class="dot-sep"></span>' +
      '<span>Node.js</span><span class="dot-sep"></span>' +
      '<span>AI Tools</span><span class="dot-sep"></span>' +
      '<span>Git</span><span class="dot-sep"></span>' +
      '<span>VS Code</span><span class="dot-sep"></span>' +
      '<span>ChatGPT</span><span class="dot-sep"></span>' +
      '</div><div class="c4b-marquee-content" aria-hidden="true">' +
      '<span>HTML5</span><span class="dot-sep"></span>' +
      '<span>CSS3</span><span class="dot-sep"></span>' +
      '<span>JavaScript</span><span class="dot-sep"></span>' +
      '<span>Python</span><span class="dot-sep"></span>' +
      '<span>React</span><span class="dot-sep"></span>' +
      '<span>Node.js</span><span class="dot-sep"></span>' +
      '<span>AI Tools</span><span class="dot-sep"></span>' +
      '<span>Git</span><span class="dot-sep"></span>' +
      '<span>VS Code</span><span class="dot-sep"></span>' +
      '<span>ChatGPT</span><span class="dot-sep"></span>' +
      '</div></div>';

    // Insert after hero
    var hero = document.querySelector('.hero');
    if (hero && hero.nextElementSibling) {
      hero.parentNode.insertBefore(marqueeWrap, hero.nextElementSibling);
    } else {
      return;
    }

    var marqueeContents = marqueeWrap.querySelectorAll('.c4b-marquee-content');
    var speed = 60; // pixels per second

    marqueeContents.forEach(function (content) {
      gsap.to(content, {
        xPercent: -100,
        repeat: -1,
        duration: speed,
        ease: 'none'
      });
    });

    // Speed up/slow down based on scroll velocity
    var currentVelocity = 1;
    ScrollTrigger.create({
      onUpdate: function (self) {
        var velocity = Math.abs(self.getVelocity()) / 300;
        var targetSpeed = Math.max(1, Math.min(velocity, 5));
        currentVelocity += (targetSpeed - currentVelocity) * 0.1;

        marqueeContents.forEach(function (content) {
          gsap.to(content, { timeScale: currentVelocity, duration: 0.3 });
        });
      }
    });
  }

  /* ============================================
     IRON HUD CORNERS ANIMATION
     ============================================ */
  function initHUDCorners() {
    var corners = document.querySelectorAll('.iron-hud-corner');
    if (!corners.length) return;

    gsap.fromTo(corners,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        delay: 2
      }
    );

    // Continuous subtle pulse
    corners.forEach(function (corner, i) {
      gsap.to(corner, {
        opacity: 0.3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5
      });
    });
  }

  /* ============================================
     SCROLL-TRIGGERED COLOR SHIFTS
     ============================================ */
  function initColorShifts() {
    var sections = document.querySelectorAll('.section');

    sections.forEach(function (section, i) {
      var hue = (i * 30) % 360;
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: function () {
          gsap.to('.bg-glow::before', {
            filter: 'hue-rotate(' + hue + 'deg)',
            duration: 1.5,
            ease: 'power2.inOut'
          });
        }
      });
    });
  }

  /* ============================================
     CHAT WIDGET ENTRANCE
     ============================================ */
  function initChatAnimation() {
    var chatToggle = document.querySelector('.chat-toggle');
    if (!chatToggle) return;

    gsap.fromTo(chatToggle,
      { scale: 0, rotation: -180 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        delay: 3,
        ease: 'elastic.out(1, 0.5)'
      }
    );
  }

  /* ============================================
     PLAYGROUND FAB ANIMATION
     ============================================ */
  function initPlaygroundFAB() {
    var fab = document.querySelector('.playground-fab');
    if (!fab) return;

    gsap.fromTo(fab,
      { scale: 0, rotation: -90 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        delay: 3.5,
        ease: 'back.out(1.7)'
      }
    );

    // Continuous attention pulse
    gsap.to(fab, {
      boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)',
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'sine.inOut',
      delay: 4
    });
  }

  /* ============================================
     ERROR CARDS ANIMATION
     ============================================ */
  function initErrorCardAnimations() {
    var errorCards = document.querySelectorAll('.error-card');
    if (!errorCards.length) return;

    var errorSection = document.querySelector('#errors');
    gsap.fromTo(errorCards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: errorSection || errorCards[0],
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  /* ============================================
     TRUST BAR ANIMATION
     ============================================ */
  function initTrustBarAnimation() {
    var trustBadges = document.querySelectorAll('.trust-badge-item');
    if (!trustBadges.length) return;

    gsap.fromTo(trustBadges,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: trustBadges[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  /* ============================================
     YOUTUBE VIDEO CARDS ANIMATION
     ============================================ */
  function initVideoCardAnimations() {
    var videoCards = document.querySelectorAll('.video-card');

    videoCards.forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, scale: 0.85, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  /* ============================================
     STAGGER REVEAL OVERRIDE (GSAP replaces CSS)
     ============================================ */
  function disableCSSAnimations() {
    // Remove CSS animation classes that conflict with GSAP
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function (el) {
      el.classList.add('visible');
      el.style.transitionDelay = '0s';
    });
  }

  /* ============================================
     INITIALIZE ALL ANIMATIONS
     ============================================ */
  function initAll() {
    disableCSSAnimations();
    // Disabled sci-fi effects:
    // initCustomCursor();
    // initCinematicLoader();
    // initFloatingShapes();
    // initHUDCorners();
    // initCardGlowEffect();
    // initTrustBarAnimation();
    // initColorShifts();
    // initScrollVelocityMarquee();

    // Keep functional animations only:
    initMagneticButtons();
    initSectionReveals();
    initCardAnimations();
    initGSAPScrollProgress();
    initTestimonialAnimation();
    initFAQAnimations();
    initNavbarAnimation();
    initGSAPCounters();
    initNewsletterAnimation();
    initFooterAnimation();
    initSmoothScroll();
    initGSAPBackToTop();
    initSkillBarsAnimation();
    initTextReveal();
    initChatAnimation();
    initPlaygroundFAB();
    initErrorCardAnimations();
    initVideoCardAnimations();

    // Skip loader - show page immediately
    var loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
      initHeroEntrance();
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
