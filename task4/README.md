# FocusFlow – Productivity Tracker & Web Time Analytics

FocusFlow is a professional, SaaS-style full-stack productivity monitoring assistant (similar to RescueTime and ActivityWatch) built as **Task-4** for the internship assignment. 

It consists of a **Chrome Extension (Manifest V3)** that tracks active website browser times and blocks distracting domains, a **Node.js Express REST API server** utilizing an offline local JSON file database for data logs aggregations, and a **Vite + React.js web dashboard** that displays beautiful, responsive productivity weekly reports and AI suggestions.

---

## 🌟 Key Product Features

1. **Intelligent Website Time Tracking:** Extends Chrome active tabs hooks to extract base domain names. Tracks active tab duration in seconds.
2. **Auto-Idle Detection:** Integrates the Chrome Idle API. If the user goes inactive or locks their computer for over 60 seconds, time tracking pauses instantly.
3. **Robust Website Blocker:** Redirects distracting domains (e.g. `facebook.com`, `youtube.com`) to a gorgeous glassmorphic Focus redirection page with motivational quotes.
4. **Interactive Pomodoro Clock:** Features a deep-focus countdown timer (25 min work, 5 min break) in both the Extension Popup and Dashboard, dispatching Chrome Desktop notifications on completion.
5. **Dynamic Web Dashboard:** High-end glassmorphic UI displaying focus hours, focus score percentage, distraction counters, and a chronological domain duration logs grid.
6. **Weekly Productivity Reports:** Detailed category donut charts and weekly bar graphs mapping focus metrics by day. Enables standard printable PDF export options.
7. **AI Focus Suggestions:** Reads user metrics and heuristically compiles structured productivity suggestions (e.g. recommending Strict Block Mode on low-focus days).
8. **Resilient Offline Buffering:** Buffers logs inside `chrome.storage.local` if offline, successfully flushing buffered logs once connection is established.
9. **Zero-Dependency Offline Database:** Stored inside `backend/data/db.json`, it implements Mongoose-like queries (.findOne, .find, .create, .save) ensuring 100% offline security, zero installation steps, and works on any machine instantly.

---

## 📂 Project Directory Structure

```
task4/
├── extension/                 # Chrome Extension (Manifest V3)
│   ├── manifest.json          # MV3 configuration & permissions
│   ├── background.js          # Tab track service worker, idle detector, & sync loops
│   ├── content.js             # Content scan script
│   ├── popup.html             # UI for circular score arc gauge & Pomodoro timers
│   ├── popup.js               # Popup states controller & Pomodoro timer actions
│   ├── blocked.html           # Target page for domain redirects ( motivational quotes)
│   ├── blocked.js             # Quotes randomizer & unblock triggers
│   └── icons/                 # Extension store icon assets (16px, 48px, 128px)
│
├── backend/                   # Node.js + Express Backend
│   ├── config/
│   │   └── db.js              # Database connection bootstrap
│   ├── models/
│   │   └── dbStore.js         # Offline local file database adapter (Mock Mongoose API)
│   ├── controllers/
│   │   ├── authController.js  # JWT Auth controller
│   │   ├── actController.js   # Sync logs & reports controller
│   │   └── setController.js   # User blocker rules controller
│   ├── routes/
│   │   ├── auth.js            # Router mount (/api/auth)
│   │   ├── activity.js        # Router mount (/api/activity)
│   │   └── settings.js        # Router mount (/api/settings)
│   ├── middleware/
│   │   ├── auth.js            # Secure JWT decryption validation
│   │   └── validate.js        # Auth input filter sanitizers
│   ├── server.js              # Express app boots, CORS configs, and PORT listeners
│   ├── .env.example           # Configurations template
│   ├── .env                   # Active environment variables
│   └── package.json           # Server dependencies
│
└── frontend/                  # React + Vite + Tailwind Web Application
    ├── src/
    │   ├── components/
    │   │   ├── MetricCard.jsx # Glassmorphic KPI metric boxes
    │   │   ├── TimeChart.jsx  # Recharts Weekly Activity Bar distribution
    │   │   ├── CategoryPie.jsx# Recharts Category Donut distribution
    │   │   └── PomoTimer.jsx  # Syncable Pomodoro Focus widget
    │   ├── pages/
    │   │   ├── Login.jsx      # Session login screen
    │   │   ├── Register.jsx   # Register signup screen
    │   │   ├── Dashboard.jsx  # Core metrics grid, AI建议, & activities table
    │   │   ├── Reports.jsx    # Weekly history, focus scores, & PDF export action
    │   │   └── Settings.jsx   # Blocked domains manager & category customizers
    │   ├── context/
    │   │   └── AuthContext.jsx# Application session auth provider
    │   ├── App.jsx            # Router and Protected route shields
    │   ├── main.jsx           # React app wrapper
    │   ├── index.css          # Tailwind UI glassmorphism directives
    │   └── api.js             # API connection and fetching layer
    ├── index.html             # Vite entry wrapper
    ├── tailwind.config.js     # Tailwind setup
    ├── postcss.config.js      # CSS build directives
    ├── vite.config.js         # Build system config
    └── package.json           # React dependencies
```

---

## 🔧 Installation & Local Setup

### Step 1: Set Up & Start Express Server
1. Navigate into the `/backend` folder.
2. Install dependencies:
3. Start the development server:
   ```bash
   cd backend
   ```
   ```powershell
   npm install
   npm run dev
   ```
   *The server will boot successfully on port `5000`.*

---

### Step 2: Set Up & Start React Web App
1. Open a second terminal window in the `/frontend` folder.
2. Install dependencies:
3. Launch the development server:
   ```bash
   cd frontend
   ```
   ```powershell
   npm install
   npm start
   ```
   *Vite serves the dashboard at `http://localhost:3000`.*

---

### Step 3: Load FocusFlow Chrome Extension
1. Open Google Chrome and type `chrome://extensions/` in your address bar.
2. Toggle the **Developer mode** switch in the top-right corner to **ON**.
3. In the top-left, click the **Load unpacked** button.
4. Select the **`/extension`** folder inside this project directory.
5. The extension is now successfully installed!
