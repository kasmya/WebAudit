
# DevShield - Real-Time Web Developer & Security Health Inspector

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-green?style=for-the-badge&logo=google-chrome" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge" alt="Manifest V3">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
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
12. [Why Page Access is Required](#why-page-access-is-required)
13. [Future Enhancements](#future-enhancements)
14. [Contributing](#contributing)
15. [License](#license)

---

## 🛡️ Overview

DevShield is a lightweight Chrome extension that performs real-time structural and security analysis of any webpage, presenting a clear developer health score with risk indicators. It's designed to help:

- **Beginner web developers** learn best practices
- **Cybersecurity students** understand common web vulnerabilities
- **Web developers** improve page quality and security

### Why DevShield?

DevShield provides instant feedback on:
- HTML structure quality
- Common security patterns
- Accessibility best practices
- Performance-impacting patterns

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

### 🔐 Security Checks

| Check | Risk Level | Description |
|-------|------------|-------------|
| HTTPS Detection | 🔴 High | Verifies page uses secure protocol |
| Inline Script Detection | 🟡 Medium | Finds inline `<script>` tags |
| JWT localStorage | 🔴 High | Detects JWT tokens in localStorage |
| API Key Patterns | 🔴 High | Regex patterns for exposed credentials |
| Excessive Scripts | 🟡 Medium | Warns if >10 external scripts |
| Exposed Tokens | 🔴 High | Finds tokens in HTML attributes |

---

## 📊 Risk Scoring System

The extension calculates three scores:

1. **Structure Score (0-100)** - Based on HTML best practices
2. **Security Score (0-100)** - Based on security patterns
3. **Overall Health (0-100)** - Average of structure and security

#### Risk Categories:

| Score Range | Category | Color |
|-------------|----------|-------|
| 80-100 | 🟢 Safe | Green |
| 50-79 | 🟡 Moderate | Yellow |
| 0-49 | 🔴 High Risk | Red |

---

## 🚀 Installation

### Prerequisites

- Google Chrome browser (version 88 or higher)
- OR any Chromium-based browser (Edge, Brave, etc.)

### Manual Installation

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/kasmya/DevShield.git
   cd DevShield
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions` in Chrome address bar
   - OR click Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner: **"Developer mode"**

4. **Load the Extension**
   - Click the **"Load unpacked"** button
   - Select the `DevShield` folder

5. **Pin to Browser**
   - Click the puzzle piece icon (🧩) in Chrome toolbar
   - Click the pin icon next to DevShield

---

## 📖 Usage

1. Navigate to any webpage you want to analyze
2. Click the DevShield extension icon in your browser toolbar
3. The extension automatically scans the page
4. View the results:
   - Overall health score
   - Structure and security breakdowns
   - List of detected issues

---

## 🏗 Technical Architecture

### Manifest V3

The extension uses Chrome's Manifest V3, the latest standard for Chrome extensions.

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration, permissions, metadata |
| `background.js` | Service worker, handles message passing |
| `content.js` | Injected script, performs DOM analysis |
| `popup.html` | Extension popup UI with embedded CSS |
| `popup.js` | Popup logic, result display |

### Communication Flow

1. User clicks extension icon → Popup opens
2. Popup sends message to background worker
3. Background worker sends message to content script
4. Content script analyzes DOM
5. Results flow back to popup
6. Popup displays analysis

---

## 🔐 Security Checks Explained

### 1. HTTPS Detection
- **What**: Checks if page uses `https://` protocol
- **Why**: HTTPS provides encryption and authentication

### 2. Inline Script Detection
- **What**: Finds `<script>` tags without `src` attribute
- **Why**: Inline scripts can be security concerns

### 3. JWT in localStorage
- **What**: Searches localStorage for JWT patterns
- **Why**: Understanding storage security best practices

### 4. API Key Patterns
- **What**: Regex search for common credential patterns
- **Why**: Help developers identify accidentally exposed keys

### 5. Excessive Scripts
- **What**: Counts external script tags
- **Threshold**: >10 scripts flagged
- **Why**: Performance and supply chain considerations

### 6. Exposed Tokens
- **What**: Searches HTML attributes for long strings
- **Why**: Help identify potentially sensitive data in DOM

---

## 🎨 UI/UX Design

### Color Palette (Dark Mode)

| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark | `#0d1117` |
| Secondary | Dark Gray | `#161b22` |
| Text | White | `#f0f6fc` |
| Accent Blue | Blue | `#58a6ff` |
| Safe | Green | `#3fb950` |
| Warning | Yellow | `#d29922` |
| Danger | Red | `#f85149` |

### Components

1. **Header** - Logo, title, URL display, HTTPS status badge
2. **Score Section** - Circular score gauge, risk label, breakdown cards
3. **Issues List** - Scrollable, color-coded by type
4. **Footer** - Version info

---

## 🧪 Testing

### Test Pages Included

| File | Purpose | Expected Score |
|------|---------|----------------|
| `test-page.html` | Moderate issues | ~63 (Moderate) |
| `test-page-high-risk.html` | Multiple security issues | ~44 (High Risk) |

### Verification Checklist

- [ ] Extension loads without errors
- [ ] Analysis completes in <1 second
- [ ] Scores calculate correctly
- [ ] Issues are detected accurately

---

## 📁 Project Structure

```
DevShield/
├── manifest.json              # MV3 configuration
├── background.js             # Service worker
├── content.js                # DOM analyzer
├── popup.html                # Popup UI
├── popup.js                  # Popup logic
├── README.md                 # Documentation
├── TODO.md                   # Project tracking
├── EVALUATION.md             # Test metrics
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
| `https://*/*` | Analyze HTTPS webpages |
| `http://*/*` | Analyze HTTP webpages (localhost) |

---

## 🔑 Why Page Access is Required

DevShield requires page access to perform the following analysis:

1. **DOM Inspection**: Analyzing HTML structure (forms, inputs, scripts, images)
2. **Script Counting**: Counting inline and external scripts
3. **Token Detection**: Scanning for potential security tokens
4. **Security Heuristic Analysis**: Evaluating common web security patterns
5. **Meta Tag Analysis**: Checking for essential meta tags

All analysis is performed **locally** in the user's browser. No data is transmitted to any external server.

---

## 📈 Future Enhancements

- [ ] Console Error Counter
- [ ] CSP Header Detection
- [ ] JSON Report Export
- [ ] Backend Integration (future)
- [ ] Side Panel View
- [ ] Cookie Security Check

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📝 Resume Description

> Developed a Chrome extension that performs real-time structural and security analysis of webpages using DOM inspection and client-side risk heuristics. Implemented scoring logic, JWT detection, API key pattern analysis, HTTPS verification using Manifest V3 architecture.

---

## 📄 License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) for details.

---

## 🔒 Privacy

DevShield performs all analysis **locally** in the user's browser. **No data is collected, stored, transmitted, or shared with any external service.**

This extension:
- Does not track users
- Does not collect personal information
- Does not send data to any server
- Works completely offline after installation

---

## 🔗 Links

- [Report Issues](https://github.com/kasmya/DevShield/issues)
- [View Source](https://github.com/kasmya/DevShield)

---

<p align="center">
  Made with ❤️ for developers

  🛡️ DevShield v1.0.0
</p>

