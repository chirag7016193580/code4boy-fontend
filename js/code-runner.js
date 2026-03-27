/* ============================================
   Code4Boy - Universal Code Runner v1.1
   Adds "Run" button to all code blocks across
   every language tutorial. Uses Wandbox API
   for server-side languages, iframe for HTML/CSS/JS.
   ============================================ */

(function () {
  'use strict';

  // ── Wandbox API endpoint (replaces Judge0 CE which is no longer available) ──
  var WANDBOX_API = 'https://wandbox.org/api/compile.json';

  // ── Language → Wandbox compiler mapping ──
  var LANG_MAP = {
    'python':     { compiler: 'cpython-3.12.7',     name: 'Python' },
    'py':         { compiler: 'cpython-3.12.7',     name: 'Python' },
    'javascript': { compiler: 'nodejs-20.17.0',     name: 'JavaScript' },
    'js':         { compiler: 'nodejs-20.17.0',     name: 'JavaScript' },
    'node':       { compiler: 'nodejs-20.17.0',     name: 'JavaScript' },
    'node.js':    { compiler: 'nodejs-20.17.0',     name: 'JavaScript' },
    'nodejs':     { compiler: 'nodejs-20.17.0',     name: 'JavaScript' },
    'typescript': { compiler: 'typescript-5.6.2',   name: 'TypeScript' },
    'ts':         { compiler: 'typescript-5.6.2',   name: 'TypeScript' },
    'java':       { compiler: 'openjdk-jdk-22+36',  name: 'Java' },
    'kotlin':     { compiler: null,                 name: 'Kotlin' },
    'swift':      { compiler: 'swift-6.0.1',        name: 'Swift' },
    'c#':         { compiler: 'mono-6.12.0.199',    name: 'C#' },
    'csharp':     { compiler: 'mono-6.12.0.199',    name: 'C#' },
    'c sharp':    { compiler: 'mono-6.12.0.199',    name: 'C#' },
    'r':          { compiler: 'r-4.4.1',            name: 'R' },
    'rscript':    { compiler: 'r-4.4.1',            name: 'R' },
    'matlab':     { compiler: null,                 name: 'Octave' },
    'octave':     { compiler: null,                 name: 'Octave' },
    'c++':        { compiler: 'gcc-14.2.0',         name: 'C++' },
    'cpp':        { compiler: 'gcc-14.2.0',         name: 'C++' },
    'c':          { compiler: 'gcc-14.2.0-c',       name: 'C' },
    'rust':       { compiler: 'rust-1.82.0',        name: 'Rust' },
    'go':         { compiler: 'go-1.23.2',          name: 'Go' },
    'golang':     { compiler: 'go-1.23.2',          name: 'Go' },
    'bash':       { compiler: 'bash',               name: 'Bash' },
    'shell':      { compiler: 'bash',               name: 'Bash' },
    'sh':         { compiler: 'bash',               name: 'Bash' },
    'perl':       { compiler: 'perl-5.42.0',        name: 'Perl' },
    'lua':        { compiler: 'lua-5.4.7',          name: 'Lua' },
    'haskell':    { compiler: 'ghc-9.10.1',         name: 'Haskell' },
    'php':        { compiler: 'php-8.3.12',         name: 'PHP' },
    'dart':       { compiler: null,                 name: 'Dart' },
    'ruby':       { compiler: null,                 name: 'Ruby' },
    'scala':      { compiler: 'scala-3.5.1',        name: 'Scala' }
  };

  // Languages that should NOT get a Run button (setup/config blocks)
  var SKIP_LANGS = ['setup', 'terminal', 'cmd', 'powershell', 'output', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf', 'config', 'sql', 'csv', 'plaintext', 'text', 'txt', 'markdown', 'md', 'log'];

  // ── Detect language from code-lang label ──
  function detectLang(label) {
    if (!label) return null;
    var raw = label.trim().toLowerCase();
    // Direct match
    if (LANG_MAP[raw]) return LANG_MAP[raw];
    // Fuzzy match
    for (var key in LANG_MAP) {
      if (raw.indexOf(key) !== -1) return LANG_MAP[key];
    }
    return null;
  }

  // ── Check if this code-lang label should be skipped ──
  function shouldSkip(label) {
    if (!label) return true;
    var raw = label.trim().toLowerCase();
    for (var i = 0; i < SKIP_LANGS.length; i++) {
      if (raw === SKIP_LANGS[i] || raw.indexOf(SKIP_LANGS[i]) !== -1) return true;
    }
    return false;
  }

  // ── Render output panel ──
  function renderOutput(outputEl, runBtn, elapsed, stdout, stderr, compileErr, exitStatus) {
    var output = '';
    if (compileErr) {
      output += '<span class="cr-stderr">Compilation Error:\n' + escapeHtml(compileErr) + '</span>';
    }
    if (stdout) output += escapeHtml(stdout);
    if (stderr) output += (output ? '\n' : '') + '<span class="cr-stderr">' + escapeHtml(stderr) + '</span>';
    if (!output) {
      if (exitStatus === '0' || exitStatus === 0) {
        output = '<span class="cr-info">Program executed successfully (no output)</span>';
      } else {
        output = '<span class="cr-stderr">Program exited with code ' + escapeHtml(String(exitStatus || 'unknown')) + '</span>';
      }
    }

    outputEl.innerHTML = '<div class="cr-header"><span class="cr-title"><i class="fas fa-terminal"></i> Output</span><span class="cr-time">' + elapsed + 's</span></div><pre class="cr-output">' + output + '</pre>';
    runBtn.disabled = false;
    runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
  }

  // ── Run code via Wandbox API ──
  function runWithWandbox(code, langInfo, outputEl, runBtn, stdinValue) {
    if (!langInfo.compiler) {
      outputEl.style.display = 'block';
      outputEl.innerHTML = '<div class="cr-header"><span class="cr-title"><i class="fas fa-terminal"></i> Output</span></div><pre class="cr-output"><span class="cr-info">' + langInfo.name + ' is not yet supported for online execution.</span></pre>';
      return;
    }

    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    outputEl.style.display = 'block';
    outputEl.innerHTML = '<div class="cr-loading"><i class="fas fa-circle-notch fa-spin"></i> Executing ' + langInfo.name + ' code...</div>';

    var startTime = Date.now();

    var requestBody = {
      code: code,
      compiler: langInfo.compiler
    };
    if (stdinValue) {
      requestBody.stdin = stdinValue;
    }

    fetch(WANDBOX_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Server returned ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      var stdout = data.program_output || '';
      var stderr = data.program_error || '';
      var compileErr = data.compiler_error || '';
      var exitStatus = data.status;
      renderOutput(outputEl, runBtn, elapsed, stdout, stderr, compileErr, exitStatus);
    })
    .catch(function (err) {
      var elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      outputEl.innerHTML = '<div class="cr-header"><span class="cr-title"><i class="fas fa-terminal"></i> Output</span><span class="cr-time">' + elapsed + 's</span></div><pre class="cr-output"><span class="cr-stderr">Network error: ' + escapeHtml(err.message) + '\nMake sure you are connected to the internet.</span></pre>';
      runBtn.disabled = false;
      runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
    });
  }

  // ── Run HTML/CSS/JS in iframe ──
  function runInIframe(code, langLabel, outputEl, runBtn) {
    outputEl.style.display = 'block';
    var iframe = document.createElement('iframe');
    iframe.className = 'cr-iframe';
    iframe.sandbox = 'allow-scripts';
    outputEl.innerHTML = '<div class="cr-header"><span class="cr-title"><i class="fas fa-eye"></i> Preview</span><button class="cr-close-btn" title="Close preview"><i class="fas fa-times"></i></button></div>';
    outputEl.appendChild(iframe);

    var closeBtn = outputEl.querySelector('.cr-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        outputEl.style.display = 'none';
        outputEl.innerHTML = '';
      });
    }

    var lbl = langLabel.trim().toLowerCase();
    var doc;
    if (lbl === 'html' || lbl === 'html5') {
      doc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;padding:16px;background:#1a1a2e;color:#eee;}</style></head><body>' + code + '</body></html>';
    } else if (lbl === 'css' || lbl === 'css3') {
      doc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + code + '</style></head><body><div class="demo">CSS Preview</div><div class="box"></div><p>Your CSS styles are applied above.</p></body></html>';
    } else {
      // JS
      doc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:monospace;padding:16px;background:#1a1a2e;color:#0f0;white-space:pre-wrap;}</style></head><body><script>'
        + 'var _out="";\n'
        + 'var _origLog=console.log;\n'
        + 'console.log=function(){var a=Array.from(arguments).map(function(v){return typeof v==="object"?JSON.stringify(v,null,2):String(v)}).join(" ");_out+=a+"\\n";document.body.textContent=_out;_origLog.apply(console,arguments);};\n'
        + 'console.error=console.log;console.warn=console.log;\n'
        + 'try{\n' + code + '\n}catch(e){console.log("Error: "+e.message);}\n'
        + '<\/script></body></html>';
    }
    iframe.srcdoc = doc;
  }

  // ── Escape HTML ──
  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Main: add Run buttons to all code blocks ──
  function initCodeRunners() {
    var codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(function (block) {
      // Skip if already processed
      if (block.getAttribute('data-runner-init')) return;
      block.setAttribute('data-runner-init', '1');

      var header = block.querySelector('.code-header');
      var langSpan = block.querySelector('.code-lang');
      var codeEl = block.querySelector('pre code') || block.querySelector('pre');
      if (!header || !codeEl) return;

      var langLabel = langSpan ? langSpan.textContent : '';

      // Skip non-runnable blocks
      if (shouldSkip(langLabel)) return;

      // Detect if we can run it
      var langInfo = detectLang(langLabel);
      var isWebLang = /^(html|html5|css|css3)$/i.test(langLabel.trim());
      if (!langInfo && !isWebLang) return;

      // Create Run button
      var runBtn = document.createElement('button');
      runBtn.className = 'run-btn';
      runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
      runBtn.title = 'Run this code';
      header.appendChild(runBtn);

      // Create stdin input for server-side languages
      var stdinEl = null;
      if (langInfo) {
        stdinEl = document.createElement('div');
        stdinEl.className = 'cr-stdin-panel';
        stdinEl.innerHTML = '<div class="cr-stdin-header"><span class="cr-stdin-label"><i class="fas fa-keyboard"></i> Input (stdin)</span><button class="cr-stdin-toggle" title="Toggle input">Hide</button></div><textarea class="cr-stdin-input" placeholder="Enter input for your program here (numbers, text)..." rows="2"></textarea>';
        block.appendChild(stdinEl);

        var stdinToggle = stdinEl.querySelector('.cr-stdin-toggle');
        var stdinTextarea = stdinEl.querySelector('.cr-stdin-input');
        stdinToggle.addEventListener('click', function() {
          if (stdinTextarea.style.display === 'none') {
            stdinTextarea.style.display = '';
            stdinToggle.textContent = 'Hide';
          } else {
            stdinTextarea.style.display = 'none';
            stdinToggle.textContent = 'Show';
          }
        });
      }

      // Create output container (hidden by default)
      var outputEl = document.createElement('div');
      outputEl.className = 'cr-result';
      outputEl.style.display = 'none';
      block.appendChild(outputEl);

      // Click handler
      runBtn.addEventListener('click', function () {
        var rawCode = codeEl.textContent || '';
        // Clean up: remove leading comments that are instructions (like "# Install...")
        // but keep actual code
        rawCode = rawCode.trim();
        if (!rawCode) {
          outputEl.style.display = 'block';
          outputEl.innerHTML = '<div class="cr-header"><span class="cr-title"><i class="fas fa-terminal"></i> Output</span></div><pre class="cr-output"><span class="cr-info">No code to run</span></pre>';
          return;
        }

        if (isWebLang) {
          runInIframe(rawCode, langLabel, outputEl, runBtn);
        } else {
          var stdinValue = '';
          if (stdinEl) {
            var stdinInput = stdinEl.querySelector('.cr-stdin-input');
            if (stdinInput) stdinValue = stdinInput.value;
          }
          runWithWandbox(rawCode, langInfo, outputEl, runBtn, stdinValue);
        }
      });
    });
  }

  // ── Run on page load and also observe for dynamically added code blocks ──
  function setup() {
    // Initial run
    initCodeRunners();

    // Re-run for dynamically loaded content (tutorial tabs, accordions)
    var observer = new MutationObserver(function (mutations) {
      var shouldInit = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) {
          shouldInit = true;
          break;
        }
      }
      if (shouldInit) {
        // Debounce
        clearTimeout(setup._timer);
        setup._timer = setTimeout(initCodeRunners, 300);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also run when tabs are switched
    document.addEventListener('click', function (e) {
      var tabBtn = e.target.closest('.tab-btn');
      if (tabBtn) {
        setTimeout(initCodeRunners, 500);
      }
    });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
