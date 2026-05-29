# SyncQuill — Real-Time Collaborative Document Editor

SyncQuill is a professional, high-fidelity full-stack web application designed for co-authoring rich-text documents in real time. Architected similarly to Google Docs, SyncQuill permits multiple simultaneous users to write, format, and structure documents concurrently, with instant character-level synchronization, active collaborator indicators, design template boots, and persistent cloud auto-saving.

Developed as a highly polished submission for the **Internship Task-3**.

---

## 🚀 Key Features

* **Real-Time Collaborative Editing**: Character-by-character changes synchronize instantaneously across all active tabs and browsers using WebSocket technology.
* **Smart Conflict Resolution (Quill Deltas)**: Integrates fine-grained JSON delta formatting, broadcasting incremental modifications instead of overwriting raw HTML blocks, preventing synchronization collisions.
* **Autosave to MongoDB**: Debounces document saves with a 1.5-second timer after a user finishes typing, keeping database writes efficient and minimizing data loss.
* **Active Collaborators Avatar Stack**: A dynamic user list in the top navigation panel displays the colored initials avatars and tooltips of all users currently active in the room.
* **Document Dashboard**: A modern hub to create new documents, search existing ones, and manage them with robust REST endpoints (including secure document deletion).
* **Document Styling Templates**: Bootstrap new projects instantly using professional pre-filled templates:
  - **Blank Document**: Start clean.
  - **Professional Resume**: Preloaded with a highly structured template for tech resumes.
  - **Weekly Team Sync**: Formatted for outlining agendas, discussion points, and checklist action items.
  - **Project Proposal**: Preconfigured with executive summaries, problem statements, and timelines.
* **Lightweight Hash-Based Routing**: Zero external package dependencies, ensuring deep linking (copying/sharing the document URL directly joins other users into that exact document).
* **Connection Status Beacon**: Pulsing green/red indicator showcasing live socket link health.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **React.js**: Modular component-based rendering.
* **Socket.IO Client**: Persistent real-time communication connection.
* **Quill.js**: Modern, high-performance web rich-text editor engine.
* **Lucide React**: Clean, lightweight, professional modern iconography.
* **Vanilla CSS**: Curated, responsive styling tokens, glassmorphism dashboards, custom scrollbars, and fluid scaling micro-animations.
* **Vite**: Rapid compiler and hot module dev server.

### Backend (Server)
* **Node.js**: Asynchronous server runtime environment.
* **Express.js**: Structured RESTful API endpoints.
* **Socket.IO**: Real-time event communication engine.
* **Mongoose**: Schematized Object Data Modeling (ODM) for MongoDB.
* **Cors**: Cross-Origin Resource Sharing handling.
* **Dotenv**: Secure environment variable configuration.
* **Nodemon**: Auto-restarts backend on script modifications.

### Database
* **MongoDB**: NoSQL document store persisting document structures, delta states, and metadata.

---

## 💻 Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v16+ recommended) and [MongoDB](https://www.mongodb.com/) installed locally.

### 1. Database Setup (MongoDB)
* **Local Setup**: Ensure your MongoDB Service is running. By default, it runs on `mongodb://127.0.0.1:27017/`. The application will automatically create a database named `collaborative-editor`.
* **MongoDB Atlas (Cloud)**: If using Atlas, copy your Connection String (e.g. `mongodb+srv://...`) and paste it in the server `.env` configuration.

### 2. Backend Server Configuration
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file (configured by default, but customizable):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/collaborative-editor
   CLIENT_URL=http://localhost:5173
   ```
4. Start the server (Development Mode with Nodemon):
   ```bash
   npm run dev
   ```
   *The console should print:* `Successfully connected to MongoDB` and `Collab Server is running on port 5000`.

### 3. Frontend Client Configuration
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The console should display:* `Local: http://localhost:5173/`. Open this link in multiple side-by-side browser tabs to test the collaboration live!

---

## 📁 Project Structure

```text
task3/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js      # Main hub, templates, doc search card grid
│   │   │   ├── Navbar.js         # Doc title renaming, avatars stack, cloud saves
│   │   │   └── LoginModal.js     # User nickname & avatar color selector
│   │   ├── App.js                # Routing, cached sessions, mount switcher
│   │   ├── index.js              # React DOM mounting
│   │   ├── Editor.js             # Quill initialization, Delta synchronizer
│   │   └── styles.css            # Custom layout, themes, and design tokens
│   ├── index.html                # Entry web template
│   ├── vite.config.js            # Vite configurations
│   └── package.json              # Frontend modules list
│
├── backend/
│   ├── models/
│   │   └── Document.js           # Mongoose document scheme
│   ├── server.js                 # Socket room actions & REST API routing
│   ├── .env                      # Environment config variables
│   ├── .env.example              # Config variables reference template
│   └── package.json              # Backend packages and startup commands
│
├── README.md                     # Comprehensive product guide
└── .gitignore                    # Local ignored file lists
```

---
