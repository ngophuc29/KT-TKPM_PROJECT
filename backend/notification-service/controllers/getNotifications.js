const NotificationModel = require("../models/NotificationModel");

async function getNotifications(req, res) {
  try {
    const { userId } = req.query;

    let query = {};

    // Nếu có userId, chỉ lấy thông báo của user đó
    if (userId) {
      query.userId = userId;
    }

    const notifications = await NotificationModel.find(query).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = getNotifications;
