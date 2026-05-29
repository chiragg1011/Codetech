const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    settings: {
      blockedDomains: {
        type: [String],
        default: ["facebook.com", "youtube.com", "reddit.com", "instagram.com", "twitter.com"]
      },
      categories: {
        type: Map,
        of: String,
        default: {
          "github.com": "productive",
          "stackoverflow.com": "productive",
          "medium.com": "productive",
          "coursera.org": "productive",
          "w3schools.com": "productive"
        }
      },
      pomodoroDuration: {
        type: Number,
        default: 25 // Default 25 minutes
      }
    }
  },
  {
    timestamps: true
  }
);

// Hash Password prior to saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password logic
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
