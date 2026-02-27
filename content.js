// WebAudit - Content Script
// Performs DOM inspection and security analysis on the webpage

(function() {
  // Auto-scan when page loads (for already opened websites)
  // Small delay to ensure DOM is ready
  function runAutoScan() {
    try {
      // Run analysis and store for popup to retrieve
      var analysisResult = analyzePage();
      window.webauditData = analysisResult;
      
      // Dispatch event so popup knows data is ready
      window.dispatchEvent(new CustomEvent('webaudit-ready', { detail: analysisResult }));
    } catch (e) {
      console.log('WebAudit auto-scan:', e.message);
    }
  }
  
  // Run immediately if document is already complete, otherwise wait for load
  if (document.readyState === 'complete') {
    setTimeout(runAutoScan, 500);
  } else {
    window.addEventListener('load', function() {
      setTimeout(runAutoScan, 500);
    });
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyze") {
      try {
        const analysisResult = analyzePage();
        sendResponse(analysisResult);
      } catch (error) {
        sendResponse({ error: error.message });
      }
    }
    // Handle request for cached data (auto-scan results)
    if (request.action === "getCachedData") {
      try {
        // If we have cached data, return it
        if (window.webauditData) {
          sendResponse(window.webauditData);
        } else {
          // Run analysis and cache it
          var result = analyzePage();
          window.webauditData = result;
          sendResponse(result);
        }
      } catch (error) {
        sendResponse({ error: error.message });
      }
    }
    return true;
  });

  // Main analysis function
  function analyzePage() {
    const analysis = {
      url: window.location.href,
      title: document.title || 'Untitled',
      protocol: window.location.protocol,
      isHttps: window.location.protocol === 'https:',
      structure: getStructureAnalysis(),
      security: getSecurityAnalysis(),
      advanced: getAdvancedSecurityAnalysis(),
      developer: getDeveloperMetrics(),
      pageInfo: getPageInfo(),
      scores: calculateScores()
    };
    return analysis;
  }

  // ==================== PAGE INFO ====================
  function getPageInfo() {
    return {
      title: document.title || 'No title',
      description: document.querySelector('meta[name="description"]')?.content || 'None',
      viewport: !!document.querySelector('meta[name="viewport"]'),
      language: document.documentElement.lang || 'Not set',
      charset: document.characterSet || 'Unknown'
    };
  }

  // ==================== STRUCTURE ANALYSIS ====================
  function getStructureAnalysis() {
    const structure = {
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input').length,
      scripts: document.querySelectorAll('script').length,
      externalCSS: document.querySelectorAll('link[rel="stylesheet"]').length,
      images: document.querySelectorAll('img').length,
      imagesWithoutAlt: 0,
      hasMetaDescription: false,
      hasViewport: false,
      inlineScripts: 0,
      externalScripts: 0,
      deprecatedTags: []
    };

    // Deprecated HTML5 tags to check
    const deprecatedTags = ['center', 'font', 'strike', 'u', 'xmp', 'plaintext', 'marquee', 'blink', 'spacer', 'listing', 'multicol', 'nobr', 'noembed', 'plaintext'];
    const foundDeprecated = [];
    deprecatedTags.forEach(tag => {
      if (document.querySelectorAll(tag).length > 0) {
        foundDeprecated.push(tag);
      }
    });
    structure.deprecatedTags = foundDeprecated;

    // Check images without alt (exclude tracking pixels)
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (!src.includes('pixel') && !src.includes('tracking') && !src.includes('1x1')) {
        if (!img.hasAttribute('alt') || img.alt === '') {
          structure.imagesWithoutAlt++;
        }
      }
    });

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    structure.hasMetaDescription = !!(metaDesc || ogDesc);

    // Check viewport
    structure.hasViewport = !!document.querySelector('meta[name="viewport"]');

    // Count scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(s => {
      if (s.src) {
        structure.externalScripts++;
      } else if (s.textContent.trim().length > 0) {
        structure.inlineScripts++;
      }
    });

    return structure;
  }

  // ==================== SECURITY ANALYSIS ====================
  function getSecurityAnalysis() {
    const security = {
      isHttps: window.location.protocol === 'https:',
      formsWithPassword: 0,
      formsWithoutCSRF: 0,
      openPorts: 0,
      localStorageUsed: false,
      sessionStorageUsed: false,
      thirdPartyDomains: [],
      cookies: document.cookie ? document.cookie.split(';').length : 0,
      mixedContent: false,
      iframeCount: 0,
      externalLinks: 0,
      // NEW: Cookie security
      secureCookies: 0,
      httpOnlyCookies: 0,
      sameSiteCookies: 0,
      unsafeCookies: 0
    };

    // Check forms with password inputs
    const passwordForms = document.querySelectorAll('input[type="password"]');
    security.formsWithPassword = passwordForms.length;

    // Check for CSRF tokens in forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const csrfInputs = form.querySelectorAll('input[name*="csrf"], input[name*="token"], input[name*="_token"]');
      if (csrfInputs.length === 0 && form.method && form.method.toLowerCase() !== 'get') {
        security.formsWithoutCSRF++;
      }
    });

    // Check storage usage
    try {
      security.localStorageUsed = localStorage.length > 0;
      security.sessionStorageUsed = sessionStorage.length > 0;
    } catch (e) {}

    // Get third-party domains
    const scripts = document.querySelectorAll('script[src]');
    const domains = new Set();
    scripts.forEach(s => {
      try {
        const url = new URL(s.src);
        if (url.hostname !== window.location.hostname) {
          domains.add(url.hostname);
        }
      } catch (e) {}
    });
    security.thirdPartyDomains = Array.from(domains);

    // Check for mixed content
    if (window.location.protocol === 'https:') {
      const httpResources = document.querySelectorAll('[src^="http:"], [href^="http:"]');
      security.mixedContent = httpResources.length > 0;
    }

    // Count iframes
    security.iframeCount = document.querySelectorAll('iframe').length;

    // Count external links
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      try {
        const url = new URL(link.href);
        if (url.hostname !== window.location.hostname) {
          security.externalLinks++;
        }
      } catch (e) {}
    });

    // Analyze cookies (try to get from document.cookie, note: HttpOnly not accessible)
    if (document.cookie) {
      const cookieArray = document.cookie.split(';');
      cookieArray.forEach(cookie => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        const lowerCookie = cookie.toLowerCase();
        if (lowerCookie.includes('secure')) security.secureCookies++;
        if (lowerCookie.includes('httponly')) security.httpOnlyCookies++;
        if (lowerCookie.includes('samesite')) security.sameSiteCookies++;
        if (!lowerCookie.includes('secure') && !lowerCookie.includes('httponly')) {
          security.unsafeCookies++;
        }
      });
    }

    return security;
  }

  // ==================== ADVANCED SECURITY ANALYSIS ====================
  function getAdvancedSecurityAnalysis() {
    const advanced = {
      // CSP Analysis
      hasCSP: false,
      cspPolicy: '',
      cspWeak: false,
      
      // Subresource Integrity
      scriptsWithoutSRI: 0,
      stylesheetsWithoutSRI: 0,
      
      // DOM XSS Sinks
      dangerousSinks: [],
      
      // Referrer Policy
      hasReferrerPolicy: false,
      referrerPolicy: '',
      
      // Security Headers (via meta tags)
      hasXFrameOptions: false,
      hasXContentTypeOptions: false,
      hasPermissionsPolicy: false,
      
      // Third-party scripts analysis
      scriptsWithSrc: [],
      scriptsWithDefer: 0,
      scriptsWithAsync: 0,
      inlineEventHandlers: 0,
      
      // Form security
      formsWithAction: 0,
      formsWithPOST: 0,
      formsWithActionHTTP: 0
    };

    // CSP Detection
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      advanced.hasCSP = true;
      advanced.cspPolicy = cspMeta.getAttribute('content') || '';
      // Check for weak CSP (allow unsafe-inline, unsafe-eval, *)
      const weakPatterns = ["'unsafe-inline'", "'unsafe-eval'", " * "];
      advanced.cspWeak = weakPatterns.some(p => advanced.cspPolicy.includes(p));
    }

    // Subresource Integrity Check
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(s => {
      advanced.scriptsWithSrc.push(s.src);
      if (!s.hasAttribute('integrity')) {
        advanced.scriptsWithoutSRI++;
      }
    });

    const stylesheets = document.querySelectorAll('link[rel="stylesheet"][href]');
    stylesheets.forEach(s => {
      if (!s.hasAttribute('integrity')) {
        advanced.stylesheetsWithoutSRI++;
      }
    });

    // DOM XSS Sink Analysis
    const dangerousPatterns = [
      { selector: '[onclick]', type: 'onclick handler' },
      { selector: '[onerror]', type: 'onerror handler' },
      { selector: '[onload]', type: 'onload handler' },
      { selector: '[onmouseover]', type: 'onmouseover handler' },
      { selector: 'script[innerHTML]', type: 'innerHTML usage' }
    ];

    // Check for eval() and document.write in scripts
    document.querySelectorAll('script').forEach(s => {
      const content = s.textContent || '';
      if (content.includes('eval(') && !s.hasAttribute('src')) {
        advanced.dangerousSinks.push({ type: 'eval()', location: 'inline script' });
      }
      if (content.includes('document.write')) {
        advanced.dangerousSinks.push({ type: 'document.write', location: 'inline script' });
      }
    });

    // Check for innerHTML assignments
    const elementsWithHandlers = document.querySelectorAll('[onclick], [onerror], [onload], [onmouseover], [onsubmit]');
    advanced.inlineEventHandlers = elementsWithHandlers.length;
    elementsWithHandlers.forEach(el => {
      const handlers = [];
      if (el.hasAttribute('onclick')) handlers.push('onclick');
      if (el.hasAttribute('onerror')) handlers.push('onerror');
      if (el.hasAttribute('onload')) handlers.push('onload');
      handlers.forEach(h => {
        advanced.dangerousSinks.push({ type: h, location: 'element attribute' });
      });
    });

    // Referrer Policy
    const referrerMeta = document.querySelector('meta[name="referrer"]');
    if (referrerMeta) {
      advanced.hasReferrerPolicy = true;
      advanced.referrerPolicy = referrerMeta.getAttribute('content') || '';
    }

    // X-Frame-Options
    const xFrameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    advanced.hasXFrameOptions = !!xFrameMeta;

    // X-Content-Type-Options
    const xContentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    advanced.hasXContentTypeOptions = !!xContentTypeMeta;

    // Permissions Policy
    const permissionsMeta = document.querySelector('meta[name="permissions-policy"]');
    advanced.hasPermissionsPolicy = !!permissionsMeta;

    // Script loading attributes
    document.querySelectorAll('script[src]').forEach(s => {
      if (s.hasAttribute('defer')) advanced.scriptsWithDefer++;
      if (s.hasAttribute('async')) advanced.scriptsWithAsync++;
    });

    // Form analysis
    document.querySelectorAll('form').forEach(f => {
      if (f.action) advanced.formsWithAction++;
      if (f.method && f.method.toLowerCase() === 'post') advanced.formsWithPOST++;
      if (f.action && f.action.startsWith('http://')) advanced.formsWithActionHTTP++;
    });

    return advanced;
  }

  // ==================== DEVELOPER METRICS ====================
  function getDeveloperMetrics() {
    const dev = {
      totalResources: 0,
      externalResources: 0,
      estimatedTotalSize: 0,
      imagesCount: 0,
      cssCount: 0,
      jsCount: 0,
      fontsCount: 0,
      videosCount: 0,
      audioCount: 0,
      iframesCount: 0,
      customElements: 0,
      webComponents: 0,
      ariaLabels: 0,
      accessibilityIssues: [],
      consoleErrors: 0,
      consoleWarnings: 0,
      // Performance hints
      renderBlockingCSS: 0,
      renderBlockingJS: 0,
      lazyImages: 0,
      responsiveImages: 0
    };

    // Count resources
    dev.imagesCount = document.querySelectorAll('img').length;
    dev.cssCount = document.querySelectorAll('link[rel="stylesheet"]').length;
    dev.jsCount = document.querySelectorAll('script[src]').length;
    dev.fontsCount = document.querySelectorAll('link[rel*="font"]').length;
    dev.videosCount = document.querySelectorAll('video').length;
    dev.audioCount = document.querySelectorAll('audio').length;
    dev.iframesCount = document.querySelectorAll('iframe').length;
    dev.externalResources = dev.imagesCount + dev.cssCount + dev.jsCount + dev.fontsCount;
    dev.totalResources = dev.externalResources + document.querySelectorAll('link:not([rel="stylesheet"])').length;

    // Lazy loading
    dev.lazyImages = document.querySelectorAll('img[loading="lazy"]').length;
    dev.responsiveImages = document.querySelectorAll('img[srcset]').length;

    // Custom elements
    dev.customElements = document.querySelectorAll('*[is]').length;
    const shadowRoots = document.querySelectorAll('*');
    let shadowCount = 0;
    shadowRoots.forEach(el => {
      if (el.shadowRoot) shadowCount++;
    });
    dev.webComponents = shadowCount;

    // Accessibility
    dev.ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]').length;
    
    // Accessibility issues
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      dev.accessibilityIssues.push({ type: 'img-missing-alt', count: imagesWithoutAlt.length });
    }
    
    const inputsWithoutLabel = document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])');
    let labelCount = 0;
    inputsWithoutLabel.forEach(input => {
      const parentLabel = input.closest('label');
      const id = input.getAttribute('id');
      const labeledBy = document.querySelector(`label[for="${id}"]`);
      if (!parentLabel && !labeledBy) labelCount++;
    });
    if (labelCount > 0) {
      dev.accessibilityIssues.push({ type: 'input-missing-label', count: labelCount });
    }
    
    const lowContrast = document.querySelectorAll('*:not(body):not(html)');
    // Note: True contrast checking requires computed styles and is complex
    // This is a simplified check
    
    // ARIA roles
    const missingRoles = document.querySelectorAll('nav:not([role]), main:not([role]), aside:not([role]), header:not([role]), footer:not([role]), section:not([role])');
    if (missingRoles.length > 0) {
      dev.accessibilityIssues.push({ type: 'semantic-missing-role', count: missingRoles.length });
    }

    // Render blocking resources
    const blockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"]):not([media="screen"])');
    dev.renderBlockingCSS = blockingCSS.length;
    
    // Head scripts block rendering (scripts in head without defer/async)
    const headScripts = document.querySelectorAll('head script:not([async]):not([defer])');
    dev.renderBlockingJS = headScripts.length;

    return dev;
  }

  // ==================== SCORING SYSTEM ====================
  function calculateScores() {
    const structure = getStructureAnalysis();
    const security = getSecurityAnalysis();
    const advanced = getAdvancedSecurityAnalysis();
    const developer = getDeveloperMetrics();

    // Structure Score
    let structureScore = 100;
    if (structure.imagesWithoutAlt > 0) structureScore -= Math.min(structure.imagesWithoutAlt * 2, 20);
    if (!structure.hasMetaDescription) structureScore -= 10;
    if (!structure.hasViewport) structureScore -= 10;
    if (structure.inlineScripts > 5) structureScore -= Math.min((structure.inlineScripts - 5) * 2, 15);
    if (structure.deprecatedTags.length > 0) structureScore -= structure.deprecatedTags.length * 3;
    structureScore = Math.max(0, Math.min(100, structureScore));

    // Security Score (Enhanced)
    let securityScore = 100;
    if (!security.isHttps) securityScore -= 25;
    if (security.mixedContent) securityScore -= 20;
    if (security.formsWithoutCSRF > 0) securityScore -= 15;
    if (security.thirdPartyDomains.length > 10) securityScore -= 10;
    if (security.iframeCount > 3) securityScore -= 10;
    
    // Advanced security deductions
    if (!advanced.hasCSP) securityScore -= 15;
    if (advanced.cspWeak) securityScore -= 10;
    if (advanced.scriptsWithoutSRI > 0) securityScore -= Math.min(advanced.scriptsWithoutSRI * 2, 15);
    if (advanced.dangerousSinks.length > 0) securityScore -= Math.min(advanced.dangerousSinks.length * 3, 20);
    if (!advanced.hasReferrerPolicy) securityScore -= 5;
    if (!advanced.hasXFrameOptions) securityScore -= 5;
    if (!advanced.hasXContentTypeOptions) securityScore -= 5;
    if (advanced.inlineEventHandlers > 0) securityScore -= Math.min(advanced.inlineEventHandlers * 2, 15);
    if (advanced.formsWithActionHTTP > 0) securityScore -= 10;
    
    // Cookie security
    if (security.unsafeCookies > 0) securityScore -= Math.min(security.unsafeCookies * 3, 15);
    
    securityScore = Math.max(0, Math.min(100, securityScore));

    // Developer Score (NEW)
    let developerScore = 100;
    // Accessibility
    if (developer.accessibilityIssues.length > 0) {
      developer.accessibilityIssues.forEach(issue => {
        developerScore -= Math.min(issue.count * 2, 10);
      });
    }
    // Performance
    if (developer.renderBlockingCSS > 3) developerScore -= 5;
    if (developer.renderBlockingJS > 3) developerScore -= 5;
    if (developer.lazyImages === 0 && developer.imagesCount > 5) developerScore -= 5;
    developerScore = Math.max(0, Math.min(100, developerScore));

    // Overall
    const overallScore = Math.round((structureScore + securityScore + developerScore) / 3);

    let category;
    if (overallScore >= 80) category = 'safe';
    else if (overallScore >= 60) category = 'moderate';
    else category = 'high';

    return {
      structure: structureScore,
      security: securityScore,
      developer: developerScore,
      overall: overallScore,
      category: category
    };
  }
})();

