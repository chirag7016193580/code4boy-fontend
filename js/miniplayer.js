/* ============================================
   CODE4BOY AI TEACHER - MINIPLAYER
   Floating mini chat widget for all pages
   Works offline, no API needed
   ============================================ */

(function() {
  'use strict';

  // Don't show miniplayer on pages that already have a chat widget
  var path = window.location.pathname;
  if (path.indexOf('ai-teacher') >= 0) return;
  // Skip index.html / root - it already has its own Code4Boy Help chat widget & playground FAB
  if (path === '/' || path === '' || /\/(index\.html)?(\?|#|$)/.test(path)) return;
  if (path.match(/\/Code4Boy[^\/]*\/?$/) || path.match(/\/Code4Boy[^\/]*\/index\.html/)) return;

  // ============================================
  // MINI KNOWLEDGE BASE (compact version)
  // ============================================
  var miniKB = {
    greetings: [
      "Hey! I'm your Code4Boy AI assistant. Ask me anything about coding!",
      "Hi there! Need help with programming? I'm here for you!",
      "Hello! I can help with HTML, CSS, JS, Python and more. What's up?"
    ],
    quickAnswers: {
      'html': "**HTML** (HyperText Markup Language) is the standard language for creating web pages. It uses tags like `<div>`, `<p>`, `<h1>` to structure content.\n\nWant a full lesson? Visit our <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'css': "**CSS** (Cascading Style Sheets) styles your web pages - colors, fonts, layouts, animations!\n\nKey features: Flexbox, Grid, Variables, Animations.\n\nLearn more at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'javascript': "**JavaScript** makes websites interactive! It handles events, DOM manipulation, APIs, and more.\n\nGet full lessons at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'python': "**Python** is a beginner-friendly language for AI, data science, web dev, and automation.\n\nLearn step-by-step at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'loop': "**Loops** repeat code multiple times. Types: `for`, `while`, `for...of/in`.\n\nExample (JS):\n`for (let i = 0; i < 5; i++) { console.log(i); }`\n\nMore examples at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'function': "**Functions** are reusable blocks of code.\n\nJS: `function greet(name) { return 'Hi ' + name; }`\nPython: `def greet(name): return f'Hi {name}'`\n\nDeep dive at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'api': "**API** (Application Programming Interface) lets apps communicate. REST APIs use HTTP methods: GET, POST, PUT, DELETE.\n\nLearn more at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'git': "**Git** tracks code changes. Key commands:\n`git init` | `git add .` | `git commit -m 'msg'` | `git push`\n\nFull guide at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!",
      'error': "**Debugging tips:**\n1. Read the error message carefully\n2. Check browser console (F12)\n3. Look for typos\n4. Use console.log to trace values\n\nMore help at <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>!"
    },
    tips: [
      "Use `const` by default in JavaScript. Only use `let` when you need to reassign.",
      "CSS `gap` works with both Flexbox and Grid - no more margin hacks!",
      "Python f-strings: `f'Hello {name}'` is cleaner than concatenation.",
      "Always use semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`.",
      "Git tip: Write meaningful commit messages, not just 'fixed stuff'.",
      "Use CSS variables for consistent theming: `:root { --primary: #00d4ff; }`",
      "JavaScript `?.` optional chaining prevents 'Cannot read property of undefined'.",
      "Python list comprehension: `[x**2 for x in range(10)]` is clean and fast!"
    ],
    fallback: "I can help with quick coding questions! For in-depth learning, visit our <a href='{prefix}ai-teacher.html' style='color:#00d4ff'>AI Teacher</a> page for full lessons, quizzes, and challenges."
  };

  // ============================================
  // DETERMINE PATH PREFIX
  // ============================================
  var isSubPage = window.location.pathname.indexOf('/pages/') >= 0;
  var prefix = isSubPage ? '' : 'pages/';

  function fixLinks(text) {
    return text.replace(/\{prefix\}/g, prefix);
  }

  // ============================================
  // PROCESS MINI MESSAGES
  // ============================================
  function processMiniMessage(input) {
    var q = input.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|hola|yo|sup)[\s!.?]*$/i.test(q)) {
      return miniKB.greetings[Math.floor(Math.random() * miniKB.greetings.length)];
    }

    // Quick topic matching
    var topics = {
      'html': /\bhtml\b/i,
      'css': /\bcss\b|flexbox|grid|style/i,
      'javascript': /\bjavascript\b|\bjs\b|dom/i,
      'python': /\bpython\b/i,
      'loop': /\bloop|for loop|while/i,
      'function': /\bfunction|method|def\b/i,
      'api': /\bapi\b|fetch|rest/i,
      'git': /\bgit\b|github|commit/i,
      'error': /\berror|bug|debug|fix|not working/i
    };

    for (var key in topics) {
      if (topics[key].test(q)) {
        return fixLinks(miniKB.quickAnswers[key]);
      }
    }

    // Tip request
    if (/tip|trick|advice/i.test(q)) {
      return "**Quick Tip:**\n" + miniKB.tips[Math.floor(Math.random() * miniKB.tips.length)];
    }

    // Thanks
    if (/thank|thanks|thx/i.test(q)) {
      return "You're welcome! Happy coding! For deeper learning, try our <a href='" + prefix + "ai-teacher.html' style='color:#00d4ff'>AI Teacher</a>.";
    }

    // Fallback
    return fixLinks(miniKB.fallback);
  }

  // ============================================
  // CREATE MINIPLAYER UI
  // ============================================
  function createMiniplayer() {
    // Double-check: skip if existing chat widget is on this page
    if (document.getElementById('chatWidget') || document.getElementById('chatToggle')) return;

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = `
      /* Miniplayer Container */
      .c4b-miniplayer {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      }

      /* Toggle Button */
      .c4b-mini-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00d4ff, #8b5cf6);
        border: none;
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
        transition: all 0.3s ease;
        position: relative;
      }

      .c4b-mini-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(139, 92, 246, 0.3);
      }

      .c4b-mini-toggle .c4b-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #00d4ff, #8b5cf6);
        animation: c4bPulse 2s ease-out infinite;
        opacity: 0;
      }

      @keyframes c4bPulse {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.8); opacity: 0; }
      }

      .c4b-mini-toggle .c4b-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ef4444;
        font-size: 0.65rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        border: 2px solid #0a0a1e;
        display: none;
      }

      /* Chat Window */
      .c4b-mini-window {
        position: absolute;
        bottom: 72px;
        right: 0;
        width: 360px;
        max-height: 480px;
        background: rgba(10, 10, 30, 0.95);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 18px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.15);
        backdrop-filter: blur(20px);
        transform: scale(0.8) translateY(20px);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .c4b-mini-window.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      /* Mini Header */
      .c4b-mini-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: rgba(15, 15, 40, 0.8);
        border-bottom: 1px solid rgba(139, 92, 246, 0.2);
      }

      .c4b-mini-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00d4ff, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        color: #fff;
        flex-shrink: 0;
      }

      .c4b-mini-header-info h4 {
        margin: 0;
        font-size: 0.9rem;
        color: #e2e8f0;
        font-weight: 600;
      }

      .c4b-mini-header-info span {
        font-size: 0.7rem;
        color: #10b981;
      }

      .c4b-mini-close {
        margin-left: auto;
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        font-size: 1rem;
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s;
      }

      .c4b-mini-close:hover { color: #fff; }

      .c4b-mini-expand {
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        font-size: 0.85rem;
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s;
        text-decoration: none;
      }

      .c4b-mini-expand:hover { color: #00d4ff; }

      /* Mini Messages */
      .c4b-mini-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 300px;
        min-height: 200px;
        scroll-behavior: smooth;
      }

      .c4b-mini-messages::-webkit-scrollbar { width: 4px; }
      .c4b-mini-messages::-webkit-scrollbar-track { background: transparent; }
      .c4b-mini-messages::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }

      .c4b-mini-msg {
        display: flex;
        gap: 8px;
        max-width: 90%;
        animation: c4bMsgIn 0.3s ease;
      }

      @keyframes c4bMsgIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .c4b-mini-msg.bot { align-self: flex-start; }
      .c4b-mini-msg.user { align-self: flex-end; flex-direction: row-reverse; }

      .c4b-mini-msg-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 0.75rem;
      }

      .c4b-mini-msg.bot .c4b-mini-msg-icon {
        background: linear-gradient(135deg, #00d4ff, #8b5cf6);
        color: #fff;
      }

      .c4b-mini-msg.user .c4b-mini-msg-icon {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
      }

      .c4b-mini-msg-text {
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 0.82rem;
        line-height: 1.55;
        color: #e2e8f0;
      }

      .c4b-mini-msg.bot .c4b-mini-msg-text {
        background: rgba(20, 20, 50, 0.8);
        border: 1px solid rgba(139, 92, 246, 0.15);
        border-top-left-radius: 4px;
      }

      .c4b-mini-msg.user .c4b-mini-msg-text {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.15));
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-top-right-radius: 4px;
      }

      .c4b-mini-msg-text code {
        background: rgba(0,0,0,0.4);
        padding: 1px 5px;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.78rem;
        color: #00d4ff;
      }

      .c4b-mini-msg-text strong { color: #00d4ff; }

      .c4b-mini-msg-text a {
        color: #00d4ff;
        text-decoration: none;
      }

      .c4b-mini-msg-text a:hover { text-decoration: underline; }

      /* Speak Button */
      .c4b-mini-speak {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.25);
        color: #00d4ff;
        cursor: pointer;
        font-size: 0.65rem;
        margin-top: 6px;
        transition: all 0.25s ease;
        float: right;
      }

      .c4b-mini-speak:hover {
        background: rgba(0, 212, 255, 0.25);
        transform: scale(1.1);
      }

      .c4b-mini-speak.speaking {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.4);
        color: #ef4444;
      }

      /* Mini Typing */
      .c4b-mini-typing {
        display: flex;
        gap: 4px;
        padding: 8px 14px;
        align-self: flex-start;
      }

      .c4b-mini-typing span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #00d4ff;
        animation: c4bTypeDot 1.4s infinite;
      }

      .c4b-mini-typing span:nth-child(2) { animation-delay: 0.2s; }
      .c4b-mini-typing span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes c4bTypeDot {
        0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
        30% { opacity: 1; transform: scale(1.1); }
      }

      /* Mini Input */
      .c4b-mini-input-area {
        display: flex;
        gap: 8px;
        padding: 12px 14px;
        background: rgba(15, 15, 40, 0.8);
        border-top: 1px solid rgba(139, 92, 246, 0.2);
        align-items: center;
      }

      .c4b-mini-input-area input {
        flex: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 10px;
        padding: 10px 14px;
        color: #e2e8f0;
        font-size: 0.82rem;
        outline: none;
        font-family: inherit;
        transition: border-color 0.2s;
      }

      .c4b-mini-input-area input:focus {
        border-color: #00d4ff;
        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1);
      }

      .c4b-mini-input-area input::placeholder {
        color: rgba(255,255,255,0.3);
      }

      .c4b-mini-send {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(135deg, #00d4ff, #8b5cf6);
        border: none;
        color: #fff;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
        flex-shrink: 0;
      }

      .c4b-mini-send:hover { transform: scale(1.05); }

      /* Quick Actions */
      .c4b-mini-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        padding: 8px 14px 4px;
      }

      .c4b-mini-quick-btn {
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(0, 212, 255, 0.2);
        background: rgba(0, 212, 255, 0.06);
        color: #00d4ff;
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .c4b-mini-quick-btn:hover {
        background: rgba(0, 212, 255, 0.15);
        border-color: #00d4ff;
      }

      /* Notification dot animation */
      .c4b-mini-toggle.has-notif .c4b-badge {
        display: flex;
        animation: c4bBounce 0.5s ease;
      }

      @keyframes c4bBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }

      /* Responsive */
      @media (max-width: 480px) {
        .c4b-mini-window {
          width: calc(100vw - 32px);
          right: -8px;
          bottom: 68px;
          max-height: 420px;
        }

        .c4b-mini-toggle {
          width: 52px;
          height: 52px;
          font-size: 1.3rem;
        }

        .c4b-miniplayer {
          bottom: 16px;
          right: 16px;
        }
      }

      /* Light theme support */
      [data-theme="light"] .c4b-mini-window {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(139, 92, 246, 0.2);
      }

      [data-theme="light"] .c4b-mini-header {
        background: rgba(245, 245, 255, 0.9);
      }

      [data-theme="light"] .c4b-mini-header-info h4 { color: #1e293b; }

      [data-theme="light"] .c4b-mini-msg-text { color: #1e293b; }

      [data-theme="light"] .c4b-mini-msg.bot .c4b-mini-msg-text {
        background: rgba(240, 240, 255, 0.9);
        border-color: rgba(139, 92, 246, 0.1);
      }

      [data-theme="light"] .c4b-mini-msg.user .c4b-mini-msg-text {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1));
      }

      [data-theme="light"] .c4b-mini-input-area {
        background: rgba(245, 245, 255, 0.9);
      }

      [data-theme="light"] .c4b-mini-input-area input {
        background: rgba(0, 0, 0, 0.04);
        color: #1e293b;
        border-color: rgba(139, 92, 246, 0.15);
      }
    `;
    document.head.appendChild(style);

    // Create HTML
    var container = document.createElement('div');
    container.className = 'c4b-miniplayer';
    container.innerHTML = `
      <div class="c4b-mini-window" id="c4bMiniWindow">
        <div class="c4b-mini-header">
          <div class="c4b-mini-avatar"><i class="fas fa-robot"></i></div>
          <div class="c4b-mini-header-info">
            <h4>AI Teacher</h4>
            <span><i class="fas fa-circle" style="font-size:0.45rem;margin-right:3px"></i> Online</span>
          </div>
          <a href="${prefix}ai-teacher.html" class="c4b-mini-expand" title="Open full AI Teacher">
            <i class="fas fa-expand-alt"></i>
          </a>
          <button class="c4b-mini-close" onclick="c4bMiniToggle()" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="c4b-mini-messages" id="c4bMiniMessages"></div>
        <div class="c4b-mini-quick" id="c4bMiniQuick">
          <button class="c4b-mini-quick-btn" onclick="c4bMiniAsk('What is HTML?')">HTML</button>
          <button class="c4b-mini-quick-btn" onclick="c4bMiniAsk('CSS tips')">CSS</button>
          <button class="c4b-mini-quick-btn" onclick="c4bMiniAsk('JavaScript')">JS</button>
          <button class="c4b-mini-quick-btn" onclick="c4bMiniAsk('Python')">Python</button>
          <button class="c4b-mini-quick-btn" onclick="c4bMiniAsk('Give me a tip')">Quick Tip</button>
        </div>
        <div class="c4b-mini-input-area">
          <input type="text" id="c4bMiniInput" placeholder="Ask me anything..." onkeydown="if(event.key==='Enter')c4bMiniSend()">
          <button class="c4b-mini-send" onclick="c4bMiniSend()" title="Send">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <button class="c4b-mini-toggle" id="c4bMiniToggle" onclick="c4bMiniToggle()" title="AI Teacher">
        <div class="c4b-pulse"></div>
        <i class="fas fa-robot" id="c4bMiniToggleIcon"></i>
        <span class="c4b-badge" id="c4bMiniBadge">1</span>
      </button>
    `;
    document.body.appendChild(container);

    // Add welcome message
    setTimeout(function() {
      addMiniMessage("Hi! I'm your Code4Boy AI assistant. Ask me a quick coding question or visit <a href='" + prefix + "ai-teacher.html' style='color:#00d4ff'>AI Teacher</a> for full lessons!", 'bot');

      // Show notification after 3 seconds
      setTimeout(function() {
        var toggle = document.getElementById('c4bMiniToggle');
        if (toggle && !document.getElementById('c4bMiniWindow').classList.contains('open')) {
          toggle.classList.add('has-notif');
        }
      }, 3000);
    }, 500);

    // Auto-suggest after 30 seconds of page visit
    setTimeout(function() {
      var win = document.getElementById('c4bMiniWindow');
      if (win && !win.classList.contains('open')) {
        var toggle = document.getElementById('c4bMiniToggle');
        if (toggle) toggle.classList.add('has-notif');
      }
    }, 30000);
  }

  // ============================================
  // MINI CHAT FUNCTIONS
  // ============================================

  function formatMiniText(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }

  // Mini TTS engine - smooth single utterance, no stuttering
  var miniTTS = {
    currentBtn: null,
    bestVoice: null,
    voicePriority: [
      'Microsoft Aria Online', 'Microsoft Jenny Online', 'Microsoft Guy Online',
      'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira',
      'Google UK English Female', 'Google UK English Male', 'Google US English',
      'Samantha', 'Karen', 'Daniel', 'Moira', 'Tessa', 'Alex', 'Victoria', 'Ava'
    ],
    findBestVoice: function() {
      var voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      for (var i = 0; i < miniTTS.voicePriority.length; i++) {
        var priority = miniTTS.voicePriority[i];
        var m = voices.find(function(v) { return v.name.indexOf(priority) >= 0; });
        if (m) return m;
      }
      var premium = voices.find(function(v) {
        return (v.name.indexOf('Online') >= 0 || v.name.indexOf('Natural') >= 0) && v.lang.indexOf('en') >= 0;
      });
      if (premium) return premium;
      return voices.find(function(v) { return v.lang.indexOf('en') >= 0; }) || voices[0];
    },
    cleanText: function(text) {
      return text
        .replace(/<pre[\s\S]*?<\/pre>/gi, '. ')
        .replace(/<code>(.*?)<\/code>/gi, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/#{1,3}\s/g, '')
        .replace(/---/g, '. ')
        .replace(/console\.log/g, 'console dot log')
        .replace(/\.js\b/g, ' dot JS')
        .replace(/\.py\b/g, ' dot PY')
        .replace(/=>/g, ' arrow ')
        .replace(/===/g, ' strictly equals ')
        .replace(/\(\)/g, '')
        .replace(/[{}[\]|]/g, ' ')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .replace(/\.+/g, '.')
        .trim();
    },
    speak: function(text, btn) {
      if (!window.speechSynthesis) return;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (miniTTS.currentBtn) {
          miniTTS.currentBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
          miniTTS.currentBtn.classList.remove('speaking');
        }
        if (miniTTS.currentBtn === btn) { miniTTS.currentBtn = null; return; }
      }
      if (!miniTTS.bestVoice) miniTTS.bestVoice = miniTTS.findBestVoice();
      var clean = miniTTS.cleanText(text);
      if (!clean) return;
      var u = new SpeechSynthesisUtterance(clean);
      if (miniTTS.bestVoice) u.voice = miniTTS.bestVoice;
      u.lang = 'en-US';
      u.rate = 1.15;
      u.pitch = 1.02;
      u.volume = 1.0;
      if (btn) {
        btn.innerHTML = '<i class="fas fa-stop"></i>';
        btn.classList.add('speaking');
        miniTTS.currentBtn = btn;
      }
      u.onend = u.onerror = function() {
        if (miniTTS.currentBtn) {
          miniTTS.currentBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
          miniTTS.currentBtn.classList.remove('speaking');
        }
        miniTTS.currentBtn = null;
      };
      window.speechSynthesis.speak(u);
    }
  };

  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() { miniTTS.bestVoice = miniTTS.findBestVoice(); };
    setTimeout(function() { miniTTS.bestVoice = miniTTS.findBestVoice(); }, 100);
  }

  function addMiniMessage(text, type) {
    var messages = document.getElementById('c4bMiniMessages');
    if (!messages) return;

    var msg = document.createElement('div');
    msg.className = 'c4b-mini-msg ' + type;
    msg.innerHTML =
      '<div class="c4b-mini-msg-icon"><i class="fas fa-' + (type === 'bot' ? 'robot' : 'user') + '"></i></div>' +
      '<div class="c4b-mini-msg-text">' + formatMiniText(text) + '</div>';

    // Add speak button to bot messages
    if (type === 'bot' && window.speechSynthesis) {
      var speakBtn = document.createElement('button');
      speakBtn.className = 'c4b-mini-speak';
      speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      speakBtn.title = 'Listen';
      speakBtn.onclick = function() { miniTTS.speak(text, speakBtn); };
      msg.querySelector('.c4b-mini-msg-text').appendChild(speakBtn);
    }

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showMiniTyping() {
    var messages = document.getElementById('c4bMiniMessages');
    if (!messages) return;
    var typing = document.createElement('div');
    typing.className = 'c4b-mini-typing';
    typing.id = 'c4bMiniTyping';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideMiniTyping() {
    var el = document.getElementById('c4bMiniTyping');
    if (el) el.remove();
  }

  // ============================================
  // GLOBAL FUNCTIONS (accessible from HTML)
  // ============================================

  window.c4bMiniToggle = function() {
    var win = document.getElementById('c4bMiniWindow');
    var toggle = document.getElementById('c4bMiniToggle');
    var icon = document.getElementById('c4bMiniToggleIcon');

    if (!win) return;

    win.classList.toggle('open');

    if (win.classList.contains('open')) {
      icon.className = 'fas fa-times';
      toggle.classList.remove('has-notif');
      var input = document.getElementById('c4bMiniInput');
      if (input) setTimeout(function() { input.focus(); }, 300);
    } else {
      icon.className = 'fas fa-robot';
    }
  };

  window.c4bMiniSend = function() {
    var input = document.getElementById('c4bMiniInput');
    if (!input) return;

    var text = input.value.trim();
    if (!text) return;

    addMiniMessage(text, 'user');
    input.value = '';

    // Hide quick actions after first message
    var quick = document.getElementById('c4bMiniQuick');
    if (quick) quick.style.display = 'none';

    showMiniTyping();

    setTimeout(function() {
      hideMiniTyping();
      var response = processMiniMessage(text);
      addMiniMessage(response, 'bot');
    }, 400 + Math.random() * 400);
  };

  window.c4bMiniAsk = function(text) {
    var input = document.getElementById('c4bMiniInput');
    if (input) input.value = text;
    window.c4bMiniSend();
  };

  // ============================================
  // INIT
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMiniplayer);
  } else {
    createMiniplayer();
  }

})();
