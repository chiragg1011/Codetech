/**
 * dbStore.js - Light, file-based JSON Database Adapter
 * 
 * Mimics Mongoose query methods (.findOne, .find, .create, .save, .findById)
 * by storing records in server/data/db.json. It guarantees 100% offline
 * operation, zero network dependencies, and works out-of-the-box on Windows!
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "../data/db.json");
const dbDir = path.dirname(dbPath);

// Ensure DB directory and file exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], activities: [], reports: [] }, null, 2));
}

function readDB() {
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], activities: [], reports: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ----------------------------------------------------
// 1. User Model Mock
// ----------------------------------------------------
const User = {
  findOne: async (query) => {
    const db = readDB();
    const user = db.users.find(u => u.email === query.email);
    if (!user) return null;
    return decorateUser(user);
  },

  findById: async (id) => {
    const db = readDB();
    const user = db.users.find(u => u._id === id.toString());
    if (!user) return null;
    return decorateUser(user);
  },

  create: async (userData) => {
    const db = readDB();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = {
      _id: Date.now().toString(),
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      settings: {
        blockedDomains: ["facebook.com", "youtube.com", "reddit.com", "instagram.com", "twitter.com"],
        categories: {
          "github.com": "productive",
          "stackoverflow.com": "productive",
          "medium.com": "productive",
          "coursera.org": "productive",
          "w3schools.com": "productive"
        },
        pomodoroDuration: 25
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);
    return decorateUser(newUser);
  }
};

function decorateUser(userObj) {
  // Add methods to match Mongoose document interface
  return {
    ...userObj,
    comparePassword: async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    },
    save: async function() {
      const db = readDB();
      const idx = db.users.findIndex(u => u._id === this._id);
      if (idx !== -1) {
        this.updatedAt = new Date().toISOString();
        db.users[idx] = { ...this };
        writeDB(db);
      }
      return this;
    },
    // select mock helper
    select: function() {
      return this; // mock chain
    }
  };
}

// ----------------------------------------------------
// 2. Activity Model Mock
// ----------------------------------------------------
const Activity = {
  findOne: async (query) => {
    const db = readDB();
    const act = db.activities.find(a => 
      a.user === query.user.toString() && 
      a.website === query.website && 
      new Date(a.date).getTime() === new Date(query.date).getTime()
    );
    if (!act) return null;
    return decorateActivity(act);
  },

  find: async (query) => {
    const db = readDB();
    let results = db.activities.filter(a => a.user === query.user.toString());
    
    // Handle date ranges if present
    if (query.date && query.date.$gte) {
      const gteTime = new Date(query.date.$gte).getTime();
      results = results.filter(a => new Date(a.date).getTime() >= gteTime);
    }

    // Mock query chains (.sort, .limit)
    return {
      sort: function() {
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        return this;
      },
      limit: function(num) {
        results = results.slice(0, num);
        return results;
      },
      // If directly awaited, acts as Array
      then: function(resolve) {
        resolve(results);
      }
    };
  },

  create: async (actData) => {
    const db = readDB();
    const newAct = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      user: actData.user.toString(),
      website: actData.website,
      category: actData.category || "neutral",
      duration: actData.duration,
      date: new Date(actData.date || Date.now()).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.activities.push(newAct);
    writeDB(db);
    return decorateActivity(newAct);
  }
};

function decorateActivity(actObj) {
  return {
    ...actObj,
    save: async function() {
      const db = readDB();
      const idx = db.activities.findIndex(a => a._id === this._id);
      if (idx !== -1) {
        this.updatedAt = new Date().toISOString();
        db.activities[idx] = { ...this };
        writeDB(db);
      }
      return this;
    }
  };
}

// ----------------------------------------------------
// 3. Connection State Mock (Always 1 = Connected!)
// ----------------------------------------------------
const connection = {
  connection: {
    readyState: 1
  }
};

module.exports = { User, Activity, connection };
