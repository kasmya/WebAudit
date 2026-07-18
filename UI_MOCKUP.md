# WebAudit UI Mockup Specification

## Dark Mode Theme - GitHub-inspired Design

```
┌─────────────────────────────────────────────┐
│  🛡️ WebAudit                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  file:///Users/.../test-page.html           │
│  ┌──────────┐                               │
│  │ 🔓 HTTP  │  Analysis complete             │
│  └──────────┘                               │
├─────────────────────────────────────────────┤
│  OVERALL HEALTH                             │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │         ╭───────────╮               │    │
│  │         │     60    │  🟡 Moderate  │    │
│  │         ╰───────────╯               │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌────────────┐  ┌────────────┐             │
│  │ STRUCTURE  │  │ SECURITY   │             │
│  │    87      │  │    33      │             │
│  │   (Good)   │  │  (Danger)  │             │
│  └────────────┘  └────────────┘             │
├─────────────────────────────────────────────┤
│  ⚠️ Detected Issues                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌─────────────────────────────────────┐    │
│  │ 🖼️ 1 image(s) missing alt attributes│    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 📱 Missing viewport meta tag        │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 🔓 Page is not using HTTPS          │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 📜 1 inline script found            │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 🔐 Potential API key exposed        │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  DevShield v1.0 • OWASP-Inspired           │
└─────────────────────────────────────────────┘
```

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background Primary | Dark | `#0d1117` |
| Background Secondary | Dark Gray | `#161b22` |
| Background Tertiary | Medium Gray | `#21262d` |
| Text Primary | White | `#f0f6fc` |
| Text Secondary | Gray | `#8b949e` |
| Accent Blue | Blue | `#58a6ff` |
| Safe/Green | Green | `#3fb950` |
| Warning/Yellow | Yellow | `#d29922` |
| Danger/Red | Red | `#f85149` |
| Border | Border Gray | `#30363d` |

## UI Components

### 1. Header Section
- **Logo**: 🛡️ (blue accent)
- **URL Display**: Truncated URL in gray box
- **HTTPS Badge**: 🔒 HTTPS (green) or 🔓 HTTP (red)
- **Status Text**: "Ready to analyze" / "Analyzing..." / "Analysis complete"

### 2. Score Section
- **Overall Score Circle**: 
  - 80px circular gauge
  - Color based on score (green/yellow/red)
  - Shows numeric score (0-100)
- **Risk Label**: 
  - 🟢 Safe (80-100)
  - 🟡 Moderate (50-79)  
  - 🔴 High Risk (<50)
- **Score Breakdown**:
  - Two cards showing Structure and Security scores
  - Color-coded: green (>80), yellow (50-79), red (<50)

### 3. Issues Section
- **Title**: ⚠️ Detected Issues
- **Issue Items**:
  - 🔴 Red left border for security issues
  - 🟡 Yellow left border for structure issues
  - Icon + description for each issue

## Design Principles
- ✅ Minimalist dark mode
- ✅ GitHub-inspired color scheme
- ✅ Clear visual hierarchy
- ✅ Color-coded risk indicators
- ✅ Compact but readable
- ✅ No clutter - focus on data
