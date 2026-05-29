const { User } = require("../models/dbStore");

// @desc    Update user settings
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  const { blockedDomains, categories, pomodoroDuration } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User session not found" });
    }

    // Update settings selectively
    if (blockedDomains && Array.isArray(blockedDomains)) {
      user.settings.blockedDomains = blockedDomains.map(d => d.trim().toLowerCase());
    }

    if (categories && typeof categories === "object") {
      // Merge categories or overwrite
      user.settings.categories = { ...user.settings.categories, ...categories };
    }

    if (pomodoroDuration !== undefined) {
      const dur = parseInt(pomodoroDuration, 10);
      if (!isNaN(dur) && dur > 0) {
        user.settings.pomodoroDuration = dur;
      }
    }

    await user.save();
    
    // Return updated settings
    res.json({
      message: "Settings updated successfully!",
      settings: user.settings
    });
  } catch (error) {
    console.error("[Settings Controller] Update Error:", error.message);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

module.exports = { updateSettings };
