const express = require("express");
const router = express.Router();
const { syncActivities, getActivities, getActivityStats, getWeeklyReport } = require("../controllers/actController");
const { protect } = require("../middleware/auth");

// Protected Activity Endpoints
router.use(protect);

router.post("/", syncActivities);
router.get("/", getActivities);
router.get("/stats", getActivityStats);
router.get("/report/weekly", getWeeklyReport);

module.exports = router;
