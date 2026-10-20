// WebAudit - Side Panel (VSCode Theme)

const STORAGE_KEY = 'webaudit_history';
const CIRCUMFERENCE = 2 * Math.PI * 30; // r=30

document.addEventListener('DOMContentLoaded', function() {
  init();
});

async function init() {
  try {
    const data = await getAnalysisData();
    if (data) {
      const history = getHistory();
      const previous = history[data.url] || null;
      displayResults(data, previous);
      saveToHistory(data);
    } else {
      showError('Unable to analyze. Refresh page and try again.');
    }
  } catch (e) {
    console.error(e);
    showError('Error loading analysis');
  }
  
  document.getElementById('exportBtn').addEventListener('click', exportJSON);
  document.getElementById('refreshBtn').addEventListener('click', refreshAnalysis);
}

async function getAnalysisData() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getCachedData" }, (resp) => {
          if (chrome.runtime.lastError || !resp) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "analyze" }, (resp2) => {
              resolve(resp2 || null);
            });
          } else {
            resolve(resp);
          }
        });
      } else {
        resolve(null);
      }
    });
  });
}

function displayResults(data, previous) {
  // URL
  const urlEl = document.getElementById('urlDisplay');
  const protocolEl = document.getElementById('protocolDisplay');
  
  try {
    const url = new URL(data.url);
    urlEl.textContent = url.hostname + (url.pathname.length > 1 ? url.pathname.substring(0, 20) : '');
  } catch {
    urlEl.textContent = data.url.substring(0, 35);
  }
  
  protocolEl.textContent = data.isHttps ? 'https://' : 'http://';
  protocolEl.className = data.isHttps ? 'protocol' : 'protocol insecure';
  
  // Scores
  const scores = data.scores;
  
  // Ring progress
  const offset = CIRCUMFERENCE - (scores.overall / 100) * CIRCUMFERENCE;
  const progressEl = document.getElementById('scoreProgress');
  progressEl.style.strokeDashoffset = offset;
  
  const ringEl = document.getElementById('scoreRing');
  ringEl.className = '';
  if (scores.overall < 60) ringEl.classList.add('low');
  else if (scores.overall < 80) ringEl.classList.add('mid');
  
  document.getElementById('overallScore').textContent = scores.overall;
  
  const catEl = document.getElementById('scoreCategory');
  catEl.className = 'score-category';
  if (scores.overall >= 80) {
    catEl.textContent = 'Secure';
    catEl.classList.add('high');
  } else if (scores.overall >= 60) {
    catEl.textContent = 'Needs Attention';
    catEl.classList.add('mid');
  } else {
    catEl.textContent = 'At Risk';
    catEl.classList.add('low');
  }
  
  // Score bars
  updateBar('security', scores.security);
  updateBar('structure', scores.structure);
  updateBar('developer', scores.developer);
  
  // Issues
  displayIssues(data);
  
  // Resources
  document.getElementById('imageCount').textContent = data.structure?.images || 0;
  document.getElementById('scriptCount').textContent = data.structure?.scripts || 0;
  document.getElementById('cssCount').textContent = data.structure?.externalCSS || 0;
  document.getElementById('thirdPartyCount').textContent = data.security?.thirdPartyDomains?.length || 0;
  
  // Security checks
  displayChecks(data.advanced, data.security);
  
  // Time
  document.getElementById('scanTime').textContent = new Date().toLocaleTimeString();
}

function updateBar(type, score) {
  const bar = document.getElementById(type + 'Bar');
  const num = document.getElementById(type + 'Num');
  
  bar.style.width = score + '%';
  bar.className = 'score-bar-fill';
  if (score >= 80) bar.classList.add('high');
  else if (score >= 60) bar.classList.add('mid');
  else bar.classList.add('low');
  
  num.textContent = score;
}

