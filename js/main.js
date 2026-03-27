/* ============================================
   Code4Boy - Main JavaScript v5.0
   UPGRADED: Security, smooth interactions, fixed navbar
   ============================================ */

// ============================================
// SECURITY MODULE
// ============================================
const Security = {
  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;', '`': '&#96;' };
    return input.replace(/[&<>"'\/`]/g, s => map[s]);
  },

  // Validate email format
  isValidEmail(email) {
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
  },

  // Validate URL format
  isValidURL(url) {
    try { new URL(url); return true; } catch { return false; }
  },

  // Generate CSRF token
  generateCSRFToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  },

  // Rate limiter
  _rateLimitStore: {},
  checkRateLimit(key, maxAttempts, windowMs) {
    const now = Date.now();
    if (!this._rateLimitStore[key]) {
      this._rateLimitStore[key] = { attempts: [], blocked: false, blockedUntil: 0 };
    }
    const store = this._rateLimitStore[key];

    if (store.blocked && now < store.blockedUntil) {
      const remaining = Math.ceil((store.blockedUntil - now) / 1000);
      return { allowed: false, remaining };
    }
    if (store.blocked && now >= store.blockedUntil) {
      store.blocked = false;
      store.attempts = [];
    }

    store.attempts = store.attempts.filter(t => now - t < windowMs);
    if (store.attempts.length >= maxAttempts) {
      store.blocked = true;
      store.blockedUntil = now + windowMs;
      return { allowed: false, remaining: Math.ceil(windowMs / 1000) };
    }
    store.attempts.push(now);
    return { allowed: true };
  },

  // SHA-256 hash (async)
  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Content Security - strip dangerous tags
  stripDangerousTags(html) {
    const dangerous = /<\s*(script|iframe|object|embed|form|link|meta|style|base)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>|<\s*(script|iframe|object|embed|form|link|meta|style|base)[^>]*\/?>/gi;
    return html.replace(dangerous, '');
  },

  // Validate input length
  validateLength(input, min, max) {
    if (typeof input !== 'string') return false;
    return input.length >= min && input.length <= max;
  }
};

// ============================================
// CSRF Token Management
// ============================================
(function initCSRF() {
  if (!sessionStorage.getItem('c4b-csrf-token')) {
    sessionStorage.setItem('c4b-csrf-token', Security.generateCSRFToken());
  }
})();

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavbar();
  initMoreDropdown();
  initMobileMenu();
  initThemeToggle();
  initSearchModal();
  initScrollReveal();
  // initParticles(); // Disabled - sci-fi effect
  initBackToTop();
  initCopyButtons();
  initErrorSearch();
  initCounterAnimation();
  initTabNavigation();
  initDownloadButtons();
  initContactForm();
  initAdminCustomizations();
  initSmoothHover();
  initCookieConsent();
  initFAQAccordion();
  initTestimonialsCarousel();
  initSkillsTracker();
  initNewsletterForm();
  initRoadmapInteraction();
  initScrollProgress();
  initLazyYouTube();
  initPageVisibility();
  initHeroTypingEffect();
  // initMouseGlow(); // Disabled - sci-fi effect
  // initParallaxScroll(); // Disabled - sci-fi effect
  // init3DTiltCards(); // Disabled - sci-fi effect
  initStaggeredReveal();
});

/* ============================================
   LOADER
   ============================================ */
function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 1500);
  });
  
  // Fallback
  setTimeout(() => {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }, 3000);
}

/* ============================================
   NAVBAR - Fixed and enhanced
   ============================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  let lastScroll = 0;
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Set active nav link - improved path detection
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    const hrefPage = href.split('/').pop().split('#')[0];
    
    // Remove any existing active class first
    link.classList.remove('active');
    
    // Match current page
    if (hrefPage === currentPage || 
        (currentPage === '' && hrefPage === 'index.html') ||
        (currentPage === 'index.html' && hrefPage === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============================================
   MORE DROPDOWN - Desktop navbar overflow fix
   ============================================ */
function initMoreDropdown() {
  const dropdown = document.querySelector('.nav-more-dropdown');
  const btn = document.querySelector('.nav-more-btn');
  if (!dropdown || !btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  // Close dropdown on any nav-more-menu link click
  const menuLinks = dropdown.querySelectorAll('.nav-more-menu a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ============================================
   MOBILE MENU - Fixed with proper close behavior
   ============================================ */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuToggle || !navLinks) return;
  
  // Toggle menu
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
  });
  
  // Close menu on link click
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });
  
  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && 
        !navLinks.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Close menu on resize if desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

/* ============================================
   THEME TOGGLE - Fixed icon rendering
   ============================================ */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  
  const savedTheme = localStorage.getItem('code4boy-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(toggle, savedTheme);
  
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('code4boy-theme', next);
    updateThemeIcon(toggle, next);
  });
}

function updateThemeIcon(toggle, theme) {
  if (theme === 'dark') {
    toggle.innerHTML = '<i class="fas fa-sun"></i> <span>Light</span>';
  } else {
    toggle.innerHTML = '<i class="fas fa-moon"></i> <span>Dark</span>';
  }
}

/* ============================================
   SEARCH MODAL
   ============================================ */
function initSearchModal() {
  const searchBtn = document.querySelector('.nav-search-btn');
  const searchModal = document.querySelector('.search-modal');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.querySelector('.search-modal-input');
  const searchResults = document.querySelector('.search-results');
  
  if (!searchBtn || !searchModal) return;
  
  const isSubPage = window.location.pathname.includes('/pages/');
  const prefix = isSubPage ? '' : 'pages/';
  const homePrefix = isSubPage ? '../' : '';

  const searchData = [
    { title: 'HTML Basics Tutorial', desc: 'Learn HTML from scratch', icon: '<i class="fab fa-html5" style="color:#ff6600"></i>', link: prefix + 'tutorials.html#html' },
    { title: 'CSS Styling Guide', desc: 'Master CSS styling techniques', icon: '<i class="fab fa-css3-alt" style="color:#0066ff"></i>', link: prefix + 'tutorials.html#css' },
    { title: 'JavaScript Fundamentals', desc: 'Learn JavaScript programming', icon: '<i class="fab fa-js-square" style="color:#f7df1e"></i>', link: prefix + 'tutorials.html#javascript' },
    { title: 'Python for Beginners', desc: 'Start coding in Python', icon: '<i class="fab fa-python" style="color:#00ff88"></i>', link: prefix + 'tutorials.html#python' },
    { title: 'AI Tools Guide', desc: 'Explore AI-powered coding tools', icon: '<i class="fas fa-robot" style="color:#8b00ff"></i>', link: prefix + 'tutorials.html#ai' },
    { title: 'Portfolio Website Project', desc: 'Build a portfolio with HTML/CSS', icon: '<i class="fas fa-globe" style="color:#e62429"></i>', link: prefix + 'projects.html' },
    { title: 'Calculator App', desc: 'JavaScript calculator project', icon: '<i class="fas fa-calculator" style="color:#ff6600"></i>', link: prefix + 'projects.html' },
    { title: 'Weather App', desc: 'API-based weather application', icon: '<i class="fas fa-cloud-sun" style="color:#f7df1e"></i>', link: prefix + 'projects.html' },
    { title: 'VS Code Setup', desc: 'Setup VS Code for coding', icon: '<i class="fas fa-code" style="color:#0098ff"></i>', link: prefix + 'tools.html' },
    { title: 'GitHub Copilot', desc: 'AI coding assistant', icon: '<i class="fas fa-robot" style="color:#8b00ff"></i>', link: prefix + 'tools.html' },
    { title: 'TS File Not Running', desc: 'Fix TypeScript file issues', icon: '<i class="fas fa-bug" style="color:#ff6600"></i>', link: prefix + 'errors.html' },
    { title: 'VLC No Audio Fix', desc: 'Fix VLC audio problems', icon: '<i class="fas fa-volume-mute" style="color:#e94560"></i>', link: prefix + 'errors.html' },
    { title: 'YouTube Videos', desc: 'Watch coding video tutorials', icon: '<i class="fab fa-youtube" style="color:#e62429"></i>', link: prefix + 'youtube.html' },
    { title: 'Free Code Templates', desc: 'Download free templates', icon: '<i class="fas fa-file-code" style="color:#e62429"></i>', link: prefix + 'downloads.html' },
    { title: 'Cheat Sheets', desc: 'Download coding cheat sheets', icon: '<i class="fas fa-file-alt" style="color:#00ff88"></i>', link: prefix + 'downloads.html' },
    { title: 'Contact Us', desc: 'Get in touch with Code4Boy', icon: '<i class="fas fa-envelope" style="color:#0066ff"></i>', link: homePrefix + 'index.html#contact' },
  ];
  
  searchBtn.addEventListener('click', () => {
    searchModal.classList.add('active');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    if (searchResults) searchResults.innerHTML = '';
  });
  
  if (searchClose) {
    searchClose.addEventListener('click', () => {
      searchModal.classList.remove('active');
    });
  }
  
  // Close on Escape / open on /
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') searchModal.classList.remove('active');
    if (e.key === '/' && !searchModal.classList.contains('active') && 
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) &&
        !document.activeElement.closest('.CodeMirror')) {
      e.preventDefault();
      searchModal.classList.add('active');
      if (searchInput) { searchInput.value = ''; searchInput.focus(); }
    }
  });
  
  // Close on backdrop click
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.classList.remove('active');
  });
  
  // Debounced search functionality with sanitization
  if (searchInput && searchResults) {
    var searchTimer = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const rawQuery = e.target.value.trim();
        const query = Security.sanitizeInput(rawQuery).toLowerCase();
        
        if (!query) {
          searchResults.innerHTML = '';
          return;
        }
        
        const filtered = searchData.filter(item => 
          item.title.toLowerCase().includes(rawQuery.toLowerCase()) || 
          item.desc.toLowerCase().includes(rawQuery.toLowerCase())
        );
        
        if (filtered.length === 0) {
          searchResults.innerHTML = '<div class="search-result-item"><div class="icon"><i class="fas fa-search"></i></div><div class="info"><h4>No results found</h4><p>Try searching with different keywords</p></div></div>';
          return;
        }
        
        searchResults.innerHTML = filtered.map(item => 
          '<a href="' + Security.sanitizeInput(item.link) + '" class="search-result-item"><div class="icon">' + item.icon + '</div><div class="info"><h4>' + Security.sanitizeInput(item.title) + '</h4><p>' + Security.sanitizeInput(item.desc) + '</p></div></a>'
        ).join('');
      }, 150);
    });

    // Keyboard navigation in search results
    searchInput.addEventListener('keydown', (e) => {
      const items = searchResults.querySelectorAll('.search-result-item');
      if (!items.length) return;
      const focused = searchResults.querySelector('.search-result-item:focus');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focused) {
          const next = focused.nextElementSibling;
          if (next) next.focus();
        } else {
          items[0].focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focused) {
          const prev = focused.previousElementSibling;
          if (prev) prev.focus(); else searchInput.focus();
        }
      }
    });
  }
}

/* ============================================
   SCROLL REVEAL - Enhanced with stagger v9.0
   ============================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add stagger delay for cards in a grid
        const parent = entry.target.parentElement;
        if (parent) {
          const siblings = parent.querySelectorAll('.reveal, .reveal-left, .reveal-right');
          const idx = Array.from(siblings).indexOf(entry.target);
          entry.target.style.transitionDelay = (idx * 0.12) + 's';
        }
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.06,
    rootMargin: '0px 0px -60px 0px'
  });
  
  reveals.forEach(el => observer.observe(el));
}

/* ============================================
   PARTICLES - Aurora v9.0
   ============================================ */
function initParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;
  
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  const particleCount = window.innerWidth < 768 ? 15 : 35;
  const colors = ['#8b5cf6', '#00d4ff', '#ec4899', '#10b981', '#f59e0b'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 12) + 's';
    const size = (Math.random() * 4 + 1) + 'px';
    particle.style.width = size;
    particle.style.height = size;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.boxShadow = '0 0 ' + (Math.random() * 6 + 2) + 'px ' + particle.style.background;
    container.appendChild(particle);
  }
}

/* ============================================
   BACK TO TOP
   ============================================ */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.pageYOffset > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================
   COPY CODE BUTTONS
   ============================================ */
function initCopyButtons() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-block');
      const code = codeBlock ? codeBlock.querySelector('code') : null;
      
      if (!code) return;
      
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = code.textContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

/* ============================================
   ERROR SEARCH
   ============================================ */
function initErrorSearch() {
  const searchInput = document.querySelector('.error-search-input');
  const errorCards = document.querySelectorAll('.error-card');
  
  if (!searchInput || !errorCards.length) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = Security.sanitizeInput(e.target.value).toLowerCase().trim();
    
    errorCards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      
      if (title.includes(query) || desc.includes(query) || !query) {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.3s ease';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const end = parseInt(target.getAttribute('data-count')) || 0;
        const suffix = target.getAttribute('data-suffix') || '';
        let current = 0;
        const increment = end / 60;
        const stepTime = 2000 / 60;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) {
            current = end;
            clearInterval(timer);
          }
          target.textContent = Math.floor(current) + suffix;
        }, stepTime);
        
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

/* ============================================
   TAB NAVIGATION
   ============================================ */
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  if (!tabBtns.length) return;
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const allContent = document.querySelectorAll('.tab-content');
      allContent.forEach(content => {
        if (content.getAttribute('data-tab') === target || target === 'all') {
          content.style.display = 'block';
          content.style.animation = 'fadeInUp 0.5s ease';
        } else {
          content.style.display = 'none';
        }
      });
    });
  });
}

/* ============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================ */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  
  const targetId = link.getAttribute('href');
  if (targetId === '#') return;
  
  const target = document.querySelector(targetId);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }
});

/* ============================================
   DOWNLOAD BUTTONS
   ============================================ */
