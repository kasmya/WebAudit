// WebAudit - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners with error handling
  try {
    var analyzeBtn = document.getElementById('analyzeBtn');
    var exportBtn = document.getElementById('exportBtn');
    var closeBtn = document.getElementById('closeBtn');
    var closeInfo = document.getElementById('closeInfo');
    var activityAudit = document.getElementById('activityAudit');
    var activityInfo = document.getElementById('activityInfo');
    var activityTheme = document.getElementById('activityTheme');
    var overallScore = document.getElementById('overallScore');
    
    // Score row elements
    var scoreRows = document.querySelectorAll('.score-row');
    
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzePage);
    if (exportBtn) exportBtn.addEventListener('click', exportReport);
    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    
    // Sort functionality
    var sortSelect = document.getElementById('sortSelect');
    var filterSelect = document.getElementById('filterSelect');
    if (sortSelect) sortSelect.addEventListener('change', sortIssues);
    if (filterSelect) filterSelect.addEventListener('change', sortIssues);


    if (closeInfo) closeInfo.addEventListener('click', hideInfo);
    if (overallScore) overallScore.addEventListener('click', function() { showScoreExplanation('overall'); });
    
    // Score row click handlers
    scoreRows.forEach(function(row) {
      row.addEventListener('click', function() {
        var scoreType = this.getAttribute('data-score');
        showScoreExplanation(scoreType);
      });
    });
    
    // Activity bar handlers
    if (activityInfo) activityInfo.addEventListener('click', showInfo);
    if (activityTheme) activityTheme.addEventListener('click', toggleTheme);
    
    initTheme();
    setTimeout(analyzePage, 800);
  } catch (e) {
    console.error('WebAudit initialization error:', e);
  }
});

function initTheme() {
  var savedTheme = localStorage.getItem('webaudit-theme');
  var theme = savedTheme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('webaudit-theme', newTheme);
}

function showInfo() {
  document.getElementById('infoPanel').classList.add('visible');
}

function hideInfo() {
  document.getElementById('infoPanel').classList.remove('visible');
}

const scoreExplanations = {
  overall: { 
    title: 'Overall Security Score', 
    severity: 'score',
    desc: 'The overall score is a weighted average of Security (50%), Structure (25%), and Code Quality (25%). Scores above 80 are good, 60-79 need attention, and below 60 are high risk. Click on individual categories for more details.'
  },
  security: { 
    title: 'Security Score', 
    severity: 'score',
    desc: 'Based on: HTTPS encryption, Content Security Policy (CSP), Subresource Integrity (SRI), X-Frame-Options, X-Content-Type-Options, Referrer Policy, cookie security, and detection of dangerous DOM sinks like eval() and innerHTML.'
  },
  structure: { 
    title: 'Structure Score', 
    severity: 'score',
    desc: 'Based on: Image alt text accessibility, meta description presence, viewport meta tag, number of inline scripts, and detection of deprecated HTML tags like <center> and <font>.'
  },
  developer: { 
    title: 'Code Quality Score', 
    severity: 'score',
    desc: 'Based on: Accessibility (ARIA labels), performance (render blocking resources), lazy loading images, and overall code best practices. Higher scores indicate better optimized and more accessible code.'
  }
};

