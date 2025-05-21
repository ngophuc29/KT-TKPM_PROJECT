const NotificationModel = require("../models/NotificationModel");

async function getUnreadCount(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const count = await NotificationModel.countDocuments({
      userId,
      status: "unread",
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = getUnreadCount;
