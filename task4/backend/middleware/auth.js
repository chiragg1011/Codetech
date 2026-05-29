const jwt = require("jsonwebtoken");
const { User } = require("../models/dbStore");

const protect = async (req, res, next) => {
  let token;

  // Retrieve token from Authorization Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // Decrypt signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretfocusflowkey123!");
      
      // Attach verified User payload (excluding password hash) to request
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: "Authorization failed, user not found" });
      }
      
      // Safely delete password hash before returning
      delete user.password;
      req.user = user;
      
      return next();
    } catch (error) {
      console.error("[Auth Middleware] Decryption failed:", error.message);
      return res.status(401).json({ error: "Not authorized, token signature invalid" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