function initDownloadButtons() {
  var isSubPage = window.location.pathname.includes('/pages/');
  var dlBase = isSubPage ? '../downloads/' : 'downloads/';
  
  var downloadMap = {
    'HTML/CSS Starter Template': dlBase + 'templates/starter-template.html',
    'Portfolio Template': dlBase + 'templates/portfolio-template.html',
    'Landing Page Template': dlBase + 'templates/landing-page-template.html',
    'E-commerce Template': dlBase + 'templates/ecommerce-template.html',
    'HTML5 Cheat Sheet': dlBase + 'cheatsheets/html5-cheatsheet.html',
    'CSS Flexbox & Grid Cheat Sheet': dlBase + 'cheatsheets/css-flexbox-grid-cheatsheet.html',
    'JavaScript ES6+ Cheat Sheet': dlBase + 'cheatsheets/javascript-cheatsheet.html',
    'JavaScript Cheat Sheet': dlBase + 'cheatsheets/javascript-cheatsheet.html',
    'Python Cheat Sheet': dlBase + 'cheatsheets/python-cheatsheet.html',
    'Git & GitHub Cheat Sheet': dlBase + 'cheatsheets/git-cheatsheet.html',
    'VS Code Shortcuts Cheat Sheet': dlBase + 'cheatsheets/vscode-shortcuts.html',
    'JavaScript Calculator': dlBase + 'projects/calculator.html',
    'Calculator App': dlBase + 'projects/calculator.html',
    'Todo App Starter': dlBase + 'projects/todo-app.html',
    'Todo App with Local Storage': dlBase + 'projects/todo-app.html',
    'Weather App Starter': dlBase + 'projects/weather-app.html',
    'Weather Dashboard': dlBase + 'projects/weather-app.html',
    'CSS Animation Pack': dlBase + 'projects/css-animations.html',
    'Personal Portfolio Website': dlBase + 'templates/portfolio-template.html',
    'Portfolio Website': dlBase + 'templates/portfolio-template.html',
  };

  document.querySelectorAll('.btn-download, .project-buttons .btn-primary').forEach(function(btn) {
    var card = btn.closest('.download-card') || btn.closest('.project-card') || btn.closest('.project-body');
    if (!card) return;
    
    var titleEl = card.querySelector('h3');
    if (!titleEl) return;
    
    var title = titleEl.textContent.trim();
    var filePath = downloadMap[title];
    
    if (filePath) {
      btn.removeAttribute('onclick');
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        triggerDownload(filePath, title);
      });
    } else {
      btn.removeAttribute('onclick');
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Coming soon! This resource will be available shortly.', 'info');
      });
    }
  });
}

function triggerDownload(filePath, fileName) {
  // Try cached ad settings first for instant response
  var adSettings = JSON.parse(localStorage.getItem('c4b-ad-settings') || 'null');
  if (adSettings && adSettings.enabled) {
    showInterstitialAd(adSettings, function() {
      performDownload(filePath, fileName);
    });
  } else {
    performDownload(filePath, fileName);
  }
}

function performDownload(filePath, fileName) {
  var a = document.createElement('a');
  a.href = filePath;
  a.download = filePath.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showNotification('Download started: ' + fileName, 'success');
}

function showInterstitialAd(adSettings, onComplete) {
  var duration = (adSettings.duration || 5) * 1000;
  var remaining = adSettings.duration || 5;

  var overlay = document.createElement('div');
  overlay.id = 'c4b-ad-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);animation:fadeIn 0.3s ease;';

  var adBox = document.createElement('div');
  adBox.style.cssText = 'background:var(--bg-card,#1a1f2e);border:1px solid var(--glass-border,rgba(255,255,255,0.08));border-radius:20px;max-width:480px;width:90%;padding:0;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.5);animation:scaleIn 0.3s ease;';

  var accentColor = adSettings.bgColor || '#1a73e8';

  var adHeader = document.createElement('div');
  adHeader.style.cssText = 'background:' + accentColor + ';padding:16px 24px;display:flex;align-items:center;justify-content:space-between;';
  adHeader.innerHTML = '<div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-ad" style="font-size:1.1rem;color:rgba(255,255,255,0.9);"></i><span style="font-weight:700;font-size:0.9rem;color:#fff;letter-spacing:0.5px;">' + Security.sanitizeInput(adSettings.title || 'Sponsored Content') + '</span></div><span id="c4b-ad-timer" style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:0.78rem;font-weight:600;color:#fff;">' + remaining + 's</span>';

  var adBody = document.createElement('div');
  adBody.style.cssText = 'padding:28px 24px;text-align:center;';

  var adIcon = document.createElement('div');
  adIcon.style.cssText = 'width:56px;height:56px;background:' + accentColor + '22;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;';
  adIcon.innerHTML = '<i class="fas fa-bullhorn" style="font-size:1.5rem;color:' + accentColor + ';"></i>';

  var adMsg = document.createElement('p');
  adMsg.style.cssText = 'color:var(--text-secondary,#9aa0a6);font-size:0.95rem;line-height:1.7;margin-bottom:20px;';
  adMsg.textContent = adSettings.message || 'Thank you for downloading! Check out our sponsors.';

  adBody.appendChild(adIcon);
  adBody.appendChild(adMsg);

  if (adSettings.link) {
    var adLink = document.createElement('a');
    adLink.href = adSettings.link;
    adLink.target = '_blank';
    adLink.rel = 'noopener noreferrer';
    adLink.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:10px 28px;background:' + accentColor + ';color:#fff;border-radius:30px;font-size:0.88rem;font-weight:600;text-decoration:none;transition:all 0.3s ease;box-shadow:0 4px 15px ' + accentColor + '40;';
    adLink.innerHTML = '<i class="fas fa-external-link-alt"></i> ' + Security.sanitizeInput(adSettings.linkText || 'Learn More');
    adBody.appendChild(adLink);
  }

  var adFooter = document.createElement('div');
  adFooter.style.cssText = 'padding:12px 24px 16px;text-align:center;border-top:1px solid var(--glass-border,rgba(255,255,255,0.06));';

  var progressBar = document.createElement('div');
  progressBar.style.cssText = 'height:3px;background:var(--glass-border,rgba(255,255,255,0.08));border-radius:3px;overflow:hidden;margin-bottom:10px;';
  var progressFill = document.createElement('div');
  progressFill.style.cssText = 'height:100%;background:' + accentColor + ';border-radius:3px;width:100%;transition:width ' + (duration / 1000) + 's linear;';
  progressBar.appendChild(progressFill);

  var skipBtn = document.createElement('button');
  skipBtn.id = 'c4b-ad-skip';
  skipBtn.style.cssText = 'background:none;border:1px solid var(--glass-border,rgba(255,255,255,0.1));color:var(--text-dim,#5f6368);padding:6px 20px;border-radius:20px;font-size:0.78rem;font-weight:500;cursor:not-allowed;opacity:0.5;transition:all 0.3s ease;';
  skipBtn.innerHTML = '<i class="fas fa-forward"></i> Skip in ' + remaining + 's';
  skipBtn.disabled = true;

  adFooter.appendChild(progressBar);
  adFooter.appendChild(skipBtn);

  adBox.appendChild(adHeader);
  adBox.appendChild(adBody);
  adBox.appendChild(adFooter);
  overlay.appendChild(adBox);
  document.body.appendChild(overlay);

  // Animate progress bar
  requestAnimationFrame(function() {
    progressFill.style.width = '0%';
  });

  // Countdown timer
  var timerEl = document.getElementById('c4b-ad-timer');
  var countdown = setInterval(function() {
    remaining--;
    if (timerEl) timerEl.textContent = remaining + 's';
    skipBtn.innerHTML = '<i class="fas fa-forward"></i> Skip in ' + remaining + 's';

    if (remaining <= 0) {
      clearInterval(countdown);
      skipBtn.disabled = false;
      skipBtn.style.cursor = 'pointer';
      skipBtn.style.opacity = '1';
      skipBtn.style.color = 'var(--text-primary,#e8eaed)';
      skipBtn.style.borderColor = accentColor;
      skipBtn.innerHTML = '<i class="fas fa-download"></i> Continue to Download';
    }
  }, 1000);

  function closeAd() {
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(function() {
      overlay.remove();
      if (onComplete) onComplete();
    }, 300);
  }

  skipBtn.addEventListener('click', function() {
    if (!skipBtn.disabled) closeAd();
  });

  // Auto-close after duration
  setTimeout(function() {
    clearInterval(countdown);
    closeAd();
  }, duration + 500);
}

function showNotification(message, type) {
  var existing = document.querySelector('.c4b-notification');
  if (existing) existing.remove();
  
  var notif = document.createElement('div');
  notif.className = 'c4b-notification';
  notif.setAttribute('role', 'alert');
  notif.setAttribute('aria-live', 'polite');
  var iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle';
  notif.innerHTML = '<i class="fas ' + iconClass + '"></i><span>' + Security.sanitizeInput(message) + '</span>';
  
  var borderColor = type === 'success' ? 'rgba(52,211,153,0.5)' : type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(56,189,248,0.5)';
  var bgColor = type === 'success' ? 'rgba(52,211,153,0.12)' : type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(56,189,248,0.12)';
  var iconColor = type === 'success' ? 'var(--neon-green)' : type === 'error' ? '#ef4444' : 'var(--neon-cyan)';
  
  notif.style.cssText = 'position:fixed;bottom:30px;right:30px;padding:16px 24px;background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:14px;color:var(--text-primary);font-family:var(--font-body);font-size:0.92rem;font-weight:500;display:flex;align-items:center;gap:10px;z-index:9999;backdrop-filter:blur(16px);box-shadow:0 10px 40px rgba(0,0,0,0.3);max-width:400px;';
  notif.querySelector('i').style.color = iconColor;
  
  document.body.appendChild(notif);
  
  setTimeout(function() {
    notif.style.animation = 'fadeOutDown 0.4s ease forwards';
    setTimeout(function() { notif.remove(); }, 400);
  }, 3500);
}

/* ============================================
   CONTACT FORM - Enhanced with security
   ============================================ */
function initContactForm() {
  document.querySelectorAll('.contact-form').forEach(function(form) {
    form.removeAttribute('onsubmit');
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Rate limiting - max 3 submissions per 5 minutes
      const rateCheck = Security.checkRateLimit('contact-form', 3, 300000);
      if (!rateCheck.allowed) {
        showNotification('Too many submissions. Please wait ' + rateCheck.remaining + ' seconds.', 'error');
        return;
      }

      // Honeypot check - if the hidden field is filled, it's a bot
      var honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        // Silently reject - don't alert bots
        form.reset();
        showNotification('Message sent successfully!', 'success');
        return;
      }
      
      var nameInput = form.querySelector('input[type="text"]:not([name="website"])');
      var emailInput = form.querySelector('input[type="email"]');
      var messageInput = form.querySelector('textarea');
      
      var name = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var message = messageInput ? messageInput.value.trim() : '';
      
      // Validation
      if (!name || !email || !message) {
        showNotification('Please fill in all fields.', 'error');
        return;
      }
      
      if (!Security.validateLength(name, 2, 100)) {
        showNotification('Name must be between 2 and 100 characters.', 'error');
        return;
      }
      
      if (!Security.isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
      }
      
      if (!Security.validateLength(message, 10, 2000)) {
        showNotification('Message must be between 10 and 2000 characters.', 'error');
        return;
      }
      
      // Sanitize inputs before storing
      var sanitizedName = Security.sanitizeInput(name);
      var sanitizedEmail = Security.sanitizeInput(email);
      var sanitizedMessage = Security.sanitizeInput(message);
      
      var messages = JSON.parse(localStorage.getItem('c4b-messages') || '[]');
      messages.push({ 
        name: sanitizedName, 
        email: sanitizedEmail, 
        message: sanitizedMessage, 
        date: new Date().toISOString(),
        csrf: sessionStorage.getItem('c4b-csrf-token')
      });
      localStorage.setItem('c4b-messages', JSON.stringify(messages));
      
      form.reset();
      showNotification('Message sent successfully! We will get back to you soon.', 'success');
    });
  });
}

/* ============================================
   ADMIN CUSTOMIZATIONS (Apply saved settings)
   ============================================ */
function initAdminCustomizations() {
  // First apply from localStorage (instant, cached)
  var localSettings = JSON.parse(localStorage.getItem('c4b-admin-settings') || '{}');
  applyAdminSettings(localSettings);

  // Apply website controls from localStorage cache
  var localControls = JSON.parse(localStorage.getItem('c4b-website-controls') || 'null');
  if (localControls) applyWebsiteControls(localControls);

  // Apply notifications from localStorage cache
  var localNotifs = JSON.parse(localStorage.getItem('c4b-notifications') || '[]');
  if (localNotifs.length > 0) applyNotifications(localNotifs);

  // Then fetch from server (for cross-device sync) and update
  var apiUrl = getApiBaseUrl();
  if (apiUrl && apiUrl !== '' && !apiUrl.includes('BACKEND_URL_HERE')) {
    // Fetch admin settings
    fetch(apiUrl + '/api/settings/admin-settings', { method: 'GET', mode: 'cors' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.status === 'ok' && data.data) {
          // Save server settings to localStorage as cache
          localStorage.setItem('c4b-admin-settings', JSON.stringify(data.data));
          // Re-apply with server data (authoritative)
          applyAdminSettings(data.data);
        }
      })
      .catch(function() {
        // Server unreachable - localStorage cache is used (already applied above)
      });

    // Fetch website controls
    fetch(apiUrl + '/api/settings/website-controls', { method: 'GET', mode: 'cors' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.status === 'ok' && data.data) {
          localStorage.setItem('c4b-website-controls', JSON.stringify(data.data));
          applyWebsiteControls(data.data);
        }
      })
      .catch(function() {});

    // Fetch notifications
    fetch(apiUrl + '/api/settings/notifications', { method: 'GET', mode: 'cors' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.status === 'ok' && data.data) {
          localStorage.setItem('c4b-notifications', JSON.stringify(data.data));
          applyNotifications(data.data);
        }
      })
      .catch(function() {});

    // Fetch ad settings
    fetch(apiUrl + '/api/settings/ad-settings', { method: 'GET', mode: 'cors' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.status === 'ok' && data.data) {
          localStorage.setItem('c4b-ad-settings', JSON.stringify(data.data));
        }
      })
      .catch(function() {});
  }
}

