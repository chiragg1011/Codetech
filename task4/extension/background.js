/**
 * background.js - FocusFlow Service Worker
 * 
 * Tracks active website tab time in seconds, detects user idle/locked states,
 * intercepts and redirects blocked distracting websites, manages the Pomodoro focus clock,
 * and synchronizes logs with the Express backend using JWT authentication.
 */

const BACKEND_URL = "http://localhost:5000";
const SYNC_INTERVAL_SEC = 30; // Sync logs every 30 seconds

let activeTabId = null;
let activeDomain = null;
let trackingStartTime = null;
let isUserIdle = false;

// 1. Initialize Chrome Storage Default Configurations
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    timeBuffer: {},       // Format: { "domain.com": seconds }
    pomodoro: {
      status: "idle",     // "idle" | "focus" | "break"
      duration: 25 * 60,  // Mins default in seconds
      timeLeft: 25 * 60,
      startTime: null
    },
    settings: {
      blockedDomains: ["facebook.com", "youtube.com", "reddit.com", "instagram.com", "twitter.com"],
      categories: {
        "github.com": "productive",
        "stackoverflow.com": "productive",
        "medium.com": "productive",
        "coursera.org": "productive",
        "w3schools.com": "productive"
      }
    }
  });
  console.log("[FocusFlow background] Storage initialized.");
});

// Configure Idle State Detector (Bypass interval set to 60s)
chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener((newState) => {
  console.log(`[FocusFlow background] Idle State Changed: ${newState}`);
  if (newState === "idle" || newState === "locked") {
    isUserIdle = true;
    pauseTracking();
  } else {
    isUserIdle = false;
    resumeTracking();
  }
});

// 2. Core Active Tab and URL Listeners
chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabSwitch(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    handleTabSwitch(tabId);
  }
});

// Windows Focus Changed Listener
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    pauseTracking();
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        handleTabSwitch(tabs[0].id);
      }
    });
  }
});

// 3. Tab Tracking Mappings
function handleTabSwitch(tabId) {
  if (isUserIdle) return;

  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab || !tab.url) {
      pauseTracking();
      return;
    }

    const domain = extractDomain(tab.url);
    if (!domain || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      pauseTracking();
      return;
    }

    // Check if domain is blocked
    checkBlockedRedirect(tabId, domain);

    // Save previous tracked time
    recordPreviousTime();

    // Start tracking new domain
    activeTabId = tabId;
    activeDomain = domain;
    trackingStartTime = Date.now();
  });
}

function pauseTracking() {
  recordPreviousTime();
  activeTabId = null;
  activeDomain = null;
  trackingStartTime = null;
}

function resumeTracking() {
  if (activeTabId) {
    handleTabSwitch(activeTabId);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        handleTabSwitch(tabs[0].id);
      }
    });
  }
}

function extractDomain(urlStr) {
  try {
    const url = new URL(urlStr);
    let hostname = url.hostname;
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }
    return hostname;
  } catch (e) {
    return null;
  }
}

// 4. Save Accumulated Active Duration to Storage Buffers
function recordPreviousTime() {
  if (!activeDomain || !trackingStartTime) return;

  const elapsedSeconds = Math.round((Date.now() - trackingStartTime) / 1000);
  if (elapsedSeconds <= 0) return;

  chrome.storage.local.get(["timeBuffer"], (res) => {
    const buffer = res.timeBuffer || {};
    buffer[activeDomain] = (buffer[activeDomain] || 0) + elapsedSeconds;
    chrome.storage.local.set({ timeBuffer: buffer }, () => {
      console.log(`[FocusFlow background] Tracked: ${activeDomain} for ${elapsedSeconds}s`);
    });
  });

  trackingStartTime = Date.now(); // reset start timestamp for currently continuing block
}

