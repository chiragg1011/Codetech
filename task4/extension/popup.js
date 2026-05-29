/**
 * popup.js - FocusFlow Extension Popup Script
 * 
 * Drives the extension popup UI. Retrieves tracked time data from local storage,
 * queries the active tab domain, manages the local Pomodoro focus countdown,
 * and tracks connection states to the Node.js Express server.
 */

document.addEventListener("DOMContentLoaded", () => {
  // UI Elements
  const activeDomainEl = document.getElementById("activeDomain");
  const categoryLabelEl = document.getElementById("categoryLabel");
  const scoreValEl = document.getElementById("scoreVal");
  const scoreBarEl = document.getElementById("scoreBar");
  const timerDisplayEl = document.getElementById("timerDisplay");
  const pomoLabelEl = document.getElementById("pomoLabel");
  const btnStartPomo = document.getElementById("btnStartPomo");
  const btnResetPomo = document.getElementById("btnResetPomo");
  const syncStatusEl = document.getElementById("syncStatus");
  const syncTextEl = document.getElementById("syncText");

  let pomodoroInterval = null;

  // 1. Initial Load & Render
  updatePopupState();
  startPomodoroTicker();

  // Run periodic updates every 1.5 seconds
  setInterval(updatePopupState, 1500);

  // 2. Query Tab and Load Focus Stats
  function updatePopupState() {
    // A. Query currently active tab domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].url) {
        setDomainDisplay("No Active Tab", "neutral");
        return;
      }
      
      const urlStr = tabs[0].url;
      if (urlStr.startsWith("chrome://") || urlStr.startsWith("chrome-extension://")) {
        setDomainDisplay("System Page", "neutral");
        return;
      }

      const domain = extractDomain(urlStr);
      if (domain) {
        chrome.storage.local.get(["settings"], (res) => {
          const settings = res.settings || {};
          let category = "neutral";
          
          if (settings.categories && settings.categories[domain]) {
            category = settings.categories[domain];
          } else {
            // keywords
            const productiveKeywords = ["github.com", "stackoverflow.com", "medium.com", "coursera.org", "w3schools.com", "docs.", "mdn", "localhost"];
            const unproductiveKeywords = ["facebook.com", "youtube.com", "reddit.com", "twitter.com", "instagram.com", "netflix.com", "twitch.tv"];
            
            if (productiveKeywords.some(kw => domain.includes(kw))) category = "productive";
            else if (unproductiveKeywords.some(kw => domain.includes(kw))) category = "unproductive";
          }

          setDomainDisplay(domain, category);
        });
      } else {
        setDomainDisplay("System Page", "neutral");
      }
    });

    // B. Load Auth & Sync status
    chrome.storage.local.get(["token", "username", "timeBuffer"], (res) => {
      if (res.token) {
        syncStatusEl.innerHTML = `
          <span class="status-dot dot-connected"></span>
          <span id="syncText">Connected</span>
        `;
      } else {
        syncStatusEl.innerHTML = `
          <span class="status-dot dot-disconnected"></span>
          <span id="syncText">Offline (Click SaaS)</span>
        `;
      }
    });

    // C. Calculate Focus Score dynamically
    calculateDailyFocusScore();
  }

  function setDomainDisplay(domain, category) {
    activeDomainEl.innerText = domain;
    categoryLabelEl.innerText = category;
    
    // Reset classes
    categoryLabelEl.className = "productivity-label";
    if (category === "productive") {
      categoryLabelEl.classList.add("lbl-productive");
    } else if (category === "unproductive") {
      categoryLabelEl.classList.add("lbl-unproductive");
    } else {
      categoryLabelEl.classList.add("lbl-neutral");
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

  // 3. Focus Score SVG gauge circular calculator
  function calculateDailyFocusScore() {
    chrome.storage.local.get(["timeBuffer", "settings"], (res) => {
      const buffer = res.timeBuffer || {};
      const settings = res.settings || {};
      
      let productiveSec = 0;
      let totalSec = 0;

      // Sum buffer metrics
      Object.entries(buffer).forEach(([website, sec]) => {
        totalSec += sec;
        let category = "neutral";
        if (settings.categories && settings.categories[website]) {
          category = settings.categories[website];
        }
        if (category === "productive") {
          productiveSec += sec;
        }
      });

      // Default high score when empty to keep it beautiful
      let score = 100;
      if (totalSec > 0) {
        score = Math.round((productiveSec / totalSec) * 100);
      }

      // Update UI elements
      scoreValEl.innerText = `${score}%`;
      
      // Arc progress circle computation
      // Circumference = 201 (2 * PI * 32)
      const offset = 201 - (score / 100) * 201;
      scoreBarEl.style.strokeDashoffset = offset;
    });
  }

  // 4. Pomodoro UI Ticker Operations
  function startPomodoroTicker() {
    if (pomodoroInterval) clearInterval(pomodoroInterval);

    updatePomodoroUI();
    pomodoroInterval = setInterval(updatePomodoroUI, 1000);
  }

  function updatePomodoroUI() {
    chrome.storage.local.get(["pomodoro"], (res) => {
      const pomo = res.pomodoro || { status: "idle", timeLeft: 25 * 60, duration: 25 * 60 };
      
      // Calculate current countdown state dynamically if active
      if (pomo.status !== "idle" && pomo.startTime) {
        const elapsedSec = Math.round((Date.now() - pomo.startTime) / 1000);
        pomo.timeLeft = Math.max(0, pomo.duration - elapsedSec);
        
        // Timer alarms check if completed
        if (pomo.timeLeft === 0) {
          // background service worker takes care of completing states and alerts
          clearInterval(pomodoroInterval);
        }
      }

      // Render minutes/seconds countdown format
      const minutes = Math.floor(pomo.timeLeft / 60);
      const seconds = pomo.timeLeft % 60;
      timerDisplayEl.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // Set label
      if (pomo.status === "focus") {
        pomoLabelEl.innerText = "Focus Session Active";
        pomoLabelEl.style.color = "var(--accent-purple)";
        btnStartPomo.innerText = "Pause";
        btnStartPomo.className = "btn-pomo btn-pause";
      } else if (pomo.status === "break") {
        pomoLabelEl.innerText = "Break Session Active";
        pomoLabelEl.style.color = "var(--productive)";
        btnStartPomo.innerText = "Skip Break";
        btnStartPomo.className = "btn-pomo btn-start";
      } else {
        pomoLabelEl.innerText = "Pomodoro Timer";
        pomoLabelEl.style.color = "var(--text-muted)";
        btnStartPomo.innerText = "Focus Focus";
        btnStartPomo.className = "btn-pomo btn-start";
      }
    });
  }

  // Start/Pause Event Handler
  btnStartPomo.addEventListener("click", () => {
    chrome.storage.local.get(["pomodoro"], (res) => {
      const pomo = res.pomodoro || {};
      
      if (pomo.status === "idle") {
        // Start Pomodoro Focus
        pomo.status = "focus";
        pomo.duration = 25 * 60;
        pomo.timeLeft = 25 * 60;
        pomo.startTime = Date.now();
        
        // Register Alarm to complete background timer
        chrome.alarms?.create("pomodoroAlarm", { delayInMinutes: 25 });
      } else if (pomo.status === "focus") {
        // Pause and revert to idle
        pomo.status = "idle";
        pomo.timeLeft = pomo.duration;
        pomo.startTime = null;
        chrome.alarms?.clear("pomodoroAlarm");
      } else if (pomo.status === "break") {
        // Skip break, go to focus
        pomo.status = "focus";
        pomo.duration = 25 * 60;
        pomo.timeLeft = 25 * 60;
        pomo.startTime = Date.now();
        chrome.alarms?.create("pomodoroAlarm", { delayInMinutes: 25 });
      }

      chrome.storage.local.set({ pomodoro: pomo }, () => {
        updatePomodoroUI();
      });
    });
  });

  // Reset Event Handler
  btnResetPomo.addEventListener("click", () => {
    chrome.alarms?.clear("pomodoroAlarm");
    const defaultPomo = {
      status: "idle",
      duration: 25 * 60,
      timeLeft: 25 * 60,
      startTime: null
    };
    chrome.storage.local.set({ pomodoro: defaultPomo }, () => {
      updatePomodoroUI();
    });
  });
});