function applyAdminSettings(settings) {
  if (!settings || typeof settings !== 'object') return;

  if (settings.siteTitle) {
    document.querySelectorAll('.nav-logo span').forEach(function(el) {
      if (el.textContent === 'CODE4BOY' || el.dataset.adminManaged) {
        el.textContent = Security.sanitizeInput(settings.siteTitle);
        el.dataset.adminManaged = 'true';
      }
    });
    // Update page title
    document.title = Security.sanitizeInput(settings.siteTitle) + ' - Learn Coding Free';
  }
  
  if (settings.heroTagline) {
    var heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = Security.sanitizeInput(settings.heroTagline);
  }

  if (settings.faviconUrl) {
    var faviconLink = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if (faviconLink) {
      faviconLink.href = Security.sanitizeInput(settings.faviconUrl);
    } else {
      var newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = Security.sanitizeInput(settings.faviconUrl);
      document.head.appendChild(newFavicon);
    }
  }

  if (settings.logoUrl) {
    document.querySelectorAll('.nav-logo img, .footer-logo img').forEach(function(el) {
      el.src = Security.sanitizeInput(settings.logoUrl);
    });
  }

  if (settings.stats) {
    var statNumbers = document.querySelectorAll('.stat-number');
    if (settings.stats.tutorials && statNumbers[0]) statNumbers[0].setAttribute('data-count', parseInt(settings.stats.tutorials) || 50);
    if (settings.stats.projects && statNumbers[1]) statNumbers[1].setAttribute('data-count', parseInt(settings.stats.projects) || 25);
    if (settings.stats.errors && statNumbers[2]) statNumbers[2].setAttribute('data-count', parseInt(settings.stats.errors) || 100);
    if (settings.stats.students && statNumbers[3]) statNumbers[3].setAttribute('data-count', parseInt(settings.stats.students) || 10);
  }
  
  if (settings.social) {
    if (settings.social.youtube && Security.isValidURL(settings.social.youtube)) {
      document.querySelectorAll('a[href*="youtube"]').forEach(function(el) { el.href = settings.social.youtube; });
    }
    if (settings.social.github && Security.isValidURL(settings.social.github)) {
      document.querySelectorAll('a[href*="github.com/code4boy"]').forEach(function(el) { el.href = settings.social.github; });
    }
    if (settings.social.twitter && Security.isValidURL(settings.social.twitter)) {
      document.querySelectorAll('a[href*="twitter"]').forEach(function(el) { el.href = settings.social.twitter; });
    }
    if (settings.social.instagram && Security.isValidURL(settings.social.instagram)) {
      document.querySelectorAll('a[href*="instagram"]').forEach(function(el) { el.href = settings.social.instagram; });
    }
    if (settings.social.telegram && Security.isValidURL(settings.social.telegram)) {
      document.querySelectorAll('a[href*="telegram"], a[href*="t.me"]').forEach(function(el) { el.href = settings.social.telegram; });
    }
    if (settings.social.linkedin && Security.isValidURL(settings.social.linkedin)) {
      document.querySelectorAll('a[href*="linkedin"]').forEach(function(el) { el.href = settings.social.linkedin; });
    }
  }
  
  if (settings.accentColor) {
    // Validate color format
    if (/^#[0-9a-fA-F]{6}$/.test(settings.accentColor)) {
      document.documentElement.style.setProperty('--neon-cyan', settings.accentColor);
    }
  }
  
  if (settings.footerText) {
    var footerP = document.querySelector('.footer-bottom p');
    if (footerP) footerP.textContent = Security.sanitizeInput(settings.footerText);
  }

  // Apply SEO settings
  if (settings.seo) {
    if (settings.seo.metaDescription) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', Security.sanitizeInput(settings.seo.metaDescription));
    }
    if (settings.seo.metaKeywords) {
      var metaKw = document.querySelector('meta[name="keywords"]');
      if (metaKw) {
        metaKw.setAttribute('content', Security.sanitizeInput(settings.seo.metaKeywords));
      } else {
        var newMetaKw = document.createElement('meta');
        newMetaKw.name = 'keywords';
        newMetaKw.content = Security.sanitizeInput(settings.seo.metaKeywords);
        document.head.appendChild(newMetaKw);
      }
    }
  }
}

/* ============================================
   APPLY WEBSITE CONTROLS (Announcement, Maintenance)
   ============================================ */
function applyWebsiteControls(controls) {
  if (!controls || typeof controls !== 'object') return;

  // Announcement banner
  if (controls.announcement && controls.announcement.active && controls.announcement.text) {
    var existingBanner = document.getElementById('c4b-announcement-banner');
    if (!existingBanner) {
      var banner = document.createElement('div');
      banner.id = 'c4b-announcement-banner';
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:10000;padding:10px 20px;text-align:center;font-family:var(--font-body,Rajdhani,sans-serif);font-size:0.95rem;font-weight:600;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;';
      banner.style.backgroundColor = controls.announcement.color || '#f59e0b';
      banner.innerHTML = '<span>' + Security.sanitizeInput(controls.announcement.text) + '</span><button onclick="this.parentElement.remove();document.body.style.paddingTop=\'0\';" style="background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;margin-left:12px;">&times;</button>';
      document.body.prepend(banner);
      document.body.style.paddingTop = (banner.offsetHeight) + 'px';
    }
  }

  // Maintenance mode
  if (controls.maintenance && controls.maintenance.mode) {
    var maintenanceMsg = controls.maintenance.message || 'Website is under maintenance. We will be back soon!';
    var overlay = document.createElement('div');
    overlay.id = 'c4b-maintenance-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:var(--bg-primary,#060613);display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff;font-family:var(--font-body,Rajdhani,sans-serif);';
    overlay.innerHTML = '<i class="fas fa-tools" style="font-size:3rem;color:var(--neon-cyan,#00f0ff);margin-bottom:20px;"></i><h1 style="font-family:var(--font-heading,Orbitron,sans-serif);font-size:1.8rem;margin-bottom:12px;">Under Maintenance</h1><p style="color:var(--text-secondary,#8892b0);font-size:1.1rem;max-width:500px;text-align:center;">' + Security.sanitizeInput(maintenanceMsg) + '</p>';
    document.body.appendChild(overlay);
  }
}

/* ============================================
   APPLY NOTIFICATIONS (Show latest unread)
   ============================================ */
function applyNotifications(notifications) {
  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) return;

  // Check which notifications user already dismissed
  var dismissed = JSON.parse(localStorage.getItem('c4b-dismissed-notifs') || '[]');
  var unread = notifications.filter(function(n) { return dismissed.indexOf(n.id) === -1; });
  if (unread.length === 0) return;

  // Show latest unread notification as a toast
  var latest = unread[0];
  var typeColors = { info: '#00f0ff', success: '#00ff88', warning: '#f59e0b', error: '#ff4444' };
  var typeIcons = { info: 'info-circle', success: 'check-circle', warning: 'exclamation-triangle', error: 'times-circle' };
  var color = typeColors[latest.type] || '#00f0ff';
  var icon = typeIcons[latest.type] || 'bell';

  var notifEl = document.createElement('div');
  notifEl.id = 'c4b-notification-popup';
  notifEl.style.cssText = 'position:fixed;bottom:30px;right:30px;z-index:10001;background:rgba(13,16,37,0.95);border:1px solid ' + color + '33;border-radius:14px;padding:18px 22px;max-width:380px;backdrop-filter:blur(12px);animation:fadeInUp 0.4s ease;font-family:var(--font-body,Rajdhani,sans-serif);box-shadow:0 8px 32px rgba(0,0,0,0.4);';
  notifEl.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px;"><i class="fas fa-' + icon + '" style="color:' + color + ';font-size:1.3rem;margin-top:2px;"></i><div style="flex:1;"><div style="font-weight:700;color:#fff;font-size:1rem;margin-bottom:4px;">' + Security.sanitizeInput(latest.title) + '</div><div style="color:var(--text-secondary,#8892b0);font-size:0.9rem;">' + Security.sanitizeInput(latest.message) + '</div></div><button onclick="dismissNotification(\'' + latest.id + '\')" style="background:none;border:none;color:var(--text-dim,#555);font-size:1.1rem;cursor:pointer;padding:0;">&times;</button></div>';
  document.body.appendChild(notifEl);

  // Auto-dismiss after 8 seconds
  setTimeout(function() {
    var el = document.getElementById('c4b-notification-popup');
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(function() { if (el.parentNode) el.remove(); }, 300);
    }
  }, 8000);
}

function dismissNotification(id) {
  var dismissed = JSON.parse(localStorage.getItem('c4b-dismissed-notifs') || '[]');
  if (dismissed.indexOf(id) === -1) dismissed.push(id);
  localStorage.setItem('c4b-dismissed-notifs', JSON.stringify(dismissed));
  var el = document.getElementById('c4b-notification-popup');
  if (el) el.remove();
}

/* ============================================
   SMOOTH HOVER EFFECTS
   ============================================ */
function initSmoothHover() {
  // Add tilt effect on cards
  document.querySelectorAll('.card, .project-card, .tool-card, .download-card, .category-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
}

/* ============================================
   NOTIFICATION ANIMATION (now in CSS)
   ============================================ */

/* ============================================
   TYPEWRITER EFFECT (for hero)
   ============================================ */
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Initialize typewriter on hero subtitle if exists
const heroSubtitle = document.querySelector('.hero-typewriter');
if (heroSubtitle) {
  const text = heroSubtitle.getAttribute('data-text');
  if (text) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        typeWriter(heroSubtitle, text, 40);
        observer.unobserve(heroSubtitle);
      }
    });
    observer.observe(heroSubtitle);
  }
}

/* ============================================
   COOKIE CONSENT
   ============================================ */
function initCookieConsent() {
  var consent = localStorage.getItem('c4b-cookie-consent');
  var banner = document.getElementById('cookieConsent');
  if (!banner) return;

  if (!consent) {
    // Show banner after a short delay
    setTimeout(function() {
      banner.classList.add('visible');
    }, 1500);
  }
}

function acceptCookies() {
  localStorage.setItem('c4b-cookie-consent', 'accepted');
  var banner = document.getElementById('cookieConsent');
  if (banner) banner.classList.remove('visible');
}

function declineCookies() {
  localStorage.setItem('c4b-cookie-consent', 'declined');
  var banner = document.getElementById('cookieConsent');
  if (banner) banner.classList.remove('visible');
}

/* ============================================
   AI HELP AGENT (Code4Boy Chat)
   ============================================ */
