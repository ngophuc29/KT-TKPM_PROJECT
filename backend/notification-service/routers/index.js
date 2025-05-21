const express = require("express");
const router = express.Router();
const sendNotification = require("../controllers/sendNotification");
const getUnreadCount = require("../controllers/getUnreadCount");
const markAsRead = require("../controllers/markAsRead");
const getNotifications = require("../controllers/getNotifications");
const sendOrderEmail = require("../controllers/sendOrderEmail");

// Route để gửi thông báo cho người dùng
router.post("/send-notification", sendNotification);

// Route để lấy số thông báo chưa đọc
router.get("/unread-count", getUnreadCount);

// Route để đánh dấu đã đọc tất cả thông báo
router.put("/mark-as-read", markAsRead);

// Route để lấy danh sách thông báo
router.get("/notifications", getNotifications);

// Route để gửi email xác nhận đơn hàng
router.post("/send-order-email", sendOrderEmail);

module.exports = router;
