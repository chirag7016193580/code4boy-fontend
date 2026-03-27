/**
 * Prism.js Auto-Highlighter for Code4Boy
 * Automatically detects language from .code-lang text and applies Prism syntax highlighting.
 * Works with dynamically loaded tutorial content (JS-injected tutorials, admin tutorials, etc.)
 */
(function () {
  'use strict';

  // Map code-lang label text to Prism language class
  var langMap = {
    'html': 'markup',
    'html5': 'markup',
    'xml': 'markup',
    'svg': 'markup',
    'css': 'css',
    'css3': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'javascript': 'javascript',
    'js': 'javascript',
    'jsx': 'jsx',
    'typescript': 'typescript',
    'ts': 'typescript',
    'tsx': 'tsx',
    'python': 'python',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'c++': 'cpp',
    'cpp': 'cpp',
    'c#': 'csharp',
    'csharp': 'csharp',
    'php': 'php',
    'ruby': 'ruby',
    'go': 'go',
    'golang': 'go',
    'rust': 'rust',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'dart': 'dart',
    'r': 'r',
    'matlab': 'matlab',
    'perl': 'perl',
    'lua': 'lua',
    'bash': 'bash',
    'shell': 'bash',
    'sh': 'bash',
    'shell/bash': 'bash',
    'powershell': 'powershell',
    'sql': 'sql',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'markdown': 'markdown',
    'md': 'markdown',
    'docker': 'docker',
    'dockerfile': 'docker',
    'haskell': 'haskell',
    'scala': 'scala',
    'node.js': 'javascript',
    'nodejs': 'javascript',
    'react': 'jsx',
    'vue': 'markup',
    'angular': 'typescript',
    'code': 'javascript',
    'ai': 'python',
    'ai tools': 'python',
    'other': 'javascript'
  };

  /**
   * Highlight all code blocks on the page.
   * Finds .code-block elements, reads the .code-lang label,
   * adds the appropriate Prism language class, and runs Prism.
   */
  function highlightAllCodeBlocks(root) {
    if (typeof Prism === 'undefined') return;

    var container = root || document;
    var codeBlocks = container.querySelectorAll('.code-block');

    codeBlocks.forEach(function (block) {
      var codeEl = block.querySelector('pre > code');
      if (!codeEl) return;

      // Skip if already highlighted by Prism
      if (codeEl.classList.contains('prism-highlighted')) return;

      // Skip if code has manual span-based highlighting (like HTML tutorials)
      // These already have colored spans, so Prism would break them
      if (codeEl.querySelector('.code-tag, .code-attr, .code-string, .code-comment, .code-keyword')) {
        codeEl.classList.add('prism-highlighted');
        return;
      }

      // Detect language from .code-lang text
      var langEl = block.querySelector('.code-lang');
      var langText = langEl ? langEl.textContent.trim().toLowerCase() : '';
      var prismLang = langMap[langText] || 'javascript';

      // Add Prism language class
      codeEl.className = codeEl.className.replace(/language-\S+/g, '');
      codeEl.classList.add('language-' + prismLang);

      var preEl = codeEl.parentElement;
      if (preEl && preEl.tagName === 'PRE') {
        preEl.className = preEl.className.replace(/language-\S+/g, '');
        preEl.classList.add('language-' + prismLang);
      }

      // Run Prism on this element
      try {
        Prism.highlightElement(codeEl);
      } catch (e) {
        // Fallback: silently skip if Prism fails for this element
      }
      codeEl.classList.add('prism-highlighted');
    });
  }

  // Expose globally so it can be called after dynamic content loads
  window.c4bHighlightCode = highlightAllCodeBlocks;

  // Auto-run after page load with delays to catch dynamically loaded content
  function runHighlight() {
    highlightAllCodeBlocks();
    // Re-run after tutorial JS files inject content
    setTimeout(highlightAllCodeBlocks, 1000);
    setTimeout(highlightAllCodeBlocks, 2000);
    setTimeout(highlightAllCodeBlocks, 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runHighlight);
  } else {
    runHighlight();
  }

  // Also observe DOM changes to catch dynamically added code blocks
  if (typeof MutationObserver !== 'undefined') {
    var debounceTimer;
    var observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(highlightAllCodeBlocks, 300);
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }
})();
