const { sendOrderConfirmationEmail } = require("../utils/emailService");

async function sendOrderEmail(req, res) {
  try {
    const { orderData } = req.body;
    console.log("Received order data:", orderData);

    if (!orderData) {
      return res.status(400).json({ error: "Order data is required" });
    }

    // Kiểm tra dữ liệu cần thiết
    if (!orderData.customer || !orderData.customer.email) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    // Gửi email xác nhận đơn hàng
    const emailResult = await sendOrderConfirmationEmail(orderData);

    if (!emailResult.success) {
      return res.status(500).json({
        error: "Failed to send order confirmation email",
        details: emailResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order confirmation email sent successfully",
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Error sending order email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = sendOrderEmail;