function displayIssues(data) {
  const issues = generateIssues(data);
  document.getElementById('issueCount').textContent = issues.length;
  
  const container = document.getElementById('issuesList');
  
  if (issues.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">✓</div>
        <div>No issues found</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = issues.map(issue => `
    <div class="issue ${issue.severity}">
      <div class="issue-top">
        <span class="issue-icon">${issue.icon}</span>
        <span class="issue-title">${issue.title}</span>
        <span class="issue-severity ${issue.severity}">${issue.severity}</span>
      </div>
      <div class="issue-desc">${issue.desc}</div>
      <div class="issue-fix">Fix: ${issue.fix}</div>
    </div>
  `).join('');
}

function generateIssues(data) {
  const issues = [];
  const s = data.structure || {};
  const sec = data.security || {};
  const adv = data.advanced || {};
  
  // High
  if (!data.isHttps) {
    issues.push({ severity: 'high', icon: '🔓', title: 'No HTTPS', desc: 'Page uses unencrypted HTTP', fix: 'Install SSL certificate' });
  }
  if (sec.mixedContent) {
    issues.push({ severity: 'high', icon: '⚠️', title: 'Mixed Content', desc: 'HTTP resources on HTTPS page', fix: 'Use HTTPS for all resources' });
  }
  if (!adv.hasCSP) {
    issues.push({ severity: 'high', icon: '🛡️', title: 'No CSP', desc: 'Missing Content Security Policy', fix: 'Add CSP meta tag' });
  }
  if (adv.dangerousSinks?.length) {
    issues.push({ severity: 'high', icon: '💀', title: 'XSS Risks', desc: `Found ${adv.dangerousSinks.length} dangerous DOM sinks`, fix: 'Remove eval(), document.write()' });
  }
  if (sec.formsWithoutCSRF > 0) {
    issues.push({ severity: 'high', icon: '🔐', title: 'No CSRF', desc: `${sec.formsWithoutCSRF} forms lack CSRF tokens`, fix: 'Add CSRF tokens to forms' });
  }
  
  // Medium
  if (adv.cspWeak) {
    issues.push({ severity: 'medium', icon: '⚠️', title: 'Weak CSP', desc: 'CSP allows unsafe-inline/eval', fix: 'Remove unsafe directives' });
  }
  if (adv.scriptsWithoutSRI > 0) {
    issues.push({ severity: 'medium', icon: '🔗', title: 'No SRI', desc: `${adv.scriptsWithoutSRI} scripts lack integrity`, fix: 'Add integrity="sha384-..."' });
  }
  if (!adv.hasXFrameOptions) {
    issues.push({ severity: 'medium', icon: '🖼️', title: 'No X-Frame', desc: 'Clickjacking protection missing', fix: 'Add X-Frame-Options header' });
  }
  if (!adv.hasXContentTypeOptions) {
    issues.push({ severity: 'medium', icon: '📋', title: 'No X-Content-Type', desc: 'MIME sniffing not prevented', fix: 'Add X-Content-Type-Options: nosniff' });
  }
  if (adv.inlineEventHandlers > 0) {
    issues.push({ severity: 'medium', icon: '⚡', title: 'Inline Handlers', desc: `${adv.inlineEventHandlers} inline event handlers`, fix: 'Use addEventListener()' });
  }
  if (sec.unsafeCookies > 0) {
    issues.push({ severity: 'medium', icon: '🍪', title: 'Unsafe Cookies', desc: `${sec.unsafeCookies} cookies missing flags`, fix: 'Add Secure, HttpOnly, SameSite' });
  }
  if (s.imagesWithoutAlt > 3) {
    issues.push({ severity: 'medium', icon: '🖼️', title: 'Missing Alt', desc: `${s.imagesWithoutAlt} images without alt`, fix: 'Add alt="..." to images' });
  }
  
  // Low
  if (!s.hasMetaDescription) {
    issues.push({ severity: 'low', icon: '📝', title: 'No Meta Desc', desc: 'Missing meta description', fix: 'Add meta description tag' });
  }
  if (!s.hasViewport) {
    issues.push({ severity: 'low', icon: '📱', title: 'No Viewport', desc: 'Missing viewport meta tag', fix: 'Add viewport meta tag' });
  }
  if (!adv.hasReferrerPolicy) {
    issues.push({ severity: 'low', icon: '🔍', title: 'No Referrer', desc: 'Referrer policy not set', fix: 'Add referrer policy meta' });
  }
  
  // Sort and limit
  const order = { high: 0, medium: 1, low: 2 };
  return issues.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 8);
}

function displayChecks(advanced, security) {
  const setCheck = (id, pass, warn = false) => {
    const el = document.getElementById(id);
    if (pass) {
      el.textContent = '✓';
      el.className = 'check-status pass';
    } else if (warn) {
      el.textContent = '!';
      el.className = 'check-status warn';
    } else {
      el.textContent = '✗';
      el.className = 'check-status fail';
    }
  };
  
  setCheck('checkHttps', security.isHttps);
  setCheck('checkCSP', advanced.hasCSP, advanced.cspWeak);
  setCheck('checkSRI', advanced.scriptsWithoutSRI === 0, advanced.scriptsWithoutSRI > 0);
  setCheck('checkXFrame', advanced.hasXFrameOptions);
  setCheck('checkXContent', advanced.hasXContentTypeOptions);
  setCheck('checkReferrer', advanced.hasReferrerPolicy);
}

function showError(msg) {
  document.getElementById('urlDisplay').textContent = 'Error';
  document.getElementById('issuesList').innerHTML = `<div class="empty"><div class="empty-icon">⚠</div><div>${msg}</div></div>`;
}

// History
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveToHistory(data) {
  try {
    const h = getHistory();
    h[data.url] = { timestamp: Date.now(), scores: data.scores };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
  } catch {}
}

// Export
function exportJSON() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getCachedData" }, (data) => {
        if (data) {
          const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'webaudit-' + Date.now() + '.json';
          a.click();
        }
      });
    }
  });
}

// Refresh
function refreshAnalysis() {
  document.getElementById('issuesList').innerHTML = '<div class="empty"><div class="empty-icon">⟳</div><div>Scanning...</div></div>';
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "analyze" }, (data) => {
        if (data) {
          displayResults(data, getHistory()[data.url] || null);
          saveToHistory(data);
        }
      });
    }
  });
}