var chatKnowledge = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'sup', 'hola'],
    response: "Hey there! Welcome to Code4Boy. I'm your coding assistant. Ask me about tutorials, projects, tools, or anything coding related!"
  },
  {
    keywords: ['start', 'begin', 'learning', 'beginner', 'new to coding', 'how to code', 'start coding'],
    response: "Great choice starting your coding journey! I recommend beginning with <strong>HTML & CSS</strong> to build web pages, then move to <strong>JavaScript</strong> for interactivity. Check our <a href='#tutorials' style='color:var(--neon-cyan)'>Tutorials section</a> for step-by-step guides. Start with 'HTML for Absolute Beginners'!"
  },
  {
    keywords: ['tutorial', 'tutorials', 'courses', 'lessons', 'learn'],
    response: "We offer tutorials in: <br>- <strong>HTML & CSS</strong> (Web fundamentals)<br>- <strong>JavaScript</strong> (Interactive sites)<br>- <strong>Python</strong> (Versatile language)<br>- <strong>AI Tools</strong> (ChatGPT, Copilot)<br>- <strong>Node.js</strong> (Backend development)<br>Scroll to our <a href='#tutorials' style='color:var(--neon-cyan)'>Tutorials section</a> to explore!"
  },
  {
    keywords: ['project', 'projects', 'build', 'portfolio', 'practice'],
    response: "We have awesome projects to build your portfolio:<br>- <strong>Portfolio Website</strong> (HTML/CSS)<br>- <strong>Calculator App</strong> (JavaScript)<br>- <strong>Weather App</strong> (API integration)<br>Check the <a href='#projects' style='color:var(--neon-cyan)'>Projects section</a> for full source code and instructions!"
  },
  {
    keywords: ['tool', 'tools', 'software', 'editor', 'ide', 'vscode'],
    response: "Here are essential free tools for developers:<br>- <strong>VS Code</strong> - Best code editor<br>- <strong>Git & GitHub</strong> - Version control<br>- <strong>Chrome DevTools</strong> - Debugging<br>- <strong>Figma</strong> - UI Design<br>Visit our <a href='#tools' style='color:var(--neon-cyan)'>Tools section</a> for the full list!"
  },
  {
    keywords: ['download', 'downloads', 'resource', 'resources', 'free', 'pdf', 'cheat sheet'],
    response: "We have free downloadable resources:<br>- <strong>HTML/CSS Starter Template</strong><br>- <strong>JavaScript Cheat Sheet</strong> (PDF)<br>- <strong>CSS Animation Pack</strong><br>- <strong>Python Starter Projects</strong><br>Head to the <a href='#downloads' style='color:var(--neon-cyan)'>Downloads section</a> to grab them!"
  },
  {
    keywords: ['error', 'bug', 'fix', 'debug', 'problem', 'issue', 'not working'],
    response: "Having an error? Here's how to debug:<br>1. <strong>Read the error message</strong> carefully<br>2. Check the <strong>browser console</strong> (F12)<br>3. Look for <strong>typos</strong> in your code<br>4. Search our <a href='#errors' style='color:var(--neon-cyan)'>Error Solutions</a> section<br>5. Try commenting out code to isolate the bug<br>Need more help? Describe your error and I'll try to assist!"
  },
  {
    keywords: ['html', 'web page', 'markup', 'tags'],
    response: "HTML is the foundation of web development! It uses tags like <code>&lt;div&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;h1&gt;</code> to structure content. Start with our <strong>HTML for Absolute Beginners</strong> tutorial. Key concepts: semantic HTML, forms, tables, and responsive layouts."
  },
  {
    keywords: ['css', 'style', 'design', 'layout', 'flexbox', 'grid', 'animation'],
    response: "CSS makes websites beautiful! Learn about:<br>- <strong>Flexbox & Grid</strong> for layouts<br>- <strong>Animations & transitions</strong><br>- <strong>Responsive design</strong> with media queries<br>- <strong>CSS variables</strong> for theming<br>Check our CSS tutorials and grab the <strong>CSS Animation Pack</strong> from Downloads!"
  },
  {
    keywords: ['javascript', 'js', 'script', 'function', 'variable', 'dom'],
    response: "JavaScript brings websites to life! Key topics:<br>- <strong>Variables & Data Types</strong><br>- <strong>Functions & Events</strong><br>- <strong>DOM Manipulation</strong><br>- <strong>APIs & Fetch</strong><br>- <strong>ES6+ Features</strong><br>Our JavaScript tutorials cover beginner to advanced concepts!"
  },
  {
    keywords: ['python', 'py', 'django', 'flask', 'data science'],
    response: "Python is perfect for beginners and pros! Use it for:<br>- <strong>Web development</strong> (Django/Flask)<br>- <strong>Data Science</strong> & Machine Learning<br>- <strong>Automation</strong> & scripting<br>- <strong>AI & ChatGPT</strong> integrations<br>Check our <strong>Python for Absolute Beginners</strong> tutorial!"
  },
  {
    keywords: ['ai', 'artificial intelligence', 'chatgpt', 'copilot', 'machine learning'],
    response: "AI is transforming coding! Learn about:<br>- <strong>ChatGPT</strong> for code generation<br>- <strong>GitHub Copilot</strong> for pair programming<br>- <strong>AI-powered debugging</strong><br>- <strong>Prompt engineering</strong><br>Our <strong>ChatGPT for Developers</strong> tutorial is a great start!"
  },
  {
    keywords: ['security', 'safe', 'secure', 'hack', 'xss', 'csrf', 'protection'],
    response: "This site uses enterprise-grade security:<br>- <strong>XSS Protection</strong> (input sanitization)<br>- <strong>CSRF Tokens</strong> for form security<br>- <strong>SHA-256</strong> password hashing<br>- <strong>Content Security Policy</strong><br>- <strong>Rate Limiting</strong> against brute force<br>- <strong>Session Management</strong> with auto-expiry<br>See the <a href='#security' style='color:var(--neon-cyan)'>Security section</a> for details!"
  },
  {
    keywords: ['contact', 'reach', 'email', 'message', 'support', 'help me'],
    response: "You can reach us through:<br>- The <strong>Contact Form</strong> in the footer below<br>- <strong>YouTube</strong>: Code4Boy channel<br>- <strong>GitHub</strong>: github.com/code4boy<br>- <strong>Twitter/X</strong>: @code4boy<br>Or just ask me your question right here and I'll help!"
  },
  {
    keywords: ['video', 'videos', 'youtube', 'watch', 'channel'],
    response: "Check out our YouTube channel <strong>Code4Boy</strong> for video tutorials! We cover:<br>- HTML Crash Courses<br>- CSS Design Tutorials<br>- JavaScript Projects<br>- AI Tool Guides<br>Visit the <a href='#videos' style='color:var(--neon-cyan)'>Videos section</a> to start watching!"
  },
  {
    keywords: ['theme', 'dark mode', 'light mode', 'color', 'appearance'],
    response: "You can toggle between <strong>Dark Mode</strong> and <strong>Light Mode</strong> using the theme button in the top-right corner of the navigation bar. The site remembers your preference!"
  },
  {
    keywords: ['thank', 'thanks', 'appreciate', 'awesome', 'great', 'cool'],
    response: "You're welcome! Happy to help. Keep coding and building amazing things! If you have more questions, I'm always here. Remember: every expert was once a beginner!"
  },
  {
    keywords: ['who', 'about', 'code4boy', 'creator'],
    response: "<strong>Code4Boy</strong> is a free coding education platform with an Iron Man/Stark OS theme. We provide tutorials, projects, tools, and resources to help you learn coding from scratch. Our mission is to make coding accessible to everyone!"
  },
  {
    keywords: ['api', 'rest', 'node', 'backend', 'server', 'express'],
    response: "Want to build backends? Check our <strong>Build a REST API with Node.js</strong> tutorial! You'll learn:<br>- Express.js setup<br>- Routes & middleware<br>- Database connections<br>- API best practices<br>- Authentication & security"
  },
  {
    keywords: ['landing page', 'website template', 'portfolio site', 'web design'],
    response: "Want to build a landing page or portfolio? Check the <a href='pages/projects.html' style='color:var(--neon-cyan)'>Projects</a> section for full project tutorials and ready-made templates!"
  },
  {
    keywords: ['react', 'component', 'jsx', 'hooks', 'useState', 'useEffect'],
    response: "React is a powerful UI library! Key concepts:<br>- <strong>Components</strong> (functional & class)<br>- <strong>JSX</strong> syntax<br>- <strong>Hooks</strong> (useState, useEffect)<br>- <strong>Props & State</strong> management<br>- <strong>React Router</strong> for navigation<br>Check our <a href='pages/tutorials.html' style='color:var(--neon-cyan)'>Tutorials</a> for more!"
  },
  {
    keywords: ['responsive', 'mobile', 'media query', 'mobile first', 'breakpoint'],
    response: "Making responsive websites is essential! Tips:<br>- Use <strong>CSS Flexbox & Grid</strong> for layouts<br>- <strong>Media queries</strong> for breakpoints<br>- <strong>Mobile-first</strong> approach<br>- <strong>rem/em</strong> units instead of px<br>- Test with Chrome DevTools device mode<br>Check our <a href='pages/tutorials.html' style='color:var(--neon-cyan)'>Tutorials</a> for responsive design examples!"
  },
  {
    keywords: ['git', 'github', 'version control', 'commit', 'branch', 'merge', 'push', 'pull'],
    response: "Git is essential for every developer:<br>- <code>git init</code> - Start a repo<br>- <code>git add .</code> - Stage changes<br>- <code>git commit -m 'msg'</code> - Save changes<br>- <code>git push</code> - Upload to GitHub<br>- <code>git branch</code> - Create branches<br>Download our <strong>Git Cheat Sheet</strong> from the Downloads section!"
  },
  {
    keywords: ['database', 'sql', 'mongodb', 'mysql', 'sqlite', 'data'],
    response: "Databases store your app's data! Options:<br>- <strong>SQL</strong> (MySQL, PostgreSQL, SQLite) - structured data<br>- <strong>NoSQL</strong> (MongoDB) - flexible documents<br>- <strong>Supabase</strong> - real-time cloud DB<br>Start with SQLite for learning, then move to PostgreSQL for production."
  },
  {
    keywords: ['deploy', 'hosting', 'publish', 'live', 'domain', 'netlify', 'vercel'],
    response: "Ready to put your site online? Free hosting options:<br>- <strong>GitHub Pages</strong> - static sites<br>- <strong>Netlify</strong> - auto deploys from Git<br>- <strong>Vercel</strong> - great for React/Next.js<br>- <strong>Railway</strong> - backend apps<br>- <strong>Render</strong> - full-stack apps<br>Most have free tiers perfect for learning!"
  },
  {
    keywords: ['form', 'input', 'validation', 'submit', 'login form', 'signup'],
    response: "Building forms? Key tips:<br>- Use proper <code>&lt;label&gt;</code> tags for accessibility<br>- Add <strong>client-side validation</strong> with HTML5 attributes<br>- Always <strong>sanitize inputs</strong> on the server<br>- Use <code>type='email'</code>, <code>type='password'</code> etc.<br>Check our <a href='pages/tutorials.html' style='color:var(--neon-cyan)'>Tutorials</a> for form examples!"
  },
  {
    keywords: ['animation', 'transition', 'keyframe', 'animate', 'hover effect', 'scroll animation'],
    response: "CSS animations make sites engaging! Learn:<br>- <code>transition</code> for hover effects<br>- <code>@keyframes</code> for custom animations<br>- <code>transform</code> for movement & scaling<br>- <strong>Intersection Observer</strong> for scroll animations<br>Download our <strong>CSS Animation Pack</strong> with 50+ ready effects!"
  },
  {
    keywords: ['fetch', 'axios', 'ajax', 'http request', 'async', 'await', 'promise'],
    response: "Fetching data from APIs is essential! Use:<br>- <strong>fetch()</strong> - built-in browser API<br>- <strong>async/await</strong> - clean async code<br>- <strong>try/catch</strong> - error handling<br>- <code>response.json()</code> - parse JSON data<br>Example:<br><code>const data = await fetch(url).then(r => r.json());</code>"
  },
  {
    keywords: ['copyright', 'license', 'free to use', 'open source', 'mit'],
    response: "All code on Code4Boy is <strong>100% free and copyright-free</strong>! You can:<br>- Use it in personal & commercial projects<br>- Modify it however you want<br>- No attribution required<br>- No hidden costs or subscriptions<br>Visit our <a href='pages/downloads.html' style='color:var(--neon-cyan)'>Downloads</a> section for free templates!"
  }
];

var defaultResponses = [
  "Interesting question! I'm still learning about that topic. Try checking our <a href='#tutorials' style='color:var(--neon-cyan)'>Tutorials</a> or ask me about HTML, CSS, JavaScript, Python, or our available tools.",
  "I'm not sure about that specific topic, but I can help with coding tutorials, projects, downloads, tools, and error solutions. What would you like to explore?",
  "That's beyond my current knowledge, but feel free to use the <a href='#contact' style='color:var(--neon-cyan)'>Contact Form</a> to reach a human, or try asking about a specific coding topic!",
  "Hmm, I don't have info on that yet. Try asking about: tutorials, projects, tools, downloads, security features, or how to start coding!"
];

function toggleChat() {
  var chatWindow = document.getElementById('chatWindow');
  var chatToggle = document.getElementById('chatToggle');
  if (!chatWindow || !chatToggle) return;

  chatWindow.classList.toggle('open');

  var icon = document.getElementById('chatToggleIcon');
  if (chatWindow.classList.contains('open')) {
    icon.className = 'fas fa-times';
    var pulse = chatToggle.querySelector('.chat-pulse');
    if (pulse) pulse.style.display = 'none';
  } else {
    icon.className = 'fas fa-comment-dots';
  }
}

function sendSuggestion(text) {
  var input = document.getElementById('chatInput');
  if (input) {
    input.value = text;
    sendChatMessage();
  }
  var suggestions = document.getElementById('chatSuggestions');
  if (suggestions) suggestions.style.display = 'none';
}

function sendChatMessage() {
  var input = document.getElementById('chatInput');
  var messages = document.getElementById('chatMessages');
  if (!input || !messages) return;

  var text = input.value.trim();
  if (!text) return;

  // Sanitize input
  text = Security.sanitizeInput(text);
  if (!Security.validateLength(text, 1, 500)) return;

  // Rate limit chat messages
  var rateCheck = Security.checkRateLimit('chat-msg', 15, 60000);
  if (!rateCheck.allowed) {
    appendBotMessage(messages, 'Please slow down. You can send more messages in ' + rateCheck.remaining + ' seconds.');
    return;
  }

  // Add user message
  var userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = '<div class="chat-msg-avatar"><i class="fas fa-user"></i></div><div class="chat-msg-bubble"><p>' + Security.sanitizeInput(text) + '</p></div>';
  messages.appendChild(userMsg);

  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  // Show typing indicator
  var typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message bot';
  typingDiv.id = 'chatTyping';
  typingDiv.innerHTML = '<div class="chat-msg-avatar"><i class="fas fa-comment-dots"></i></div><div class="chat-msg-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div>';
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  // Generate response after delay
  setTimeout(function() {
    var typing = document.getElementById('chatTyping');
    if (typing) typing.remove();

    var response = generateBotResponse(text);
    appendBotMessage(messages, response);
  }, 800 + Math.random() * 700);
}

function appendBotMessage(container, html) {
  var botMsg = document.createElement('div');
  botMsg.className = 'chat-message bot';
  botMsg.innerHTML = '<div class="chat-msg-avatar"><i class="fas fa-comment-dots"></i></div><div class="chat-msg-bubble"><p>' + Security.stripDangerousTags(html) + '</p></div>';
  container.appendChild(botMsg);
  container.scrollTop = container.scrollHeight;
}

