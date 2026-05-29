const { Activity } = require("../models/dbStore");

// @desc    Sync multiple activities (Offline buffer flush)
// @route   POST /api/activity
const syncActivities = async (req, res) => {
  const { activities } = req.body;
  if (!activities || !Array.isArray(activities)) {
    return res.status(400).json({ error: "Invalid activities payload array format" });
  }

  try {
    const syncPromises = activities.map(async (act) => {
      const { website, category, duration, date } = act;

      // Extract day index boundary (midnight to midnight) to group logs
      const logDate = new Date(date || Date.now());
      logDate.setHours(0, 0, 0, 0);

      // Check if domain log already exists for user on this day
      const existingAct = await Activity.findOne({
        user: req.user._id,
        website,
        date: logDate
      });

      if (existingAct) {
        // Increment duration
        existingAct.duration += duration;
        // Optionally update category if user customized it
        if (category) existingAct.category = category;
        return await existingAct.save();
      } else {
        // Create new log
        return await Activity.create({
          user: req.user._id,
          website,
          category: category || "neutral",
          duration,
          date: logDate
        });
      }
    });

    await Promise.all(syncPromises);
    res.status(200).json({ message: "Activities synchronized successfully with MongoDB!" });
  } catch (error) {
    console.error("[Activity Sync Controller] Sync Error:", error.message);
    res.status(500).json({ error: "Failed to synchronize activities" });
  }
};

// @desc    Get all daily activity logs
// @route   GET /api/activity
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(200);
    res.json(activities);
  } catch (error) {
    console.error("[Activity Controller] Get Logs Error:", error.message);
    res.status(500).json({ error: "Failed to retrieve activity history" });
  }
};

// @desc    Get aggregated focus/analytics statistics
// @route   GET /api/activity/stats
const getActivityStats = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id });

    let productiveTime = 0;
    let unproductiveTime = 0;
    let neutralTime = 0;
    let totalTime = 0;
    
    const domainMap = {};

    activities.forEach(act => {
      totalTime += act.duration;
      if (act.category === "productive") productiveTime += act.duration;
      else if (act.category === "unproductive") unproductiveTime += act.duration;
      else neutralTime += act.duration;

      // Group domains
      domainMap[act.website] = (domainMap[act.website] || 0) + act.duration;
    });

    const focusScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 100;

    // Format top domains
    const topDomains = Object.entries(domainMap)
      .map(([domain, duration]) => ({ domain, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    res.json({
      totalTime,
      productiveTime,
      unproductiveTime,
      neutralTime,
      focusScore,
      topDomains
    });
  } catch (error) {
    console.error("[Activity Stats Controller] Aggregation Error:", error.message);
    res.status(500).json({ error: "Failed to calculate activity stats" });
  }
};

// @desc    Get Weekly Report & AI Suggestions
// @route   GET /api/activity/report/weekly
const getWeeklyReport = async (req, res) => {
  try {
    // Query last 7 days metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await Activity.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    });

    // Group logs by Day of the Week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dailyAnalytics = {};
    daysOfWeek.forEach(day => {
      dailyAnalytics[day] = { productive: 0, unproductive: 0, neutral: 0 };
    });

    let totalDuration = 0;
    let totalProd = 0;
    let totalUnprod = 0;

    activities.forEach(act => {
      const dayName = daysOfWeek[new Date(act.date).getDay()];
      dailyAnalytics[dayName][act.category] += act.duration;
      totalDuration += act.duration;
      if (act.category === "productive") totalProd += act.duration;
      else if (act.category === "unproductive") totalUnprod += act.duration;
    });

    // Most/Least productive days
    let mostProdVal = -1;
    let leastProdVal = Infinity;
    let mostProdDay = "N/A";
    let leastProdDay = "N/A";

    Object.entries(dailyAnalytics).forEach(([day, metrics]) => {
      const prodTime = metrics.productive;
      if (prodTime > mostProdVal && prodTime > 0) {
        mostProdVal = prodTime;
        mostProdDay = day;
      }
      if (prodTime < leastProdVal && prodTime >= 0 && (metrics.productive || metrics.unproductive)) {
        leastProdVal = prodTime;
        leastProdDay = day;
      }
    });

    if (leastProdDay === "N/A") leastProdDay = "None";

    const focusScore = totalDuration > 0 ? Math.round((totalProd / totalDuration) * 100) : 100;

    // AI Heuristics suggestions block
    let aiSuggestions = "";
    const prodHours = Math.round((totalProd / 3600) * 10) / 10;
    const unprodHours = Math.round((totalUnprod / 3600) * 10) / 10;

    if (totalDuration === 0) {
      aiSuggestions = "No data recorded this week yet. Install the extension and start browsing coding documentation or classes to track your focus score!";
    } else if (focusScore >= 75) {
      aiSuggestions = `Incredible work! Your focus score is outstanding at ${focusScore}%. You spent ${prodHours} hours on productive tasks (like GitHub and StackOverflow) this week. Keep up this strict discipline to build outstanding work.`;
    } else if (focusScore >= 45) {
      aiSuggestions = `Good effort this week. Your focus score is moderate at ${focusScore}%. While you spent ${prodHours} hours focused, you also spent ${unprodHours} hours on unproductive sites. Consider enabling "Strict Block Mode" during mornings on ${leastProdDay === "None" ? "unfocused days" : leastProdDay} to boost your productivity.`;
    } else {
      aiSuggestions = `Attention required. Your focus score is currently low at ${focusScore}%. Distractions took up ${unprodHours} hours of your browser time. We recommend adding distracting sites to your blocked domains list and launching a 25-minute Pomodoro focus block today to build up focus momentum.`;
    }

    res.json({
      dailyAnalytics: Object.entries(dailyAnalytics).map(([day, data]) => ({ day, ...data })),
      totalDuration,
      totalProd,
      totalUnprod,
      focusScore,
      mostProductiveDay: mostProdDay,
      leastProductiveDay: leastProdDay,
      aiSuggestions
    });
  } catch (error) {
    console.error("[Weekly Report Controller] Report Error:", error.message);
    res.status(500).json({ error: "Failed to generate weekly reports" });
  }
};

module.exports = { syncActivities, getActivities, getActivityStats, getWeeklyReport };
