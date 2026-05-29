# AeroChat - Real-Time Collaborative Workspace 🚀

A professional, full-stack, real-time chat application built for **Internship Task-2: Chat Application**. 

AeroChat features a stunning, premium dark glassmorphic user interface using HTML5, CSS3, Vanilla JavaScript, and is powered by a Node.js + Express.js backend using Socket.IO for real-time bi-directional WebSockets communications.

---

## 🎨 Design & UI Features
- **Modern Glassmorphic Dark UI**: Custom slate color palette, transparent frosted-glass panels, glowing background accents, and responsive layout.
- **Micro-Animations**: Custom button hovers, pulsing live status dots, sliding transitions, bouncing typing indicator dots, and smooth entry animations for messages.
- **Visual Customizations**: Join screen allows users to select a custom profile color theme.
- **Completely Responsive**: Perfect layout optimization across smartphones, tablets, and desktop displays.

---

## ⚡ Core Functionality
- **Instant Messaging**: Seamless message delivery powered by Socket.IO, operating dynamically without page refreshes.
- **User Join/Leave Log**: Instant notifications broadcasted to all active participants when a user connects or disconnects.
- **Real-Time Sidebar User Directory**: Active workspace directory updating in real-time, showing who is currently online.
- **Active Typing Status**: Shows who is currently typing a message.
- **Auto-Scrolling**: Keeps users focused on the conversation by instantly scrolling down to the latest message.
- **Secure Handling**: Escapes inputs dynamically on rendering to block cross-site scripting (XSS) injections.
- **Input Validation**: Rejects blank messages and restricts entries to maximum limits.
- **Emoji Picker Menu**: Interactive emoji selector dropdown inside the input footer for seamless integration.

---

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3 (Vanilla Custom Layout), Javascript (ES6+)
- **Backend**: Node.js, Express.js
- **Real-Time Communication**: Socket.IO
- **Fonts & Icons**: Google Fonts (Plus Jakarta Sans), FontAwesome 6

---

## 📂 Project Directory Structure
```
chat-app/
├── public/
│   ├── index.html       # Client Single-Page layout skeleton
│   ├── style.css        # Premium glassmorphic stylesheets
│   └── script.js        # Socket.IO client-side controller
├── server.js            # Node.js + Express + Socket.IO server engine
├── package.json         # Project dependencies & scripts
├── README.md            # System Documentation
└── .gitignore           # Excludes local environments & nodes
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v16.0.0 or higher recommended).

### 1. Clone & Setup
If setting up locally, extract/navigate into the project root directory:
```bash
cd chat-app
```

### 2. Install Dependencies
Run the command below to automatically install `express`, `socket.io`, and developer dependency `nodemon` specified in `package.json`:
```bash
npm install
```

### 3. Run the Server

#### Development Mode (With Auto-Reload)
Launches the server using `nodemon` which dynamically restarts whenever source code edits are saved:
```bash
npm run dev
```

#### Production Mode
Launches the server in production mode using Node:
```bash
npm start
```

Once started, open your web browser and navigate to:
👉 **[http://localhost:3002](http://localhost:3002)**

*Open multiple tabs/windows to test real-time chat sync across separate sessions!*