function generateBotResponse(userText) {
  var lower = userText.toLowerCase();
  var bestMatch = null;
  var bestScore = 0;

  for (var i = 0; i < chatKnowledge.length; i++) {
    var entry = chatKnowledge[i];
    var score = 0;
    for (var j = 0; j < entry.keywords.length; j++) {
      if (lower.indexOf(entry.keywords[j]) !== -1) {
        score += entry.keywords[j].length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return bestMatch.response;
  }

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Allow Enter key to send messages
document.addEventListener('DOMContentLoaded', function() {
  var chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
});


/* ============================================
   FAQ ACCORDION
   ============================================ */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(function(item) {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function() {
      const isActive = item.classList.contains('active');
      const expanded = question.getAttribute('aria-expanded') === 'true';

      // Close all other items
      faqItems.forEach(function(other) {
        if (other !== item) {
          other.classList.remove('active');
          var otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          var otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.setAttribute('aria-hidden', 'true');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
      question.setAttribute('aria-expanded', String(!expanded));
      var answer = item.querySelector('.faq-answer');
      if (answer) answer.setAttribute('aria-hidden', String(expanded));
    });
  });
}

/* ============================================
   TESTIMONIALS CAROUSEL
   ============================================ */
function initTestimonialsCarousel() {
  var cards = document.querySelectorAll('.testimonial-card');
  var dots = document.querySelectorAll('.testimonial-dot');
  var prevBtn = document.querySelector('.testimonial-nav-btn.prev');
  var nextBtn = document.querySelector('.testimonial-nav-btn.next');

  if (!cards.length) return;

  // Dynamically generate dots
  var dotsContainer = document.querySelector('.testimonial-dots');
  if (dotsContainer && !dots.length) {
    for (var d = 0; d < cards.length; d++) {
      var dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (d === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Testimonial ' + (d + 1));
      dotsContainer.appendChild(dot);
    }
    dots = dotsContainer.querySelectorAll('.testimonial-dot');
  }

  var currentIndex = 0;
  var autoPlayTimer = null;

  function showSlide(index) {
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    currentIndex = index;

    cards.forEach(function(card) { card.classList.remove('active'); });
    dots.forEach(function(dot) { dot.classList.remove('active'); });

    cards[currentIndex].classList.add('active');
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');
  }

  function nextSlide() { showSlide(currentIndex + 1); }
  function prevSlide() { showSlide(currentIndex - 1); }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      prevSlide();
      startAutoPlay();
    });
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      showSlide(i);
      startAutoPlay();
    });
  });

  // Keyboard navigation for carousel
  var carousel = document.querySelector('.testimonials-carousel');
  if (carousel) {
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextSlide();
        startAutoPlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
        startAutoPlay();
      }
    });
    carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('aria-label', 'Community testimonials');
  }

  // Touch/swipe support
  var track = document.querySelector('.testimonials-track');
  if (track) {
    var startX = 0;
    var endX = 0;

    track.addEventListener('touchstart', function(e) {
      startX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      endX = e.changedTouches[0].screenX;
      var diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
      startAutoPlay();
    }, { passive: true });
  }

  // Start auto-play
  showSlide(0);
  startAutoPlay();
}

/* ============================================
   SKILLS PROGRESS TRACKER
   ============================================ */
function initSkillsTracker() {
  var skillCards = document.querySelectorAll('.skill-tracker-card');
  if (!skillCards.length) return;

  var STORAGE_KEY = 'c4b-skills-progress';

  function loadProgress() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* storage full or unavailable */ }
  }

  function updateCardUI(card, skillId, progress) {
    var isComplete = progress[skillId] === true;
    var progressFill = card.querySelector('.skill-progress-fill');
    var percentageEl = card.querySelector('.skill-percentage');
    var markBtn = card.querySelector('.mark-complete');

    if (isComplete) {
      card.classList.add('completed');
      if (progressFill) {
        progressFill.style.width = '100%';
        progressFill.style.setProperty('--fill-color', 'var(--neon-green)');
      }
      if (percentageEl) percentageEl.textContent = '100%';
      if (markBtn) {
        markBtn.classList.add('is-complete');
        markBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
      }
    } else {
      card.classList.remove('completed');
      var defaultWidth = progressFill ? progressFill.getAttribute('data-width') || '0%' : '0%';
      if (progressFill) {
        progressFill.style.width = defaultWidth;
        progressFill.style.removeProperty('--fill-color');
      }
      var defaultPct = percentageEl ? percentageEl.getAttribute('data-default') || defaultWidth : '0%';
      if (percentageEl) percentageEl.textContent = defaultPct;
      if (markBtn) {
        markBtn.classList.remove('is-complete');
        markBtn.innerHTML = '<i class="fas fa-check"></i> Mark Complete';
      }
    }
  }

  var progress = loadProgress();

  skillCards.forEach(function(card) {
    var skillId = card.getAttribute('data-skill');
    if (!skillId) return;

    // Store default values
    var progressFill = card.querySelector('.skill-progress-fill');
    var percentageEl = card.querySelector('.skill-percentage');
    if (progressFill) progressFill.setAttribute('data-width', progressFill.style.width || '0%');
    if (percentageEl) percentageEl.setAttribute('data-default', percentageEl.textContent);

    // Apply saved state
    updateCardUI(card, skillId, progress);

    // Mark complete button
    var markBtn = card.querySelector('.mark-complete');
    if (markBtn) {
      markBtn.addEventListener('click', function() {
        progress = loadProgress();
        progress[skillId] = !progress[skillId];
        saveProgress(progress);
        updateCardUI(card, skillId, progress);
        if (progress[skillId]) {
          showNotification('Skill marked as complete! Keep learning! 🚀', 'success');
        }
      });
    }

    // Animate progress bar on scroll
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && progressFill) {
          var width = progressFill.getAttribute('data-width') || '0%';
          if (progress[skillId]) width = '100%';
          setTimeout(function() { progressFill.style.width = width; }, 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(card);
  });

  // Reset all progress button
  var resetBtn = document.querySelector('.skills-reset-btn') || document.getElementById('resetSkills');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      if (confirm('Reset all skill progress? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        progress = {};
        skillCards.forEach(function(card) {
          var skillId = card.getAttribute('data-skill');
          if (skillId) updateCardUI(card, skillId, progress);
        });
        showNotification('Progress reset successfully', 'info');
      }
    });
  }
}

/* ============================================
   NEWSLETTER FORM
   ============================================ */
function initNewsletterForm() {
  var form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var emailInput = form.querySelector('input[type="email"]');
    var honeypot = form.querySelector('input[name="website"]');

    // Honeypot check
    if (honeypot && honeypot.value) return;

    if (!emailInput || !emailInput.value.trim()) {
      showNotification('Please enter your email address', 'error');
      return;
    }

    var email = emailInput.value.trim();
    if (!Security.isValidEmail(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Rate limit check
    var rateCheck = Security.checkRateLimit('newsletter', 3, 60000);
    if (!rateCheck.allowed) {
      showNotification('Too many attempts. Try again in ' + rateCheck.remaining + 's', 'error');
      return;
    }

    // Simulate subscription
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    }

    setTimeout(function() {
      // Show success
      var formEl = form.closest('.newsletter-wrapper');
      if (formEl) {
        var successEl = formEl.querySelector('.newsletter-success');
        if (successEl) {
          form.style.display = 'none';
          var noteEl = formEl.querySelector('.newsletter-note');
          if (noteEl) noteEl.style.display = 'none';
          successEl.style.display = 'block';
          successEl.classList.add('show');
        }
      }
      showNotification('Successfully subscribed! Welcome aboard! 🎉', 'success');
      emailInput.value = '';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe';
      }
    }, 1200);
  });
}

/* ============================================
   ROADMAP INTERACTION
   ============================================ */
function initRoadmapInteraction() {
  var steps = document.querySelectorAll('.roadmap-step, .roadmap-card');
  if (!steps.length) return;

  steps.forEach(function(step) {
    step.addEventListener('click', function() {
      // Toggle active state
      var wasActive = step.classList.contains('active');
      steps.forEach(function(s) { s.classList.remove('active'); });
      if (!wasActive) step.classList.add('active');
    });

    // Keyboard accessibility
    step.setAttribute('tabindex', '0');
    step.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        step.click();
      }
    });
  });

  // Animate steps on scroll
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  steps.forEach(function(step, i) {
    step.style.opacity = '0';
    step.style.transform = 'translateX(-20px)';
    step.style.transition = 'opacity 0.5s ease ' + (i * 0.15) + 's, transform 0.5s ease ' + (i * 0.15) + 's';
    observer.observe(step);
  });
}

/* ============================================
   SCROLL PROGRESS INDICATOR
   ============================================ */
function initScrollProgress() {
  var progressBar = document.getElementById('scrollProgressBar');
  if (!progressBar) return;
  
  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + '%';
  }, { passive: true });
}

/* ============================================
   LAZY YOUTUBE IFRAME LOADING
   ============================================ */
function initLazyYouTube() {
  var iframes = document.querySelectorAll('iframe[data-src]');
  if (!iframes.length) return;
  
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var iframe = entry.target;
        iframe.src = iframe.getAttribute('data-src');
        iframe.removeAttribute('data-src');
        observer.unobserve(iframe);
      }
    });
  }, { rootMargin: '200px' });
  
  iframes.forEach(function(iframe) {
    observer.observe(iframe);
  });
}

/* ============================================
   PAGE VISIBILITY API - Pause animations when tab hidden
   ============================================ */
function initPageVisibility() {
  document.addEventListener('visibilitychange', function() {
    var particles = document.querySelector('.particles');
    if (!particles) return;
    
    if (document.hidden) {
      particles.style.animationPlayState = 'paused';
      document.querySelectorAll('.particle').forEach(function(p) {
        p.style.animationPlayState = 'paused';
      });
    } else {
      particles.style.animationPlayState = 'running';
      document.querySelectorAll('.particle').forEach(function(p) {
        p.style.animationPlayState = 'running';
      });
    }
  });
}

/* ============================================
   TIME-BASED GREETING
   ============================================ */
(function initGreeting() {
  var heroTitle = document.querySelector('.hero-badge');
  if (!heroTitle) return;
  
  var hour = new Date().getHours();
  var greeting = '';
  if (hour < 12) greeting = 'Good Morning, Coder!';
  else if (hour < 17) greeting = 'Good Afternoon, Coder!';
  else if (hour < 21) greeting = 'Good Evening, Coder!';
  else greeting = 'Happy Late Night Coding!';
  
  var badge = heroTitle.querySelector('span');
  if (badge) {
    badge.setAttribute('title', greeting);
  }
})();

/* ============================================
   CODE PLAYGROUND - Full Interactive Live Editor
   ============================================ */