// 5. Intercept and Redirect Blocked Websites
function checkBlockedRedirect(tabId, domain) {
  chrome.storage.local.get(["settings"], (res) => {
    const blockedList = res.settings?.blockedDomains || [];
    const isRestricted = blockedList.some(blocked => domain === blocked || domain.endsWith("." + blocked));
    
    if (isRestricted) {
      // Check if pomodoro is actively focusing
      chrome.storage.local.get(["pomodoro"], (pomoRes) => {
        const isFocusMode = pomoRes.pomodoro?.status === "focus";
        
        // Block during active focus mode OR standard blocks
        const extensionUrl = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(domain)}`);
        chrome.tabs.update(tabId, { url: extensionUrl });
        console.log(`[Blocked Redirect] Blocked access to: ${domain}`);
        
        // Show desktop alert
        showNotification("Website Blocked", `Access to ${domain} was restricted to keep you focused!`);
      });
    }
  });
}

// 6. Local Storage to Backend Database Syncer Loop
setInterval(() => {
  syncLogsWithBackend();
}, SYNC_INTERVAL_SEC * 1000);

function syncLogsWithBackend() {
  recordPreviousTime(); // Flush any currently accumulating time before syncing

  chrome.storage.local.get(["timeBuffer", "token", "settings"], async (res) => {
    const buffer = res.timeBuffer || {};
    const token = res.token;
    const settings = res.settings || {};

    if (!token || Object.keys(buffer).length === 0) {
      return; // No auth or no logs to sync
    }

    // Format logs into activity payload array
    const syncData = Object.entries(buffer).map(([website, duration]) => {
      // Determine category mapping
      let category = "neutral";
      if (settings.categories && settings.categories[website]) {
        category = settings.categories[website];
      } else {
        // Fallback default category logic
        const productiveKeywords = ["github.com", "stackoverflow.com", "medium.com", "coursera.org", "w3schools.com", "docs.", "mdn", "localhost"];
        const unproductiveKeywords = ["facebook.com", "youtube.com", "reddit.com", "twitter.com", "instagram.com", "netflix.com", "twitch.tv"];
        
        if (productiveKeywords.some(kw => website.includes(kw))) category = "productive";
        else if (unproductiveKeywords.some(kw => website.includes(kw))) category = "unproductive";
      }

      return {
        website,
        duration,
        category,
        date: new Date().toISOString()
      };
    });

    try {
      console.log("[FocusFlow Sync] Syncing records to backend...", syncData);
      const response = await fetch(`${BACKEND_URL}/api/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ activities: syncData })
      });

      if (response.ok) {
        // Clear successfully synced logs from buffer
        chrome.storage.local.set({ timeBuffer: {} });
        console.log("[FocusFlow Sync] Successfully synced to MongoDB Atlas!");
      } else {
        console.error("[FocusFlow Sync] Server responded with error status:", response.status);
      }
    } catch (error) {
      console.error("[FocusFlow Sync] Server connection failed. Retaining offline buffer logs.", error.message);
    }
  });
}

// 7. Pomodoro Focus Alarms Listener & Notification System
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoroAlarm") {
    chrome.storage.local.get(["pomodoro"], (res) => {
      const pomo = res.pomodoro || {};
      if (pomo.status === "focus") {
        pomo.status = "break";
        pomo.duration = 5 * 60; // 5 mins break
        pomo.timeLeft = 5 * 60;
        pomo.startTime = Date.now();
        showNotification("Focus Time Completed!", "Amazing job staying productive! Take a well-deserved 5-minute break.");
      } else if (pomo.status === "break") {
        pomo.status = "idle";
        pomo.duration = 25 * 60;
        pomo.timeLeft = 25 * 60;
        pomo.startTime = null;
        showNotification("Break Finished!", "Ready to dive back in? Launch a new Pomodoro focus block.");
      }
      chrome.storage.local.set({ pomodoro: pomo });
    });
  }
});

function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: title,
    message: message,
    priority: 2
  });
}
