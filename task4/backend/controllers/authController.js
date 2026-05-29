const jwt = require("jsonwebtoken");
const { User, connection: mongoose } = require("../models/dbStore");

// Token creation utility
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "supersecretfocusflowkey123!", {
    expiresIn: "30d"
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  // Check if database is offline
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Local MongoDB database is currently offline. Please start the MongoDB service on port 27017!" });
  }

  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        settings: user.settings,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ error: "Invalid user registration parameters" });
    }
  } catch (error) {
    console.error("[Auth Controller] Register Error:", error.message);
    res.status(500).json({ error: "Server error during registration process" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  // Check if database is offline
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Local MongoDB database is currently offline. Please start the MongoDB service on port 27017!" });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      settings: user.settings,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("[Auth Controller] Login Error:", error.message);
    res.status(500).json({ error: `Server login failed: ${error.message}` });
  }
};

// @desc    Get current user profile session
// @route   GET /api/auth/me
const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ error: "Session profile user not found" });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