// Playground Templates
var playgroundTemplates = {
  hello: {
    html: '<div class="container">\n  <h1>Hello, World! 🌍</h1>\n  <p>Welcome to <strong>Code4Boy Playground</strong></p>\n  <button id="btn">Click Me!</button>\n  <p id="output"></p>\n</div>',
    css: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: \'Segoe UI\', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);\n  color: #fff;\n}\n\n.container {\n  text-align: center;\n  padding: 40px;\n}\n\nh1 {\n  font-size: 2.5rem;\n  margin-bottom: 10px;\n  background: linear-gradient(135deg, #38bdf8, #a855f7);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\np {\n  font-size: 1.1rem;\n  color: #94a3b8;\n  margin-bottom: 20px;\n}\n\nbutton {\n  padding: 12px 30px;\n  background: linear-gradient(135deg, #6366f1, #a855f7);\n  color: #fff;\n  border: none;\n  border-radius: 10px;\n  font-size: 1rem;\n  cursor: pointer;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n\nbutton:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);\n}\n\n#output {\n  margin-top: 20px;\n  font-size: 1.2rem;\n  color: #34d399;\n}',
    js: 'let count = 0;\nconst btn = document.getElementById("btn");\nconst output = document.getElementById("output");\n\nbtn.addEventListener("click", () => {\n  count++;\n  output.textContent = `You clicked ${count} time${count > 1 ? "s" : ""}! 🎉`;\n  console.log("Button clicked:", count);\n});'
  },
  card: {
    html: '<div class="card-container">\n  <div class="glass-card">\n    <div class="card-icon">🚀</div>\n    <h2>Glassmorphism Card</h2>\n    <p>A beautiful frosted-glass effect card with modern design principles.</p>\n    <div class="card-tags">\n      <span class="tag">CSS</span>\n      <span class="tag">Design</span>\n      <span class="tag">Modern</span>\n    </div>\n    <button class="card-btn">Explore →</button>\n  </div>\n  <div class="glass-card">\n    <div class="card-icon">⚡</div>\n    <h2>Neon Glow</h2>\n    <p>Combine glass effects with neon colors for a futuristic feel.</p>\n    <div class="card-tags">\n      <span class="tag">Neon</span>\n      <span class="tag">Glow</span>\n      <span class="tag">UI</span>\n    </div>\n    <button class="card-btn">Explore →</button>\n  </div>\n</div>',
    css: '* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  font-family: \'Segoe UI\', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a2e 100%);\n  overflow: hidden;\n}\n\nbody::before {\n  content: "";\n  position: fixed;\n  width: 300px;\n  height: 300px;\n  background: radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%);\n  top: 20%;\n  left: 30%;\n  border-radius: 50%;\n  filter: blur(60px);\n}\n\nbody::after {\n  content: "";\n  position: fixed;\n  width: 250px;\n  height: 250px;\n  background: radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%);\n  bottom: 20%;\n  right: 20%;\n  border-radius: 50%;\n  filter: blur(60px);\n}\n\n.card-container {\n  display: flex;\n  gap: 24px;\n  flex-wrap: wrap;\n  justify-content: center;\n  padding: 20px;\n  position: relative;\n  z-index: 1;\n}\n\n.glass-card {\n  width: 280px;\n  padding: 32px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 20px;\n  backdrop-filter: blur(20px);\n  color: #e8eaf6;\n  transition: transform 0.3s ease, box-shadow 0.3s ease;\n}\n\n.glass-card:hover {\n  transform: translateY(-8px);\n  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.2);\n  border-color: rgba(99, 102, 241, 0.3);\n}\n\n.card-icon {\n  font-size: 2.5rem;\n  margin-bottom: 16px;\n}\n\n.glass-card h2 {\n  font-size: 1.3rem;\n  margin-bottom: 10px;\n  background: linear-gradient(135deg, #38bdf8, #a855f7);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.glass-card p {\n  font-size: 0.9rem;\n  color: #94a3b8;\n  line-height: 1.6;\n  margin-bottom: 16px;\n}\n\n.card-tags {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 20px;\n  flex-wrap: wrap;\n}\n\n.tag {\n  padding: 4px 12px;\n  background: rgba(99, 102, 241, 0.1);\n  border: 1px solid rgba(99, 102, 241, 0.2);\n  border-radius: 20px;\n  font-size: 0.75rem;\n  color: #818cf8;\n}\n\n.card-btn {\n  width: 100%;\n  padding: 10px;\n  background: linear-gradient(135deg, #6366f1, #a855f7);\n  color: #fff;\n  border: none;\n  border-radius: 10px;\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: opacity 0.2s;\n}\n\n.card-btn:hover {\n  opacity: 0.9;\n}',
    js: 'document.querySelectorAll(".glass-card").forEach(card => {\n  card.addEventListener("mousemove", e => {\n    const rect = card.getBoundingClientRect();\n    const x = e.clientX - rect.left;\n    const y = e.clientY - rect.top;\n    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(99,102,241,0.12), rgba(255,255,255,0.05))`;\n  });\n  card.addEventListener("mouseleave", () => {\n    card.style.background = "rgba(255,255,255,0.05)";\n  });\n});\n\nconsole.log("✨ Glassmorphism cards loaded!");'
  },
  animation: {
    html: '<div class="animation-showcase">\n  <div class="spinner"></div>\n  <h2>CSS Animations</h2>\n  <p>Pure CSS magic - no JavaScript needed!</p>\n  <div class="dots">\n    <span></span><span></span><span></span>\n  </div>\n  <div class="wave-text">\n    <span style="--i:0">C</span><span style="--i:1">o</span><span style="--i:2">d</span><span style="--i:3">e</span><span style="--i:4">4</span><span style="--i:5">B</span><span style="--i:6">o</span><span style="--i:7">y</span>\n  </div>\n</div>',
    css: '* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  font-family: \'Segoe UI\', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: #0a0a1a;\n  color: #fff;\n}\n\n.animation-showcase {\n  text-align: center;\n  padding: 40px;\n}\n\n/* Spinning Ring */\n.spinner {\n  width: 60px;\n  height: 60px;\n  border: 3px solid rgba(99,102,241,0.1);\n  border-top: 3px solid #6366f1;\n  border-radius: 50%;\n  margin: 0 auto 30px;\n  animation: spin 1s linear infinite;\n}\n\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n\nh2 {\n  font-size: 2rem;\n  margin-bottom: 8px;\n  background: linear-gradient(135deg, #38bdf8, #6366f1, #a855f7);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  animation: gradientShift 3s ease infinite;\n  background-size: 200% 200%;\n}\n\n@keyframes gradientShift {\n  0%, 100% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n}\n\np { color: #64748b; margin-bottom: 30px; }\n\n/* Bouncing Dots */\n.dots {\n  display: flex;\n  justify-content: center;\n  gap: 8px;\n  margin-bottom: 40px;\n}\n\n.dots span {\n  width: 12px;\n  height: 12px;\n  background: #6366f1;\n  border-radius: 50%;\n  animation: bounce 1.4s ease-in-out infinite;\n}\n\n.dots span:nth-child(2) { animation-delay: 0.2s; background: #a855f7; }\n.dots span:nth-child(3) { animation-delay: 0.4s; background: #38bdf8; }\n\n@keyframes bounce {\n  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }\n  40% { transform: scale(1.2); opacity: 1; }\n}\n\n/* Wave Text */\n.wave-text {\n  font-size: 2.5rem;\n  font-weight: 700;\n  display: flex;\n  justify-content: center;\n}\n\n.wave-text span {\n  display: inline-block;\n  animation: wave 1.5s ease-in-out infinite;\n  animation-delay: calc(0.1s * var(--i));\n  color: #6366f1;\n}\n\n@keyframes wave {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-15px); color: #38bdf8; }\n}',
    js: 'console.log("🎨 All animations are pure CSS!");'
  },
  todo: {
    html: '<div class="todo-app">\n  <h1>📝 Todo App</h1>\n  <div class="input-group">\n    <input type="text" id="todoInput" placeholder="Add a new task..." />\n    <button onclick="addTodo()">Add</button>\n  </div>\n  <div class="filters">\n    <button class="filter-btn active" onclick="filterTodos(\'all\', this)">All</button>\n    <button class="filter-btn" onclick="filterTodos(\'active\', this)">Active</button>\n    <button class="filter-btn" onclick="filterTodos(\'done\', this)">Done</button>\n  </div>\n  <ul id="todoList"></ul>\n  <p class="counter"><span id="count">0</span> tasks remaining</p>\n</div>',
    css: '* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  font-family: \'Segoe UI\', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  padding-top: 40px;\n  min-height: 100vh;\n  background: linear-gradient(135deg, #0f0c29, #302b63);\n  color: #fff;\n}\n\n.todo-app {\n  width: 380px;\n  padding: 30px;\n  background: rgba(255,255,255,0.05);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 20px;\n  backdrop-filter: blur(20px);\n}\n\nh1 {\n  text-align: center;\n  margin-bottom: 20px;\n  font-size: 1.5rem;\n}\n\n.input-group {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 16px;\n}\n\ninput {\n  flex: 1;\n  padding: 10px 16px;\n  background: rgba(255,255,255,0.08);\n  border: 1px solid rgba(255,255,255,0.15);\n  border-radius: 10px;\n  color: #fff;\n  font-size: 0.9rem;\n  outline: none;\n}\n\ninput:focus { border-color: #6366f1; }\n\n.input-group button {\n  padding: 10px 20px;\n  background: #6366f1;\n  color: #fff;\n  border: none;\n  border-radius: 10px;\n  cursor: pointer;\n  font-weight: 600;\n}\n\n.input-group button:hover { background: #4f46e5; }\n\n.filters {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 16px;\n}\n\n.filter-btn {\n  flex: 1;\n  padding: 8px;\n  background: rgba(255,255,255,0.05);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 8px;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 0.8rem;\n}\n\n.filter-btn.active {\n  background: rgba(99,102,241,0.2);\n  border-color: #6366f1;\n  color: #fff;\n}\n\nul { list-style: none; }\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 12px;\n  background: rgba(255,255,255,0.03);\n  border-radius: 10px;\n  margin-bottom: 8px;\n  transition: all 0.2s;\n}\n\nli:hover { background: rgba(255,255,255,0.06); }\n\nli.done span { text-decoration: line-through; color: #64748b; }\n\nli span { flex: 1; }\n\nli button {\n  background: none;\n  border: none;\n  color: #ef4444;\n  cursor: pointer;\n  font-size: 1.1rem;\n}\n\n.counter {\n  text-align: center;\n  color: #64748b;\n  font-size: 0.85rem;\n  margin-top: 16px;\n}',
    js: 'let todos = [];\n\nconst input = document.getElementById("todoInput");\nconst list = document.getElementById("todoList");\nconst countEl = document.getElementById("count");\n\ninput.addEventListener("keypress", e => {\n  if (e.key === "Enter") addTodo();\n});\n\nfunction addTodo() {\n  const text = input.value.trim();\n  if (!text) return;\n  todos.push({ text, done: false, id: Date.now() });\n  input.value = "";\n  render();\n  console.log("Added:", text);\n}\n\nfunction toggleTodo(id) {\n  const todo = todos.find(t => t.id === id);\n  if (todo) todo.done = !todo.done;\n  render();\n}\n\nfunction deleteTodo(id) {\n  todos = todos.filter(t => t.id !== id);\n  render();\n  console.log("Deleted task", id);\n}\n\nfunction filterTodos(type, btn) {\n  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));\n  btn.classList.add("active");\n  render(type);\n}\n\nfunction render(filter = "all") {\n  let filtered = todos;\n  if (filter === "active") filtered = todos.filter(t => !t.done);\n  if (filter === "done") filtered = todos.filter(t => t.done);\n  \n  list.innerHTML = filtered.map(t => `\n    <li class="${t.done ? "done" : ""}">\n      <input type="checkbox" ${t.done ? "checked" : ""} onchange="toggleTodo(${t.id})">\n      <span>${t.text}</span>\n      <button onclick="deleteTodo(${t.id})">✕</button>\n    </li>\n  `).join("");\n  \n  countEl.textContent = todos.filter(t => !t.done).length;\n}\n\nconsole.log("📝 Todo App ready!");'
  },
  api: {
    html: '<div class="api-demo">\n  <h1>🌐 Fetch API Demo</h1>\n  <p>Fetching random users from API</p>\n  <button id="fetchBtn" onclick="fetchUsers()">Fetch Users</button>\n  <div id="users" class="users-grid"></div>\n  <div id="loading" class="loading" style="display:none">\n    <div class="loader"></div>\n    <span>Loading...</span>\n  </div>\n</div>',
    css: '* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  font-family: \'Segoe UI\', sans-serif;\n  padding: 30px;\n  background: linear-gradient(135deg, #0f0c29, #302b63);\n  color: #fff;\n  min-height: 100vh;\n}\n\n.api-demo { max-width: 600px; margin: 0 auto; text-align: center; }\n\nh1 { font-size: 1.8rem; margin-bottom: 8px; }\np { color: #94a3b8; margin-bottom: 20px; }\n\n#fetchBtn {\n  padding: 12px 30px;\n  background: linear-gradient(135deg, #6366f1, #a855f7);\n  color: #fff;\n  border: none;\n  border-radius: 10px;\n  font-size: 1rem;\n  cursor: pointer;\n  margin-bottom: 24px;\n  transition: transform 0.2s;\n}\n\n#fetchBtn:hover { transform: translateY(-2px); }\n\n.users-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n  text-align: left;\n}\n\n.user-card {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 14px;\n  background: rgba(255,255,255,0.05);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 14px;\n  backdrop-filter: blur(10px);\n  animation: cardIn 0.3s ease backwards;\n}\n\n.user-card img {\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  border: 2px solid rgba(99,102,241,0.3);\n}\n\n.user-card h3 { font-size: 0.9rem; margin-bottom: 2px; }\n.user-card p { font-size: 0.75rem; color: #94a3b8; margin: 0; }\n\n@keyframes cardIn {\n  from { opacity: 0; transform: translateY(10px); }\n}\n\n.loading {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  padding: 20px;\n  color: #94a3b8;\n}\n\n.loader {\n  width: 20px;\n  height: 20px;\n  border: 2px solid rgba(99,102,241,0.2);\n  border-top-color: #6366f1;\n  border-radius: 50%;\n  animation: spin 0.6s linear infinite;\n}\n\n@keyframes spin { to { transform: rotate(360deg); } }',
    js: 'async function fetchUsers() {\n  const users = document.getElementById("users");\n  const loading = document.getElementById("loading");\n  const btn = document.getElementById("fetchBtn");\n  \n  users.innerHTML = "";\n  loading.style.display = "flex";\n  btn.disabled = true;\n  btn.textContent = "Fetching...";\n  \n  try {\n    console.log("📡 Fetching users...");\n    const res = await fetch("https://randomuser.me/api/?results=6");\n    const data = await res.json();\n    \n    loading.style.display = "none";\n    btn.disabled = false;\n    btn.textContent = "Fetch Again";\n    \n    data.results.forEach((user, i) => {\n      const card = document.createElement("div");\n      card.className = "user-card";\n      card.style.animationDelay = (i * 0.1) + "s";\n      card.innerHTML = `\n        <img src="${user.picture.medium}" alt="${user.name.first}">\n        <div>\n          <h3>${user.name.first} ${user.name.last}</h3>\n          <p>${user.email}</p>\n        </div>\n      `;\n      users.appendChild(card);\n    });\n    \n    console.log("✅ Loaded", data.results.length, "users");\n  } catch (err) {\n    loading.style.display = "none";\n    btn.disabled = false;\n    btn.textContent = "Retry";\n    console.error("❌ Error:", err.message);\n    users.innerHTML = \'<p style="color:#ef4444">Failed to fetch. Try again!</p>\';\n  }\n}\n\nconsole.log("🌐 API Demo ready - click Fetch Users!");'
  },
  game: {
    html: '<div class="game-container">\n  <h1>🎮 Catch the Dot!</h1>\n  <p>Score: <span id="score">0</span> | Time: <span id="timer">30</span>s</p>\n  <div id="gameArea" class="game-area">\n    <div id="dot" class="dot"></div>\n  </div>\n  <button id="startBtn" onclick="startGame()">Start Game</button>\n</div>',
    css: '* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  font-family: \'Segoe UI\', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: #0a0a1a;\n  color: #fff;\n}\n\n.game-container {\n  text-align: center;\n  padding: 20px;\n}\n\nh1 { font-size: 1.8rem; margin-bottom: 10px; }\np { color: #94a3b8; margin-bottom: 16px; font-size: 1.1rem; }\n#score { color: #34d399; font-weight: 700; }\n#timer { color: #fb923c; font-weight: 700; }\n\n.game-area {\n  width: 400px;\n  height: 400px;\n  background: rgba(255,255,255,0.03);\n  border: 2px solid rgba(99,102,241,0.2);\n  border-radius: 16px;\n  position: relative;\n  margin: 0 auto 16px;\n  overflow: hidden;\n  cursor: crosshair;\n}\n\n.dot {\n  width: 30px;\n  height: 30px;\n  background: radial-gradient(circle, #6366f1, #a855f7);\n  border-radius: 50%;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  cursor: pointer;\n  box-shadow: 0 0 20px rgba(99,102,241,0.5);\n  transition: width 0.1s, height 0.1s;\n  display: none;\n}\n\n.dot.active { display: block; animation: dotPop 0.2s ease; }\n\n@keyframes dotPop {\n  from { transform: translate(-50%,-50%) scale(0); }\n  to { transform: translate(-50%,-50%) scale(1); }\n}\n\n.dot:hover { box-shadow: 0 0 30px rgba(99,102,241,0.7); }\n\n#startBtn {\n  padding: 12px 40px;\n  background: linear-gradient(135deg, #6366f1, #a855f7);\n  color: #fff;\n  border: none;\n  border-radius: 10px;\n  font-size: 1.1rem;\n  cursor: pointer;\n  transition: transform 0.2s;\n}\n\n#startBtn:hover { transform: translateY(-2px); }\n#startBtn:disabled { opacity: 0.5; cursor: not-allowed; }',
    js: 'let score = 0;\nlet timeLeft = 30;\nlet gameInterval;\nlet dotSize = 30;\nconst dot = document.getElementById("dot");\nconst scoreEl = document.getElementById("score");\nconst timerEl = document.getElementById("timer");\nconst startBtn = document.getElementById("startBtn");\nconst area = document.getElementById("gameArea");\n\nfunction moveDot() {\n  const maxX = area.clientWidth - dotSize;\n  const maxY = area.clientHeight - dotSize;\n  dot.style.left = Math.random() * maxX + "px";\n  dot.style.top = Math.random() * maxY + "px";\n  dot.style.width = dotSize + "px";\n  dot.style.height = dotSize + "px";\n  dot.classList.add("active");\n}\n\ndot.addEventListener("click", () => {\n  score++;\n  scoreEl.textContent = score;\n  if (score % 5 === 0 && dotSize > 12) {\n    dotSize -= 2;\n    console.log("⚡ Level up! Dot size:", dotSize);\n  }\n  moveDot();\n});\n\nfunction startGame() {\n  score = 0;\n  timeLeft = 30;\n  dotSize = 30;\n  scoreEl.textContent = 0;\n  timerEl.textContent = 30;\n  startBtn.disabled = true;\n  startBtn.textContent = "Playing...";\n  moveDot();\n  \n  gameInterval = setInterval(() => {\n    timeLeft--;\n    timerEl.textContent = timeLeft;\n    if (timeLeft <= 0) {\n      clearInterval(gameInterval);\n      dot.classList.remove("active");\n      startBtn.disabled = false;\n      startBtn.textContent = "Play Again";\n      console.log("🏆 Game Over! Final Score:", score);\n      alert("Game Over! Your score: " + score);\n    }\n  }, 1000);\n  \n  console.log("🎮 Game started!");\n}\n\nconsole.log("🎮 Click Start to play!");'
  }
};

