const NotificationModel = require("../models/NotificationModel");

async function markAsRead(req, res) {
  try {
    // Mark all admin notifications as read without requiring userId
    await NotificationModel.updateMany(
      {
        status: "unread",
      },
      { $set: { status: "read", isRead: true } }
    );

    res.json({
      success: true,
      message: "All admin notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = markAsRead;
