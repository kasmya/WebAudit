// WebAudit - Background Service Worker
// Handles communication between content script and popup

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze" || request.action === "analyzePage") {
    // Execute content script on the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, { action: "analyze" }, (response) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: "Unable to analyze this page. Make sure you're on a webpage." });
            } else {
              sendResponse(response);
            }
          });
        } catch (e) {
          sendResponse({ error: "Error: " + e.message });
        }
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Log when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("WebAudit Extension installed successfully");
});

