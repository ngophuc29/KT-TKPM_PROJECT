const NotificationModel = require("../models/NotificationModel");

// Fixed admin ID - same as in the NotificationContext
const ADMIN_ID = "admin-dashboard-123";

async function sendNotification(req, res) {
  try {
    const { userId, orderId, orderStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    // Handle customer notification if userId is provided
    if (userId) {
      // Xác định tiêu đề và nội dung thông báo cho khách hàng
      let customerTitle, customerMessage;

      switch (orderStatus) {
        case "pending":
          customerTitle = "Đặt hàng thành công!";
          customerMessage = `Đơn hàng của bạn (#${orderId}) đã được đặt thành công. Chúng tôi sẽ sớm xác nhận và giao hàng!`;
          break;
        case "confirmed":
          customerTitle = "Đơn hàng đã được xác nhận!";
          customerMessage = `Đơn hàng của bạn (#${orderId}) đã được xác nhận và đang được chuẩn bị.`;
          break;
        case "shipping":
          customerTitle = "Đơn hàng đang được giao!";
          customerMessage = `Đơn hàng của bạn (#${orderId}) đang được vận chuyển đến địa chỉ của bạn.`;
          break;
        case "delivered":
          customerTitle = "Đơn hàng đã giao thành công!";
          customerMessage = `Đơn hàng của bạn (#${orderId}) đã được giao thành công. Cảm ơn bạn đã mua hàng!`;
          break;
        case "cancelled":
          customerTitle = "Đơn hàng đã bị hủy";
          customerMessage = `Đơn hàng của bạn (#${orderId}) đã bị hủy. Vui lòng liên hệ với chúng tôi nếu có thắc mắc.`;
          break;
        default:
          customerTitle = "Cập nhật đơn hàng";
          customerMessage = `Đơn hàng của bạn (#${orderId}) đã được cập nhật.`;
      }

      // Tạo thông báo cho khách hàng
      const customerNotification = new NotificationModel({
        userId,
        title: customerTitle,
        message: customerMessage,
        type: "order",
        orderId,
        orderStatus: orderStatus || "pending",
        status: "unread",
        isRead: false,
        platform: "web",
      });

      await customerNotification.save();

      // Gửi thông báo real-time cho khách hàng
      global.io.to(userId).emit("notification", customerNotification);
    }

    // Tạo thông báo cho admin (với ADMIN_ID cố định)
    const adminTitle = "Đơn hàng mới!";
    const adminMessage = `Có đơn hàng mới (#${orderId}) vừa được đặt thành công.`;

    const adminNotification = new NotificationModel({
      userId: ADMIN_ID, // Set fixed admin ID
      title: adminTitle,
      message: adminMessage,
      type: "admin_order",
      orderId,
      orderStatus: orderStatus || "pending",
      status: "unread",
      isRead: false,
      platform: "admin",
    });

    await adminNotification.save();

    console.log(`Sending admin notification for order ${orderId} to all admin channels`);

    try {
      // 1. Send to specific admin
      global.io.to(ADMIN_ID).emit("admin_notification", adminNotification);
      console.log(`Emitted to admin ID: ${ADMIN_ID}`);

      // 2. Send to admin room
      global.io.to("admin").emit("admin_notification", adminNotification);
      console.log("Emitted to 'admin' room");

      // 3. Broadcast to everyone as fallback
      global.io.emit("admin_notification", adminNotification);
      console.log("Broadcast to all clients");
    } catch (socketError) {
      console.error("Error emitting socket notification:", socketError);
    }

    res.status(201).json({ success: true, message: "Notifications sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = sendNotification;
