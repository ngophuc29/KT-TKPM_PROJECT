const NotificationModel = require("../models/NotificationModel");

async function sendNotification(req, res) {
  try {
    const { userId, orderId, orderStatus } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    // Xác định tiêu đề và nội dung thông báo dựa vào trạng thái đơn hàng
    let title, message;

    switch (orderStatus) {
      case "pending":
        title = "Đặt hàng thành công!";
        message = `Đơn hàng của bạn (#${orderId}) đã được đặt thành công. Chúng tôi sẽ sớm xác nhận và giao hàng!`;
        break;
      case "confirmed":
        title = "Đơn hàng đã được xác nhận!";
        message = `Đơn hàng của bạn (#${orderId}) đã được xác nhận và đang được chuẩn bị.`;
        break;
      case "shipping":
        title = "Đơn hàng đang được giao!";
        message = `Đơn hàng của bạn (#${orderId}) đang được vận chuyển đến địa chỉ của bạn.`;
        break;
      case "delivered":
        title = "Đơn hàng đã giao thành công!";
        message = `Đơn hàng của bạn (#${orderId}) đã được giao thành công. Cảm ơn bạn đã mua hàng!`;
        break;
      case "cancelled":
        title = "Đơn hàng đã bị hủy";
        message = `Đơn hàng của bạn (#${orderId}) đã bị hủy. Vui lòng liên hệ với chúng tôi nếu có thắc mắc.`;
        break;
      default:
        title = "Cập nhật đơn hàng";
        message = `Đơn hàng của bạn (#${orderId}) đã được cập nhật.`;
    }

    // Tạo thông báo mới
    const notification = new NotificationModel({
      userId,
      title,
      message,
      type: "order",
      orderId,
      orderStatus: orderStatus || "pending",
      status: "unread",
      isRead: false,
      platform: "web",
    });

    await notification.save();

    // Gửi thông báo real-time qua Socket.io (sử dụng biến global để truy cập io)
    global.io.to(userId).emit("notification", notification);

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = sendNotification;
