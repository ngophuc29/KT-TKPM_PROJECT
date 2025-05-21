const NotificationModel = require("../models/NotificationModel");

async function markAsRead(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await NotificationModel.updateMany({ userId, status: "unread" }, { $set: { status: "read", isRead: true } });

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = markAsRead;