var pgCurrentTab = 'html';
var pgAutoRunTimer = null;

function togglePlayground() {
  var overlay = document.getElementById('playgroundOverlay');
  var fab = document.getElementById('playgroundFab');
  if (!overlay) return;
  
  if (overlay.classList.contains('active')) {
    overlay.classList.remove('active');
    fab.style.display = '';
    document.body.style.overflow = '';
  } else {
    overlay.classList.add('active');
    fab.style.display = 'none';
    document.body.style.overflow = 'hidden';
    
    // Load default template if editors are empty
    var htmlEditor = document.getElementById('pgEditorHTML');
    if (htmlEditor && !htmlEditor.value.trim()) {
      loadPlaygroundTemplate('hello');
    }
    
    updateLineNumbers();
    setTimeout(function() { document.getElementById('pgEditorHTML').focus(); }, 100);
  }
}

function switchPlaygroundTab(lang) {
  pgCurrentTab = lang;
  document.querySelectorAll('.pg-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelector('.pg-tab[data-lang="' + lang + '"]').classList.add('active');
  
  document.querySelectorAll('.playground-editor').forEach(function(e) { e.style.display = 'none'; });
  var editor = document.getElementById('pgEditor' + lang.toUpperCase());
  editor.style.display = '';
  editor.focus();
  
  document.getElementById('pgStatusLang').textContent = lang.toUpperCase();
  updateLineNumbers();
  updateCharCount();
}

function updateLineNumbers() {
  var editor = document.getElementById('pgEditor' + pgCurrentTab.toUpperCase());
  var lineNums = document.getElementById('pgLineNumbers');
  if (!editor || !lineNums) return;
  
  var lines = editor.value.split('\n').length;
  var nums = '';
  for (var i = 1; i <= Math.max(lines, 20); i++) {
    nums += i + '\n';
  }
  lineNums.textContent = nums;
}

function updateCharCount() {
  var editor = document.getElementById('pgEditor' + pgCurrentTab.toUpperCase());
  var status = document.getElementById('pgStatusChars');
  if (editor && status) {
    status.textContent = editor.value.length + ' chars';
  }
}

function playgroundRun() {
  var htmlCode = document.getElementById('pgEditorHTML').value;
  var cssCode = document.getElementById('pgEditorCSS').value;
  var jsCode = document.getElementById('pgEditorJS').value;
  var preview = document.getElementById('playgroundPreview');
  var consoleOutput = document.getElementById('consoleOutput');
  
  if (!preview) return;
  
  // Clear console
  consoleOutput.innerHTML = '';
  
  // Build the preview document with console capture
  var doc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>' + cssCode + '<\/style><\/head><body>' + htmlCode + '<script>'
    + '(function(){'
    + 'var _origLog=console.log,_origErr=console.error,_origWarn=console.warn,_origInfo=console.info;'
    + 'function _send(type,args){'
    + '  try{parent.postMessage({type:"playground-console",logType:type,data:Array.from(args).map(function(a){return typeof a==="object"?JSON.stringify(a,null,2):String(a)}).join(" ")},"*")}catch(e){}'
    + '}'
    + 'console.log=function(){_send("log",arguments);_origLog.apply(console,arguments)};'
    + 'console.error=function(){_send("error",arguments);_origErr.apply(console,arguments)};'
    + 'console.warn=function(){_send("warn",arguments);_origWarn.apply(console,arguments)};'
    + 'console.info=function(){_send("info",arguments);_origInfo.apply(console,arguments)};'
    + 'window.onerror=function(m,s,l,c,e){_send("error",["Error: "+m+" (line "+l+")"]);return false};'
    + '})();'
    + '<\/script><script>' + jsCode + '<\/script><\/body><\/html>';
  
  preview.srcdoc = doc;
  
  // Update preview size info
  var sizeInfo = document.getElementById('previewSizeInfo');
  if (sizeInfo) {
    var totalSize = htmlCode.length + cssCode.length + jsCode.length;
    sizeInfo.textContent = (totalSize / 1024).toFixed(1) + ' KB';
  }
}

function loadPlaygroundTemplate(name) {
  var tmpl = playgroundTemplates[name];
  if (!tmpl) return;
  
  document.getElementById('pgEditorHTML').value = tmpl.html;
  document.getElementById('pgEditorCSS').value = tmpl.css;
  document.getElementById('pgEditorJS').value = tmpl.js;
  
  switchPlaygroundTab('html');
  playgroundRun();
}

function playgroundClear() {
  document.getElementById('pgEditorHTML').value = '';
  document.getElementById('pgEditorCSS').value = '';
  document.getElementById('pgEditorJS').value = '';
  document.getElementById('consoleOutput').innerHTML = '';
  document.getElementById('playgroundPreview').srcdoc = '';
  document.getElementById('playgroundTemplate').value = '';
  updateLineNumbers();
  updateCharCount();
}

function playgroundCopy() {
  var htmlCode = document.getElementById('pgEditorHTML').value;
  var cssCode = document.getElementById('pgEditorCSS').value;
  var jsCode = document.getElementById('pgEditorJS').value;
  
  var fullCode = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<style>\n' + cssCode + '\n</style>\n</head>\n<body>\n' + htmlCode + '\n<script>\n' + jsCode + '\n<\/script>\n</body>\n</html>';
  
  navigator.clipboard.writeText(fullCode).then(function() {
    showNotification('Code copied to clipboard!', 'success');
  }).catch(function() {
    showNotification('Failed to copy code', 'error');
  });
}

function playgroundDownload() {
  var htmlCode = document.getElementById('pgEditorHTML').value;
  var cssCode = document.getElementById('pgEditorCSS').value;
  var jsCode = document.getElementById('pgEditorJS').value;
  
  var fullCode = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Code4Boy Playground Export</title>\n<style>\n' + cssCode + '\n</style>\n</head>\n<body>\n' + htmlCode + '\n<script>\n' + jsCode + '\n<\/script>\n</body>\n</html>';
  
  var blob = new Blob([fullCode], { type: 'text/html' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'code4boy-playground.html';
  link.click();
  URL.revokeObjectURL(link.href);
  showNotification('Code downloaded as HTML!', 'success');
}

function playgroundFullscreen() {
  var container = document.getElementById('playgroundContainer');
  container.classList.toggle('fullscreen');
}

function clearConsole() {
  var output = document.getElementById('consoleOutput');
  if (output) output.innerHTML = '';
}

// Listen for console messages from iframe
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'playground-console') {
    var output = document.getElementById('consoleOutput');
    if (!output) return;
    
    var line = document.createElement('div');
    var logType = e.data.logType || 'log';
    line.className = 'log-line' + (logType === 'error' ? ' log-error' : logType === 'warn' ? ' log-warn' : logType === 'info' ? ' log-info' : '');
    
    var prefix = logType === 'error' ? '✕ ' : logType === 'warn' ? '⚠ ' : logType === 'info' ? 'ℹ ' : '› ';
    line.textContent = prefix + e.data.data;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }
});

// Initialize playground events
document.addEventListener('DOMContentLoaded', function() {
  // Editor input events
  ['HTML', 'CSS', 'JS'].forEach(function(lang) {
    var editor = document.getElementById('pgEditor' + lang);
    if (!editor) return;
    
    editor.addEventListener('input', function() {
      updateLineNumbers();
      updateCharCount();
      
      // Auto-run with debounce
      var autoRun = document.getElementById('pgAutoRunCheck');
      if (autoRun && autoRun.checked) {
        clearTimeout(pgAutoRunTimer);
        pgAutoRunTimer = setTimeout(playgroundRun, 400);
      }
    });
    
    // Tab key support in editor
    editor.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
        this.dispatchEvent(new Event('input'));
      }
      
      // Ctrl+Enter to run
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playgroundRun();
      }
      
      // Ctrl+S to download
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playgroundDownload();
      }
    });
    
    // Sync scroll for line numbers
    editor.addEventListener('scroll', function() {
      var lineNums = document.getElementById('pgLineNumbers');
      if (lineNums) lineNums.scrollTop = this.scrollTop;
    });
  });
  
  // Template selector
  var tmplSelect = document.getElementById('playgroundTemplate');
  if (tmplSelect) {
    tmplSelect.addEventListener('change', function() {
      if (this.value) {
        loadPlaygroundTemplate(this.value);
      }
    });
  }
  
  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var overlay = document.getElementById('playgroundOverlay');
      if (overlay && overlay.classList.contains('active')) {
        togglePlayground();
      }
    }
  });
  
  // Resizable divider
  var divider = document.getElementById('playgroundDivider');
  if (divider) {
    var isDragging = false;
    
    divider.addEventListener('mousedown', function(e) {
      isDragging = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var body = document.querySelector('.playground-body');
      var editors = document.querySelector('.playground-editors');
      if (!body || !editors) return;
      
      var rect = body.getBoundingClientRect();
      var percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.max(20, Math.min(80, percent));
      
      editors.style.flex = 'none';
      editors.style.width = percent + '%';
    });
    
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }
});

/* ============================================
   HERO TYPING EFFECT - v9.0
   Real animated typing with word cycling
   ============================================ */
function initHeroTypingEffect() {
  const el = document.getElementById('heroTypingText');
  if (!el) return;
  
  const words = ['AI Power', 'Real Projects', 'Smart Tools', 'Free Tutorials', 'Code4Boy'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;
  
  function typeLoop() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 120;
    }
    
    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400; // Pause before next word
    }
    
    setTimeout(typeLoop, typeSpeed);
  }
  
  // Start after hero animation completes
  setTimeout(typeLoop, 2000);
}

/* ============================================
   MOUSE GLOW EFFECT - v9.0
   Follows cursor with subtle glow
   ============================================ */
function initMouseGlow() {
  const glow = document.getElementById('mouseGlow');
  if (!glow) return;
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return; // Skip on mobile
  
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.classList.add('active');
  });
  
  document.addEventListener('mouseleave', () => {
    glow.classList.remove('active');
  });
  
  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  
  animateGlow();
}

/* ============================================
   PARALLAX SCROLL - v9.0
   Smooth parallax on hero and sections
   ============================================ */
function initParallaxScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;
  
  const hero = document.querySelector('.hero');
  const shapes = document.querySelectorAll('.hero-float-shape');
  const sections = document.querySelectorAll('.section');
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        
        // Parallax on hero
        if (hero) {
          const heroBottom = hero.offsetTop + hero.offsetHeight;
          if (scrollY < heroBottom) {
            hero.style.backgroundPositionY = (scrollY * 0.3) + 'px';
          }
        }
        
        // Parallax on floating shapes
        shapes.forEach((shape, i) => {
          const speed = 0.03 + (i * 0.015);
          const direction = i % 2 === 0 ? 1 : -1;
          shape.style.transform = 'translateY(' + (scrollY * speed * direction) + 'px)';
        });
        
        // Subtle section parallax
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const visible = rect.top < window.innerHeight && rect.bottom > 0;
          if (visible) {
            const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const translateY = (progress - 0.5) * 20;
            const sectionHeader = section.querySelector('.section-header');
            if (sectionHeader) {
              sectionHeader.style.transform = 'translateY(' + translateY + 'px)';
            }
          }
        });
        
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ============================================
   3D TILT CARDS - v9.0
   Real 3D tilt effect on mouse movement
   ============================================ */
function init3DTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;
  
  const cards = document.querySelectorAll('.card, .stat-card, .roadmap-card, .category-card, .tool-card, .download-card, .project-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

/* ============================================
   STAGGERED REVEAL - v9.0
   Enhanced staggered scroll animations
   ============================================ */
function initStaggeredReveal() {
  const grids = document.querySelectorAll('.cards-grid, .category-cards, .tools-grid, .roadmap-grid, .hero-stats-grid, .download-grid, .video-grid');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, index) => {
          child.style.opacity = '0';
          child.style.transform = 'translateY(30px)';
          child.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          child.style.transitionDelay = (index * 0.1) + 's';
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            });
          });
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });
  
  grids.forEach(grid => observer.observe(grid));
}

