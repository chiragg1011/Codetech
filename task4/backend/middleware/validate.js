const validateRegisterInput = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please fill all required registration fields" });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email format" });
  }
  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please provide both email and password" });
  }
  next();
};

module.exports = { validateRegisterInput, validateLoginInput };