const issueExplanations = {
  // Structure issues
  imagesWithoutAlt: { title: 'Missing Alt Text', desc: 'Images without alt attributes are inaccessible to screen readers and fail WCAG guidelines. Add descriptive alt="text" to all images for accessibility and SEO benefits.', severity: 'medium' },
  metaDescription: { title: 'Missing Meta Description', desc: 'Meta descriptions help search engines understand page content and improve click-through rates in search results. Add a <meta name="description"> tag.', severity: 'low' },
  viewport: { title: 'Missing Viewport', desc: 'The viewport meta tag is essential for responsive design on mobile devices. Add <meta name="viewport" content="width=device-width, initial-scale=1">.', severity: 'medium' },
  inlineScripts: { title: 'Many Inline Scripts', desc: 'Inline scripts increase page size and reduce caching benefits. External scripts are better for performance and security. Consider moving inline JavaScript to external files.', severity: 'low' },
  deprecatedTags: { title: 'Deprecated HTML Tags', desc: 'HTML tags like <center>, <font>, <u> are obsolete. Use CSS instead for styling. Modern browsers may still render them but they are not recommended.', severity: 'medium' },
  
  // Security issues
  notHttps: { title: 'Not Using HTTPS', desc: 'HTTPS encrypts all data between the server and browser, protecting sensitive information from interception. Get a free certificate from Let\'s Encrypt or your hosting provider.', severity: 'high' },
  mixedContent: { title: 'Mixed Content Detected', desc: 'Your page loads some resources (images, scripts, stylesheets) over HTTP while the page is HTTPS. This creates security vulnerabilities. All resources must be loaded via HTTPS.', severity: 'high' },
  noCSRF: { title: 'Forms Without CSRF Protection', desc: 'Cross-Site Request Forgery (CSRF) attacks can trick users into performing unwanted actions. Add CSRF tokens to all forms that perform sensitive operations.', severity: 'high' },
  manyThirdParty: { title: 'Many Third-Party Scripts', desc: 'Each third-party script is a potential security risk and affects page load performance. Audit your third-party scripts and remove unnecessary ones.', severity: 'medium' },
  manyIframes: { title: 'Many Iframes Found', desc: 'Iframes can be used for clickjacking attacks and reduce page performance. Use iframes sparingly and ensure they have proper security headers.', severity: 'medium' },
  
  // Advanced security issues
  noCSP: { title: 'No Content Security Policy', desc: 'CSP is your primary defense against XSS attacks. It controls which resources can be loaded. Add a Content-Security-Policy meta tag to your HTML head.', severity: 'high' },
  weakCSP: { title: 'Weak CSP Policy', desc: 'Your CSP allows unsafe-inline or unsafe-eval which defeats the purpose of CSP. Remove these directives and use external scripts and event handlers instead.', severity: 'high' },
  noSRI: { title: 'Scripts Without SRI', desc: 'Subresource Integrity (SRI) verifies that third-party scripts haven\'t been tampered with. Add integrity="sha384-..." attributes to script tags loading from CDNs.', severity: 'medium' },
  noXFrame: { title: 'No X-Frame-Options', desc: 'X-Frame-Options prevents your page from being embedded in iframes, protecting against clickjacking. Add header: X-Frame-Options: DENY or SAMEORIGIN.', severity: 'medium' },
  noXContent: { title: 'No X-Content-Type-Options', desc: 'This header prevents browsers from MIME-sniffing a response away from the declared content-type. Add header: X-Content-Type-Options: nosniff.', severity: 'medium' },
  noReferrer: { title: 'No Referrer Policy', desc: 'Referrer Policy controls how much referrer information is sent with requests. Add <meta name="referrer" content="strict-origin-when-cross-origin">.', severity: 'low' },
  dangerousSinks: { title: 'Dangerous DOM Sinks', desc: 'Functions like eval(), innerHTML, document.write() can execute attacker-controlled code (XSS). Use textContent instead of innerHTML, avoid eval().', severity: 'high' },
  inlineHandlers: { title: 'Inline Event Handlers', desc: 'Inline event handlers like onclick="..." are harder to secure and maintain. Use addEventListener() in external JavaScript files instead.', severity: 'medium' },
  unsafeCookies: { title: 'Unsafe Cookies', desc: 'Cookies missing Secure flag can be stolen over HTTP. HttpOnly flag prevents JavaScript access. Add both flags: Secure; HttpOnly; SameSite=Strict.', severity: 'medium' },
  httpFormAction: { title: 'HTTP Form Action', desc: 'Forms submitting to HTTP endpoints expose data in plain text. Always use HTTPS for form action URLs.', severity: 'high' },
  
  // Developer issues
  noLazyLoad: { title: 'No Lazy Loading', desc: 'Images without lazy loading load immediately, slowing page render. Add loading="lazy" to images below the fold for better performance.', severity: 'low' },
  renderBlock: { title: 'Render Blocking Resources', desc: 'CSS and JavaScript in the head block page rendering. Move scripts to the end or use defer/async attributes. Move blocking CSS to external files.', severity: 'medium' },
  missingAria: { title: 'Accessibility Issues', desc: 'ARIA labels and roles help screen readers understand dynamic content. Add appropriate ARIA attributes to interactive elements.', severity: 'medium' },
  missingLabels: { title: 'Inputs Without Labels', desc: 'Form inputs need associated labels for accessibility. Use <label for="id"> or wrap inputs in labels. Screen readers require this for form navigation.', severity: 'medium' }
};

