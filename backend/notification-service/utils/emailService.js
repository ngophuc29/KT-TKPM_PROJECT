const nodemailer = require('nodemailer');

// Tạo transporter để gửi email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Format tiền tệ VND
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Hàm gửi email đơn hàng
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Destructure dữ liệu đơn hàng
    const { orderNumber, customer, items, totalAmount, shipping, payment } = orderData;

    // Tạo HTML cho danh sách sản phẩm
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    // Nội dung email
    const mailOptions = {
      from: `"Tech Store" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: `Xác nhận đơn hàng #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C94D3F;">XÁC NHẬN ĐƠN HÀNG</h1>
            <p>Cảm ơn bạn đã đặt hàng tại Tech Store!</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Thông tin đơn hàng #${orderNumber}</h2>
            <p><strong>Họ tên:</strong> ${customer.name}</p>
            <p><strong>Địa chỉ:</strong> ${customer.address}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Số điện thoại:</strong> ${customer.phone}</p>
            <p><strong>Phương thức thanh toán:</strong> ${payment.method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
            <p><strong>Phương thức vận chuyển:</strong> ${shipping.method === 'standard' ? 'Tiêu chuẩn' : 'Nhanh'}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Chi tiết đơn hàng</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                  <th style="padding: 10px; text-align: center;">Số lượng</th>
                  <th style="padding: 10px; text-align: right;">Đơn giá</th>
                  <th style="padding: 10px; text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Phí vận chuyển:</strong></td>
                  <td style="padding: 10px; text-align: right;">${formatCurrency(shipping.fee)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tổng cộng:</strong></td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #C94D3F;">${formatCurrency(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email support@techstore.com hoặc số điện thoại 1900 1234.</p>
            <p>© 2023 Tech Store. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail
};