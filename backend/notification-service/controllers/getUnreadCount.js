const NotificationModel = require("../models/NotificationModel");

async function getUnreadCount(req, res) {
  try {
    // Count all unread admin notifications without requiring userId
    const count = await NotificationModel.countDocuments({
      status: "unread",
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = getUnreadCount;