let currentData = null;

async function analyzePage() {
  var btn = document.getElementById('analyzeBtn');
  var statusDot = document.getElementById('statusDot');
  
  btn.disabled = true;
  btn.innerHTML = 'Scanning...';
  document.getElementById('statusText').textContent = 'Analyzing...';
  statusDot.classList.add('analyzing');
  document.getElementById('explanationPanel').classList.remove('visible');
  
  try {
    var response = await getCachedData();
    
    if (!response) {
      response = await chrome.runtime.sendMessage({ action: "analyze" });
    }
    
    if (response && response.error) {
      showError(response.error);
      return;
    }
    
    if (response) {
      currentData = response;
      displayResults(response);
      document.getElementById('statusText').textContent = 'Complete';
      statusDot.classList.remove('analyzing');
    } else {
      showError('No response');
    }
  } catch (error) {
    showError('Error: ' + error.message);
    statusDot.classList.remove('analyzing');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Re-scan';
  }
}

function getCachedData() {
  return new Promise(function(resolve) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, { action: "getCachedData" }, function(response) {
            if (chrome.runtime.lastError || !response) {
              resolve(null);
            } else {
              resolve(response);
            }
          });
        } catch (e) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

function displayResults(data) {
  document.getElementById('urlDisplay').textContent = truncateUrl(data.url);
  
  // HTTPS Badge
  var httpsBadge = document.getElementById('httpsBadge');
  if (data.isHttps) {
    httpsBadge.innerHTML = '<span style="color: var(--accent-green);">[S]</span> HTTPS';
  } else {
    httpsBadge.innerHTML = '<span style="color: var(--accent-red);">[U]</span> HTTP';
  }
  
  var scores = data.scores;
  
  // Overall Score
  var overallScore = document.getElementById('overallScore');
  var scoreNumber = document.getElementById('scoreNumber');
  var riskLabel = document.getElementById('riskLabel');
  
  scoreNumber.textContent = scores.overall;
  overallScore.className = 'score-circle-large ' + scores.category;
  scoreNumber.className = 'score-number ' + scores.category;
  
  if (scores.category === 'safe') {
    riskLabel.textContent = 'SAFE';
    riskLabel.style.background = 'rgba(78, 201, 176, 0.2)';
    riskLabel.style.color = 'var(--accent-green)';
  } else if (scores.category === 'moderate') {
    riskLabel.textContent = 'WARNING';
    riskLabel.style.background = 'rgba(220, 220, 170, 0.2)';
    riskLabel.style.color = 'var(--accent-yellow)';
  } else {
    riskLabel.textContent = 'HIGH RISK';
    riskLabel.style.background = 'rgba(241, 76, 76, 0.2)';
    riskLabel.style.color = 'var(--accent-red)';
  }
  
  // Score Details - Numbers instead of graphs
  var securityScore = document.getElementById('securityScore');
  var structureScore = document.getElementById('structureScore');
  var developerScore = document.getElementById('developerScore');
  
  securityScore.textContent = scores.security;
  securityScore.className = 'score-row-value ' + getScoreClass(scores.security);
  
  structureScore.textContent = scores.structure;
  structureScore.className = 'score-row-value ' + getScoreClass(scores.structure);
  
  developerScore.textContent = scores.developer;
  developerScore.className = 'score-row-value ' + getScoreClass(scores.developer);
  

  // Page Info - Numbers
  document.getElementById('pageTitle').textContent = (data.pageInfo?.title || 'Unknown').substring(0, 15);
  document.getElementById('imageCount').textContent = data.structure?.images || 0;
  document.getElementById('scriptCount').textContent = (data.structure?.scripts || 0) + '';
  document.getElementById('thirdParty').textContent = (data.security?.thirdPartyDomains?.length || 0) + '';
  
  // Issues
  var issues = generateIssuesList(data);
  document.getElementById('issueCount').textContent = issues.length;
  
  var list = document.getElementById('issuesList');
  if (issues.length > 0) {
    list.innerHTML = issues.map(function(i) {
      return '<div class="issue-item ' + i.type + '" data-issue="' + i.key + '">' +
        '<span class="issue-icon ' + i.type + '-dot"></span>' +
        '<div class="issue-content">' +
          '<div class="issue-top-row">' +
            '<span class="issue-title">' + i.title + '</span>' +
            '<span class="issue-severity-tag ' + i.severity + '">' + i.severity + '</span>' +
          '</div>' +
          '<div class="issue-description">' + i.desc + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    
    list.querySelectorAll('.issue-item').forEach(function(item) {
      item.addEventListener('click', function() {
        list.querySelectorAll('.issue-item').forEach(function(i) { i.classList.remove('active'); });
        this.classList.add('active');
        showIssueExplanation(this.getAttribute('data-issue'));
      });
    });
  } else {
    list.innerHTML = '<div class="empty-state success"><span class="icon">OK</span><p>No issues found! Page looks good.</p></div>';
  }
}

function showScoreExplanation(type) {
  var panel = document.getElementById('explanationPanel');
  var exp = scoreExplanations[type];
  var score = currentData ? currentData.scores[type] : 0;
  
  document.getElementById('explanationIcon').textContent = '[S]';
  document.getElementById('explanationTitle').textContent = exp.title;
  document.getElementById('explanationSeverity').textContent = (currentData ? currentData.scores[type] : '--') + '/100';
  document.getElementById('explanationSeverity').className = 'explanation-severity ' + (currentData ? getScoreClass(currentData.scores[type]) : '');
  document.getElementById('explanationText').textContent = exp.desc;
  
  panel.classList.add('visible');
}

function showIssueExplanation(key) {
  var panel = document.getElementById('explanationPanel');
  var exp = issueExplanations[key];

  if (exp) {
    document.getElementById('explanationIcon').textContent = '⚠';
    document.getElementById('explanationTitle').textContent = exp.title;
    document.getElementById('explanationSeverity').textContent = exp.severity.toUpperCase();
    document.getElementById('explanationSeverity').className = 'explanation-severity ' + exp.severity;
    document.getElementById('explanationText').textContent = exp.desc;
  }

  panel.classList.add('visible');
}

function generateIssuesList(data) {
  var issues = [];
  var s = data.structure;
  var sec = data.security;
  var adv = data.advanced || {};
  var dev = data.developer || {};
  
  // Structure issues with detailed descriptions
  if (s.imagesWithoutAlt > 3) issues.push({ key: 'imagesWithoutAlt', type: 'structure', title: s.imagesWithoutAlt + ' Images Missing Alt Text', desc: s.imagesWithoutAlt + ' images on this page are missing alt attributes, making them inaccessible to screen readers and hurting SEO.', severity: 'medium' });
  if (!s.hasMetaDescription) issues.push({ key: 'metaDescription', type: 'structure', title: 'Missing Meta Description', desc: 'No meta description found. Add a descriptive <meta name="description"> tag to improve search engine visibility.', severity: 'low' });
  if (!s.hasViewport) issues.push({ key: 'viewport', type: 'structure', title: 'Missing Viewport Tag', desc: 'No viewport meta tag found. Add <meta name="viewport" content="width=device-width, initial-scale=1"> for proper mobile display.', severity: 'medium' });
  if (s.inlineScripts > 8) issues.push({ key: 'inlineScripts', type: 'structure', title: s.inlineScripts + ' Inline Scripts', desc: 'Too many inline scripts detected. External scripts improve caching and security. Consider moving JavaScript to separate files.', severity: 'low' });
  if (s.deprecatedTags && s.deprecatedTags.length > 0) issues.push({ key: 'deprecatedTags', type: 'structure', title: 'Deprecated HTML Tags', desc: 'Found deprecated tags: ' + s.deprecatedTags.join(', ') + '. These should be replaced with modern CSS alternatives.', severity: 'medium' });
  
  // Security issues
  if (!data.isHttps) issues.push({ key: 'notHttps', type: 'security', title: 'Not Using HTTPS', desc: 'This page is not using HTTPS. All websites should use HTTPS to encrypt data and protect user privacy.', severity: 'high' });
  if (sec.mixedContent) issues.push({ key: 'mixedContent', type: 'security', title: 'Mixed Content Detected', desc: 'HTTP resources are being loaded on this HTTPS page. All resources must use HTTPS to maintain security.', severity: 'high' });
  if (sec.formsWithoutCSRF > 0) issues.push({ key: 'noCSRF', type: 'security', title: sec.formsWithoutCSRF + ' Forms Without CSRF', desc: 'Forms without CSRF tokens are vulnerable to cross-site request forgery attacks. Add anti-CSRF tokens to all forms.', severity: 'high' });
  if (sec.thirdPartyDomains && sec.thirdPartyDomains.length > 10) issues.push({ key: 'manyThirdParty', type: 'security', title: sec.thirdPartyDomains.length + ' Third-Party Domains', desc: 'Many third-party scripts detected. Each is a potential security risk and slows down page loading.', severity: 'medium' });
  if (sec.iframeCount > 3) issues.push({ key: 'manyIframes', type: 'security', title: sec.iframeCount + ' Iframes Found', desc: 'Many iframes can be security risks (clickjacking) and hurt performance. Use sparingly with proper headers.', severity: 'medium' });
  
  // Advanced security
  if (!adv.hasCSP) issues.push({ key: 'noCSP', type: 'security', title: 'No Content Security Policy', desc: 'No CSP header found. CSP is the best defense against XSS attacks. Add Content-Security-Policy meta tag.', severity: 'high' });
  if (adv.cspWeak) issues.push({ key: 'weakCSP', type: 'security', title: 'Weak CSP Policy', desc: 'CSP allows unsafe-inline or unsafe-eval. Remove these dangerous directives for proper XSS protection.', severity: 'high' });
  if (adv.scriptsWithoutSRI > 0) issues.push({ key: 'noSRI', type: 'security', title: adv.scriptsWithoutSRI + ' Scripts Without SRI', desc: 'External scripts without Subresource Integrity can be tampered with. Add integrity="sha384-..." attributes.', severity: 'medium' });
  if (!adv.hasXFrameOptions) issues.push({ key: 'noXFrame', type: 'security', title: 'No X-Frame-Options', desc: 'No X-Frame-Options header. Add "X-Frame-Options: DENY" to prevent your site from being embedded in iframes.', severity: 'medium' });
  if (!adv.hasXContentTypeOptions) issues.push({ key: 'noXContent', type: 'security', title: 'No X-Content-Type-Options', desc: 'No X-Content-Type-Options header. Add "X-Content-Type-Options: nosniff" to prevent MIME sniffing attacks.', severity: 'medium' });
  if (!adv.hasReferrerPolicy) issues.push({ key: 'noReferrer', type: 'security', title: 'No Referrer Policy', desc: 'No referrer policy found. Add <meta name="referrer" content="strict-origin-when-cross-origin">.', severity: 'low' });
  if (adv.dangerousSinks && adv.dangerousSinks.length > 0) issues.push({ key: 'dangerousSinks', type: 'security', title: adv.dangerousSinks.length + ' Dangerous DOM Sinks', desc: 'Dangerous functions like eval(), innerHTML, or document.write() found. These can cause XSS vulnerabilities.', severity: 'high' });
  if (adv.inlineEventHandlers > 0) issues.push({ key: 'inlineHandlers', type: 'security', title: adv.inlineEventHandlers + ' Inline Event Handlers', desc: 'Inline event handlers (onclick, onerror, etc.) are harder to secure. Use addEventListener() instead.', severity: 'medium' });
  if (sec.unsafeCookies > 0) issues.push({ key: 'unsafeCookies', type: 'security', title: sec.unsafeCookies + ' Unsafe Cookies', desc: 'Cookies missing Secure or HttpOnly flags. Add "; Secure; HttpOnly; SameSite=Strict" to cookie headers.', severity: 'medium' });
  if (adv.formsWithActionHTTP > 0) issues.push({ key: 'httpFormAction', type: 'security', title: 'Forms Submitting to HTTP', desc: 'Forms with HTTP action URLs expose data in plain text. Always use HTTPS form action URLs.', severity: 'high' });
  
  // Developer issues
  if (dev.lazyImages === 0 && dev.imagesCount > 5) issues.push({ key: 'noLazyLoad', type: 'developer', title: 'No Lazy Loading on Images', desc: 'Images should use loading="lazy" attribute for better performance. Only load images when they enter the viewport.', severity: 'low' });
  if (dev.renderBlockingJS > 3 || dev.renderBlockingCSS > 3) issues.push({ key: 'renderBlock', type: 'developer', title: 'Render Blocking Resources', desc: 'CSS and JS in the head block rendering. Use defer/async for scripts and move non-critical CSS after content.', severity: 'medium' });
  if (dev.accessibilityIssues && dev.accessibilityIssues.length > 0) issues.push({ key: 'missingAria', type: 'developer', title: 'Accessibility Issues', desc: 'ARIA labels and roles missing. Add proper ARIA attributes for screen reader compatibility.', severity: 'medium' });
  
  return issues;
}

function getScoreClass(score) {
  if (score >= 80) return 'good';
  if (score >= 60) return 'warning';
  return 'danger';
}

function truncateUrl(url) {
  return url.length > 38 ? url.substring(0, 35) + '...' : url;
}

function showError(msg) {
  var statusDot = document.getElementById('statusDot');
  document.getElementById('statusText').textContent = 'Error';
  statusDot.classList.add('error');
  document.getElementById('issuesList').innerHTML = '<div class="empty-state"><span class="icon">[E]</span><p>' + msg + '</p></div>';

  document.getElementById('issueCount').textContent = '0';
}

function exportReport() {
  if (!currentData) {
    alert('No analysis data to export. Run analysis first.');
    return;
  }
  
  var report = {
    url: currentData.url,
    timestamp: new Date().toISOString(),
    scores: currentData.scores,
    issues: generateIssuesList(currentData),
    structure: currentData.structure,
    security: currentData.security,
    advanced: currentData.advanced,
    developer: currentData.developer
  };
  
  var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'webaudit-report-' + Date.now() + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function closePopup() {
  window.close();
}

function sortIssues() {
  var sortBy = document.getElementById('sortSelect').value;
  var filterBy = document.getElementById('filterSelect').value;
  if (!currentData) return;
  
  var issues = generateIssuesList(currentData);
  
  // Filter issues
  if (filterBy !== 'all') {
    issues = issues.filter(function(i) {
      return i.severity === filterBy;
    });
  }
  
  // Sort issues
  if (sortBy === 'severity') {
    var severityOrder = { high: 0, medium: 1, low: 2 };
    issues.sort(function(a, b) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  } else if (sortBy === 'type') {
    var typeOrder = { security: 0, structure: 1, developer: 2 };
    issues.sort(function(a, b) {
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }
  
  displaySortedIssues(issues);
}

function displaySortedIssues(issues) {
  var list = document.getElementById('issuesList');
  document.getElementById('issueCount').textContent = issues.length;
  
  if (issues.length > 0) {
    list.innerHTML = issues.map(function(i) {
      return '<div class="issue-item ' + i.type + '" data-issue="' + i.key + '">' +
        '<span class="issue-icon ' + i.type + '-dot"></span>' +
        '<div class="issue-content">' +
          '<div class="issue-top-row">' +
            '<span class="issue-title">' + i.title + '</span>' +
            '<span class="issue-severity-tag ' + i.severity + '">' + i.severity + '</span>' +
          '</div>' +
          '<div class="issue-description">' + i.desc + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    
    list.querySelectorAll('.issue-item').forEach(function(item) {
      item.addEventListener('click', function() {
        list.querySelectorAll('.issue-item').forEach(function(i) { i.classList.remove('active'); });
        this.classList.add('active');
        showIssueExplanation(this.getAttribute('data-issue'));
      });
    });
  } else {
    list.innerHTML = '<div class="empty-state success"><span class="icon">OK</span><p>No issues found! Page looks good.</p></div>';
  }
}

