/**
 * server.js - FocusFlow Main Express Server
 * 
 * Sets up the web server foundation, hooks CORS settings, connects Mongoose
 * database models, mounts RESTful API endpoints for the extension/dashboard,
 * and configures runtime error management.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Initialize Database connection
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
// Expose endpoints to BOTH React Dashboard Client and Chrome Extensions safely
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Chrome Extension requests (no origin in Chrome extension sometimes, or chrome-extension://)
      if (!origin || origin.startsWith("chrome-extension://") || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS request restricted by FocusFlow Security Policy"));
      }
    },
    credentials: true
  })
);

// REST API Routes mounting
app.use("/api/auth", require("./routes/auth"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/settings", require("./routes/settings"));

// Welcome Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to FocusFlow Productivity Analytics APIs!" });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Express Error Handler] Caught:`, err.message);
  res.status(500).json({ error: err.message || "Internal server error occurred" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 FocusFlow Express Backend is running on port ${PORT}!`);
  console.log(`👉 API Endpoint: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