/* ============================================
   UPGRADE v12.0 - Enhanced Features
   ============================================ */

/* --- Smooth Easing Counter Animation --- */
function initSmoothCounters() {
  var counters = document.querySelectorAll('.stat-number[data-target], .counter[data-target]');
  if (!counters.length) return;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = 2000;
    var startTime = null;
    var card = el.closest('.stat-card');

    if (card) card.classList.add('counting');

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutExpo(progress);
      var current = Math.floor(easedProgress * target);
      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
        if (card) {
          card.classList.remove('counting');
          card.classList.add('counted');
        }
      }
    }

    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(counter) { observer.observe(counter); });
}

/* --- Button Ripple Effect --- */
function initButtonRipple() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-primary');
    if (!btn) return;

    var rect = btn.getBoundingClientRect();
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    var size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);

    ripple.addEventListener('animationend', function() {
      ripple.remove();
    });
  });
}

/* --- Card Hover Glow Tracking --- */
function initCardGlowTracking() {
  if (window.innerWidth < 768) return;

  document.addEventListener('mousemove', function(e) {
    var cards = document.querySelectorAll('.card, .project-card, .tool-card, .download-card');
    cards.forEach(function(card) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', x + 'px');
      card.style.setProperty('--mouse-y', y + 'px');
    });
  });
}

/* --- Keyboard Shortcut Handler --- */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl+K or Cmd+K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      var searchModal = document.querySelector('.search-modal');
      if (searchModal) {
        searchModal.classList.toggle('active');
        var input = searchModal.querySelector('.search-modal-input');
        if (input && searchModal.classList.contains('active')) {
          setTimeout(function() { input.focus(); }, 100);
        }
      }
    }

    // Escape to close modals
    if (e.key === 'Escape') {
      var escSearchModal = document.querySelector('.search-modal.active');
      if (escSearchModal) escSearchModal.classList.remove('active');
    }
  });
}

/* --- Enhanced Scroll Progress with Color Shift --- */
function initEnhancedScrollProgress() {
  var progressBar = document.getElementById('scrollProgressBar');
  if (!progressBar) return;

  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + '%';
  }, { passive: true });
}

/* --- Performance: Defer Non-Critical Images --- */
function initImageLazyLoad() {
  var images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    images.forEach(function(img) { imgObserver.observe(img); });
  } else {
    // Fallback: load all images
    images.forEach(function(img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }
}

/* --- Smooth Anchor Scroll --- */
function initSmoothAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      var navHeight = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;
      var targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });

      // Update URL without jump
      history.pushState(null, '', targetId);
    });
  });
}

/* --- Active Nav Link Highlighting --- */
function initActiveNavHighlight() {
  var sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  window.addEventListener('scroll', function() {
    var scrollPos = window.scrollY + 100;

    sections.forEach(function(section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });
}

/* --- Reading Time Estimator (for tutorial pages) --- */
function initReadingTime() {
  var article = document.querySelector('.tutorial-content, .article-content, main');
  if (!article) return;

  var readingTimeEl = document.querySelector('.reading-time');
  if (!readingTimeEl) return;

  var text = article.textContent || article.innerText;
  var wordCount = text.trim().split(/\s+/).length;
  var readingTime = Math.max(1, Math.ceil(wordCount / 200));
  readingTimeEl.textContent = readingTime + ' min read';
}

/* --- Render Admin-Uploaded Projects on Downloads Page --- */
function initAdminProjects() {
  var section = document.getElementById('adminProjectsSection');
  var grid = document.getElementById('adminProjectsGrid');
  if (!section || !grid) return;

  var projects = JSON.parse(localStorage.getItem('c4b-admin-projects') || '[]');
  if (projects.length === 0) return;

  section.style.display = 'block';
  var html = '';

  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    html += '<div class="download-card reveal">';
    html += '<div class="dl-icon">' + (p.icon || '\u{1F4E6}') + '</div>';
    html += '<h3>' + (p.title || 'Untitled Project') + '</h3>';
    html += '<p>' + (p.description || '') + '</p>';
    if (p.file) {
      html += '<button class="btn-download" data-proj-id="' + p.id + '"><i class="fas fa-download"></i> ' + (p.dlLabel || 'Download') + '</button>';
    } else {
      html += '<span style="color:var(--text-dim);font-size:0.82rem;"><i class="fas fa-info-circle"></i> Coming soon</span>';
    }
    html += '</div>';
  }

  grid.innerHTML = html;

  // Attach download handlers for admin projects
  grid.querySelectorAll('.btn-download[data-proj-id]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var projId = btn.getAttribute('data-proj-id');
      var proj = projects.find(function(p) { return p.id === projId; });
      if (!proj || !proj.file) return;

      var adSettings = JSON.parse(localStorage.getItem('c4b-ad-settings') || 'null');
      if (adSettings && adSettings.enabled) {
        showInterstitialAd(adSettings, function() {
          downloadAdminProject(proj);
        });
      } else {
        downloadAdminProject(proj);
      }
    });
  });
}

function downloadAdminProject(proj) {
  var file = proj.file;
  var blob;
  if (file.type === 'text') {
    blob = new Blob([file.content], { type: 'text/plain' });
  } else {
    var byteString = atob(file.content.split(',')[1]);
    var mimeString = file.content.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    blob = new Blob([ab], { type: mimeString });
  }
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification('Download started: ' + proj.title, 'success');
}

/* ============================================
   EXTERNAL VIDEO LABELS
   Adds "My Suggestion" above and disclaimer below
   external (non-Code4Boy) YouTube videos site-wide
   ============================================ */
function initExternalVideoLabels() {
  // Helper: create suggestion label
  function createSuggestionLabel() {
    var el = document.createElement('div');
    el.className = 'video-suggestion-label';
    el.innerHTML = '<i class="fas fa-lightbulb"></i> My Suggestion';
    return el;
  }
  // Helper: create disclaimer label
  function createDisclaimerLabel() {
    var el = document.createElement('div');
    el.className = 'video-disclaimer-label';
    el.innerHTML = '<i class="fas fa-info-circle"></i> This video is not ours';
    return el;
  }

  // 1. Handle video cards on YouTube page (youtube.html)
  var videoCards = document.querySelectorAll('.video-card[data-tab]');
  videoCards.forEach(function(card) {
    var tab = card.getAttribute('data-tab');
    // Skip Code4Boy's own videos
    if (tab === 'code4boy') return;
    // Skip if already labeled
    if (card.classList.contains('external-video')) return;
    
    card.classList.add('external-video');
    
    // Wrap card with labels inside a container div (keeps grid layout intact)
    var wrapper = document.createElement('div');
    wrapper.className = 'external-video-wrapper';
    // Copy data-tab and classes needed for tab filtering
    wrapper.setAttribute('data-tab', tab);
    // Copy relevant classes from card for tab-content visibility
    if (card.classList.contains('tab-content')) {
      wrapper.classList.add('tab-content');
      card.classList.remove('tab-content');
    }
    if (card.classList.contains('reveal')) {
      wrapper.classList.add('reveal');
    }
    
    card.parentNode.insertBefore(wrapper, card);
    wrapper.appendChild(createSuggestionLabel());
    wrapper.appendChild(card);
    wrapper.appendChild(createDisclaimerLabel());
  });

  // 2. Handle any YouTube iframe/embed on other pages (home, tutorials, etc.)
  var iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[data-src*="youtube.com"]');
  iframes.forEach(function(iframe) {
    // Skip if already inside a labeled container
    if (iframe.closest('.external-video-wrapper')) return;
    
    // Check if iframe is inside a video-card (e.g. home page)
    var parentCard = iframe.closest('.video-card');
    var targetEl = parentCard || iframe;
    
    // Skip if target is already wrapped
    if (targetEl.closest('.external-video-wrapper')) return;
    
    var wrapper = document.createElement('div');
    wrapper.className = 'external-video-wrapper';
    wrapper.style.marginBottom = '20px';
    
    targetEl.parentNode.insertBefore(wrapper, targetEl);
    wrapper.appendChild(createSuggestionLabel());
    wrapper.appendChild(targetEl);
    wrapper.appendChild(createDisclaimerLabel());
    
    if (parentCard) parentCard.classList.add('external-video');
  });

  // 3. Handle yt-lite players on non-YouTube pages (if any)
  var ytLitePlayers = document.querySelectorAll('.yt-lite[data-id]');
  ytLitePlayers.forEach(function(player) {
    var parentCard = player.closest('.video-card');
    // Skip if already labeled (YouTube page cards handled above)
    if (parentCard && parentCard.classList.contains('external-video')) return;
    if (player.closest('.external-video-wrapper')) return;
    // Skip Code4Boy video cards
    if (parentCard && parentCard.getAttribute('data-tab') === 'code4boy') return;
    
    var targetEl = parentCard || player;
    // Skip if already processed
    if (targetEl.closest('.external-video-wrapper')) return;
    
    var wrapper = document.createElement('div');
    wrapper.className = 'external-video-wrapper';
    
    targetEl.parentNode.insertBefore(wrapper, targetEl);
    wrapper.appendChild(createSuggestionLabel());
    wrapper.appendChild(targetEl);
    wrapper.appendChild(createDisclaimerLabel());
    
    if (parentCard) parentCard.classList.add('external-video');
  });
}

// Fetch all server settings on page load for cross-device sync
function fetchServerSettings() {
  var apiUrl = (typeof getApiBaseUrl === 'function') ? getApiBaseUrl() : '';
  if (!apiUrl || apiUrl.includes('BACKEND_URL_HERE')) return;

  fetch(apiUrl + '/api/settings', { method: 'GET', mode: 'cors' })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.status !== 'ok' || !data.data) return;
      var d = data.data;
      // Cache all server settings to localStorage
      if (d['admin-settings']) localStorage.setItem('c4b-admin-settings', JSON.stringify(d['admin-settings']));
      if (d['ad-settings']) localStorage.setItem('c4b-ad-settings', JSON.stringify(d['ad-settings']));
      if (d['website-controls']) localStorage.setItem('c4b-website-controls', JSON.stringify(d['website-controls']));
      if (d['notifications']) localStorage.setItem('c4b-notifications', JSON.stringify(d['notifications']));
      if (d['admin-tutorials']) localStorage.setItem('c4b-admin-tutorials', JSON.stringify(d['admin-tutorials']));
      if (d['admin-projects']) localStorage.setItem('c4b-admin-projects', JSON.stringify(d['admin-projects']));
    })
    .catch(function() { /* server unreachable */ });
}

/* --- What's New Ticker Auto-Scroll --- */
function initWhatsNewTicker() {
  var ticker = document.getElementById('whatsNewTicker');
  if (!ticker) return;

  var scrollSpeed = 1;
  var isPaused = false;
  var autoScrollInterval;

  function autoScroll() {
    autoScrollInterval = setInterval(function() {
      if (isPaused) return;
      ticker.scrollLeft += scrollSpeed;
      if (ticker.scrollLeft >= ticker.scrollWidth - ticker.clientWidth) {
        ticker.scrollLeft = 0;
      }
    }, 30);
  }

  ticker.addEventListener('mouseenter', function() { isPaused = true; });
  ticker.addEventListener('mouseleave', function() { isPaused = false; });
  ticker.addEventListener('touchstart', function() { isPaused = true; }, { passive: true });
  ticker.addEventListener('touchend', function() {
    setTimeout(function() { isPaused = false; }, 2000);
  });

  autoScroll();
}

/* --- Announcement Banner Persistence --- */
function initAnnouncementBanner() {
  var banner = document.getElementById('announcementBanner');
  if (!banner) return;

  if (localStorage.getItem('c4b-banner-closed') === 'v2') {
    banner.remove();
    document.body.classList.remove('has-banner');
    return;
  }

  var closeBtn = banner.querySelector('.close-banner');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      localStorage.setItem('c4b-banner-closed', 'v2');
    });
  }
}

/* --- Tech Badge Hover Animation --- */
function initTechBadgeAnimation() {
  var badges = document.querySelectorAll('.tech-badge');
  badges.forEach(function(badge) {
    badge.addEventListener('mouseenter', function() {
      var icon = badge.querySelector('i');
      if (icon) {
        icon.style.transform = 'scale(1.3) rotate(10deg)';
        icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });
    badge.addEventListener('mouseleave', function() {
      var icon = badge.querySelector('i');
      if (icon) {
        icon.style.transform = '';
      }
    });
  });
}

/* --- Hero Floating Particles --- */
function initHeroParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  var hero = document.querySelector('.hero');
  if (!hero) return;

  var container = document.createElement('div');
  container.className = 'hero-particles';
  hero.insertBefore(container, hero.firstChild);

  var colors = ['#4285f4', '#7b61ff', '#34a853', '#60a5fa', '#a78bfa'];
  for (var i = 0; i < 12; i++) {
    var particle = document.createElement('div');
    particle.className = 'hero-particle';
    var size = (Math.random() * 3 + 1) + 'px';
    particle.style.width = size;
    particle.style.height = size;
    particle.style.left = (Math.random() * 100) + '%';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.boxShadow = '0 0 ' + (Math.random() * 4 + 2) + 'px ' + particle.style.background;
    particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

/* --- Initialize All v12.0 Upgrades --- */
document.addEventListener('DOMContentLoaded', function() {
  fetchServerSettings();
  initSmoothCounters();
  initButtonRipple();
  initCardGlowTracking();
  initKeyboardShortcuts();
  initEnhancedScrollProgress();
  initImageLazyLoad();
  initSmoothAnchorScroll();
  initActiveNavHighlight();
  initReadingTime();
  initExternalVideoLabels();
  initWhatsNewTicker();
  initAnnouncementBanner();
  initTechBadgeAnimation();
  initHeroParticles();
});
