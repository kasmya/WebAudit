# WebAudit - Advanced Web Security & Code Inspector

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-green?style=for-the-badge&logo=google-chrome" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge" alt="Manifest V3">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/OWASP-Inspired-orange?style=for-the-badge" alt="OWASP">
  <img src="https://img.shields.io/badge/Edge-Ready-purple?style=for-the-badge" alt="Edge">
</p>

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Technical Architecture](#technical-architecture)
6. [Scoring System](#scoring-system)
7. [Security Checks](#security-checks)
8. [UI/UX](#uiux)
9. [Testing](#testing)
10. [Project Structure](#project-structure)
11. [Permissions](#permissions)
12. [Future Enhancements](#future-enhancements)
13. [Contributing](#contributing)
14. [License](#license)

---

## 🛡️ Overview

WebAudit is a lightweight Chrome/Edge extension that performs real-time structural, security, and developer analysis of any webpage, presenting clear scores with actionable insights. It's designed to help:

- **Beginner web developers** learn best practices
- **Cybersecurity students** understand common vulnerabilities
- **Bug bounty hunters** quickly assess target pages
- **QA engineers** perform quick audits
- **Webmasters** check site health

### Why WebAudit?

In today's web development landscape, security, accessibility, and performance are often overlooked. WebAudit provides instant feedback on:
- HTML structure quality
- Security vulnerabilities (CSP, SRI, XSS, cookies)
- Accessibility best practices (ARIA, labels)
- Performance patterns (lazy loading, render blocking)

---

## ✨ Features

### 🔍 Structure Analysis (DOM Inspection)

| Feature | Description |
|---------|-------------|
| Form Counter | Counts all `<form>` elements on the page |
| Input Field Counter | Counts all `<input>` elements |
| Script Counter | Counts total script tags (inline + external) |
| External CSS Counter | Counts external stylesheet links |
| Image Alt Checker | Detects images missing `alt` attributes |
| Meta Description | Checks for presence of meta description |
| Viewport Tag | Checks for responsive design viewport tag |
| Deprecated Tags | Detects obsolete HTML tags (center, font, etc.) |

### 🔐 Security Checks (OWASP-Inspired)

| Check | Risk Level | Description |
|-------|------------|-------------|
| HTTPS Detection | 🔴 High | Verifies page uses secure protocol |
| CSP Detection | 🔴 High | Checks for Content-Security-Policy |
| SRI Check | 🟡 Medium | Verifies Subresource Integrity on scripts |
| DOM XSS Sinks | 🔴 High | Detects eval(), document.write, innerHTML |
| Cookie Security | 🟡 Medium | Checks for Secure, HttpOnly, SameSite |
| X-Frame-Options | 🟡 Medium | Clickjacking protection check |
| Referrer Policy | 🟢 Low | Controls information leakage |
| Inline Script Detection | 🟡 Medium | Finds inline `<script>` tags (XSS risk) |
| Form CSRF Protection | 🔴 High | Checks for CSRF tokens in forms |
| Mixed Content | 🔴 High | Detects HTTP resources on HTTPS pages |

### 👨‍💻 Developer Metrics

| Check | Description |
|-------|-------------|
| Resource Counting | Images, CSS, JS, fonts, video, audio |
| Render Blocking | Detects blocking CSS/JS in head |
| Lazy Loading | Checks for loading="lazy" on images |
| Accessibility | ARIA labels, input labels, semantic roles |
| Deprecated Tags | Detects obsolete HTML elements |

### 📊 Risk Scoring System

The extension calculates four scores:

1. **Structure Score (0-100)** - Based on HTML best practices
2. **Security Score (0-100)** - Based on security vulnerabilities
3. **Developer Score (0-100)** - Based on best practices
4. **Weighted Overall (0-100)** - Security-weighted average (50% security, 25% structure, 25% developer)

#### Risk Categories:

| Score Range | Category | Color | Action Required |
|-------------|----------|-------|-----------------|
| 80-100 | 🟢 Safe | Green | None |
| 50-79 | 🟡 Moderate | Yellow | Review issues |
| 0-49 | 🔴 High Risk | Red | Urgent attention |

### 🎨 UI Features

- **Dark Mode** (default) 🌙
- **Light Mode** ☀️
- **Theme Toggle** - Persists preference in localStorage
- **Circular Score Gauge** - Visual representation
- **Issue List** - Color-coded by severity
- **Minimalist Design** - GitHub-inspired color scheme

---

## 🚀 Installation

### Prerequisites

- Google Chrome browser (version 88 or higher)
- OR any Chromium-based browser (Edge, Brave, etc.)

### Manual Installation

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/webaudit.git
   cd webaudit
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions` in Chrome address bar
   - OR click Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner: **"Developer mode"**

4. **Load the Extension**
   - Click the **"Load unpacked"** button
   - Select the `WebAudit` folder from your files

5. **Pin to Browser**
   - Click the puzzle piece icon (🧩) in Chrome toolbar
   - Click the pin icon next to WebAudit

### Verify Installation

- The WebAudit icon 🔍 should appear in your toolbar
- Click it to see the popup interface

---

## 📖 Usage

### Basic Usage

1. Navigate to any webpage you want to analyze
2. Click the WebAudit extension icon in your browser toolbar
3. The extension automatically scans the page
4. View the results:
   - Overall health score (weighted)
   - Structure, Security, and Developer breakdowns
   - List of detected issues

### Understanding Results

#### Score Circle
- Shows overall health score (0-100)
- Color indicates risk level

#### Score Breakdown
- **Structure**: HTML quality score
- **Security**: Security vulnerability score (weighted 50%)
- **Developer**: Best practices score

#### Issues List
- Each issue shows:
  - Icon indicating type (security vs structure)
  - Description of the issue
  - Color-coded border (red=security, yellow=structure)

### Theme Toggle

- Click the 🌙/☀️ button in the header
- Theme preference is saved automatically
- Persists across browser sessions

---

## 🏗 Technical Architecture

### Manifest V3

The extension uses Chrome's Manifest V3, the latest standard for Chrome extensions.

```
┌─────────────────────────────────────────────────────┐
│                    manifest.json                     │
│              (Extension Configuration)              │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ background  │ │   content   │ │    popup    │
│    .js      │ │    .js      │ │  .html/js   │
│ (Service    │ │  (Injected  │ │   (UI &     │
│  Worker)    │ │   Script)   │ │  Logic)     │
└─────────────┘ └─────────────┘ └─────────────┘
```

### File Descriptions

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration, permissions, metadata |
| `background.js` | Service worker, handles message passing |
| `content.js` | Injected script, performs DOM analysis |
| `popup.html` | Extension popup UI with embedded CSS |
| `popup.js` | Popup logic, theme management, result display |

### Communication Flow

```
┌──────────┐     sendMessage      ┌────────────┐
│  Popup   │ ──────────────────▶  │ Background │
│          │                      │   Worker   │
└──────────┘                      └──────┬─────┘
                                         │ tabs.sendMessage
                                         ▼
                                  ┌────────────┐
                                  │   Content │
                                  │   Script  │
                                  └───────────┘
```

1. User clicks extension icon → Popup opens
2. Popup sends message to background worker
3. Background worker sends message to content script
4. Content script analyzes DOM
5. Results flow back to popup
6. Popup displays analysis

---

## 📊 Scoring System

### Structure Score Calculation

```
Base Score: 100

Deductions:
├── Images without alt (each): -5
├── Inline scripts (each): -3
├── Missing meta description: -10
└── Missing viewport tag: -5

Final Score = max(0, min(100, Base - Deductions))
```

### Security Score Calculation

```
Base Score: 100

Deductions:
├── No HTTPS: -30
├── JWT in localStorage: -25
├── API keys found: -20
├── Excessive scripts (>10): -15
├── Inline scripts (each): -2
└── Exposed tokens: -15

Final Score = max(0, min(100, Base - Deductions))
```

### Overall Score

```
Overall = round((Structure Score + Security Score) / 2)
```

---

## 🔐 Security Checks Explained

### 1. HTTPS Detection
- **What**: Checks if page uses `https://` protocol
- **Why**: HTTPS provides encryption and authentication
- **Risk**: Without HTTPS, data can be intercepted

### 2. Inline Script Detection
- **What**: Finds `<script>` tags without `src` attribute
- **Why**: Inline scripts are XSS attack vectors
- **Recommendation**: Use external files

### 3. JWT in localStorage
- **What**: Searches localStorage for JWT patterns
- **Why**: localStorage is vulnerable to XSS attacks
- **Recommendation**: Use httpOnly cookies

### 4. API Key Patterns
- **What**: Regex search for common key patterns
- **Patterns detected**:
  - `api_key`, `apikey`, `api-key`
  - `secret`, `password`
  - `token`, `bearer`
- **Risk**: Exposed credentials can be stolen

### 5. Excessive Scripts
- **What**: Counts external script tags
- **Threshold**: >10 scripts flagged
- **Risk**: Supply chain attacks, performance issues

### 6. Exposed Tokens
- **What**: Searches HTML attributes for long strings
- **Why**: Tokens in HTML can be scraped
- **Risk**: Unauthorized access

---

## 🎨 UI/UX Design

### Color Palette

#### Dark Mode (Default)
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark | `#0d1117` |
| Secondary | Dark Gray | `#161b22` |
| Tertiary | Gray | `#21262d` |
| Text | White | `#f0f6fc` |
| Text Secondary | Gray | `#8b949e` |
| Accent Blue | Blue | `#58a6ff` |
| Safe | Green | `#3fb950` |
| Warning | Yellow | `#d29922` |
| Danger | Red | `#f85149` |
| Border | Gray | `#30363d` |

#### Light Mode
| Element | Color | Hex |
|---------|-------|-----|
| Background | White | `#ffffff` |
| Secondary | Light Gray | `#f6f8fa` |
| Tertiary | Gray | `#eaeef2` |
| Text | Dark | `#1f2328` |
| Text Secondary | Gray | `#656d76` |
| Accent Blue | Blue | `#0969da` |
| Safe | Green | `#1a7f37` |
| Warning | Yellow | `#9a6700` |
| Danger | Red | `#cf222e` |

### Components

1. **Header**
   - Logo and title
   - Theme toggle button
   - URL display
   - HTTPS status badge

2. **Score Section**
   - Circular score gauge
   - Risk label badge
   - Structure/Security breakdown cards

3. **Issues List**
   - Scrollable list
   - Color-coded by type
   - Icon + description format

4. **Footer**
   - Version info
   - Credit text

---

## 🧪 Testing

### Test Pages Included

| File | Purpose | Expected Score |
|------|---------|----------------|
| `test-page.html` | Moderate issues | ~63 (Moderate) |
| `test-page-high-risk.html` | Multiple security issues | ~44 (High Risk) |

### Running Tests

1. Load extension in Chrome
2. Open test page in browser
3. Click WebAudit icon
4. Verify scores match expected values

### Verification Checklist

- [ ] Extension loads without errors
- [ ] Analysis completes in <1 second
- [ ] Dark mode displays correctly
- [ ] Light mode displays correctly
- [ ] Theme toggle works
- [ ] Scores calculate correctly
- [ ] Issues are detected accurately

---

## 📁 Project Structure

```
WebAudit/
├── manifest.json              # MV3 configuration
├── background.js             # Service worker
├── content.js                # DOM analyzer
├── popup.html                # Popup UI
├── popup.js                  # Popup logic
├── README.md                 # Documentation
├── TODO.md                   # Project tracking
├── test-page.html            # Test page (moderate)
└── test-page-high-risk.html  # Test page (high risk)
```

---

## ⚙️ Permissions

### Required Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access current tab's information |
| `scripting` | Execute content scripts |

### Host Permissions

| Permission | Purpose |
|------------|---------|
| `<all_urls>` | Analyze any webpage |

### Privacy

- **No data collected**: Extension runs entirely locally
- **No external calls**: All analysis done client-side
- **No backend**: Works offline after installation

---

## 📈 Future Enhancements

### Planned Features

- [ ] **Console Error Counter** - Count JavaScript errors
- [ ] **CSP Header Detection** - Check Content-Security-Policy
- [ ] **JSON Report Export** - Download analysis as JSON
- [ ] **Backend Integration** - Future ML-powered analysis
- [ ] **Side Panel View** - Alternative to popup UI
- [ ] **Cookie Security Check** - Analyze cookie attributes
- [ ] **CORS Detection** - Check CORS policy
- [ ] **Mixed Content Scanner** - Find HTTP resources on HTTPS pages

### Long-term Vision

- Integration with FastAPI backend
- Anomaly detection using Isolation Forest
- Community-shared security rules
- Chrome Web Store publication

---

## 🤝 Contributing

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/webaudit.git

# Make changes
# Edit files in your favorite editor

# Test locally
# 1. Go to chrome://extensions
# 2. Click "Reload" on WebAudit
# 3. Test your changes
```

### Code Style

- Use clear, descriptive variable names
- Comment complex logic
- Follow JavaScript best practices
- Keep functions focused and small

---

## 📄 License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [OWASP](https://owasp.org/) - Security guidelines and principles
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/) - Manifest V3 reference
- [GitHub](https://github.com/) - Design inspiration for dark mode

---

## 🔗 Links

- [Report Issues](https://github.com/yourusername/webaudit/issues)
- [Request Features](https://github.com/yourusername/webaudit/issues)
- [View Source](https://github.com/yourusername/webaudit)

---

<p align="center">
  Made with ❤️ for developers and cybersecurity enthusiasts
  
  🔍 WebAudit v2.0.0
</p>

