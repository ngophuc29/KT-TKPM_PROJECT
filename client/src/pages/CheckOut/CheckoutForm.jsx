import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ORDER_API_URL = "http://localhost:3000/api/orders";
// Giả sử INVENTORY_API và CART_API_URL đã được định nghĩa đúng URL của Inventory và Cart API
const INVENTORY_API = "http://localhost:3000/api/inventory";
const CART_API_URL = "http://localhost:3000/api/cart";
 

const CheckoutForm = ({ selectedItems, shippingMethod, setShippingMethod, subtotal, finalTotal }) => {
  const navigate = useNavigate();

  // State cho thông tin khách hàng
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerNote, setCustomerNote] = useState("");

  const handleOrderSubmit = async () => {
    // Validate thông tin khách hàng và giỏ hàng
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !address.trim() ||
      !phone.trim() ||
      !email.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Giỏ hàng trống.");
      return;
    }

    // Tạo đối tượng userId và customer
    const userId = "64e65e8d3d5e2b0c8a3e9f12"; // Fake userId; thay đổi theo thực tế nếu cần
    const customer = {
      name: `${firstName} ${lastName}`,
      address,
      phone,
      email,
    };

    // Tạo danh sách items cho đơn hàng
    const items = selectedItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // Tạo đối tượng shipping, payment và notes
    const shipping = {
      method: shippingMethod,
      fee: shippingMethod === "standard" ? 30000 : 50000,
      status: "processing",
      trackingNumber: "",
    };
    const payment = {
      method: paymentMethod,
      status: "pending",
    };
    const notes = {
      customerNote,
      sellerNote: "",
    };

    // --- Gọi API bulk để lấy thông tin tồn kho ---
    try {
      const productIds = items.map(item => item.productId);
      const productIdsParam = productIds.join(',');
      const { data: inventoryData } = await axios.get(`${INVENTORY_API}/bulk/${productIdsParam}`);

      if (!inventoryData || inventoryData.length === 0) {
        toast.error("Không tìm thấy sản phẩm trong kho");
        return;
      }

      // Kiểm tra tồn kho từng sản phẩm
      for (let item of items) {
        const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
        if (!invItem || invItem.stock < item.quantity) {
          toast.error(`Sản phẩm ${item.name} không đủ hàng`);
          return;
        }
      }

      // Xây dựng URL với dữ liệu được chuyển đổi qua params
      const url = `${ORDER_API_URL}/create/${userId}/${encodeURIComponent(JSON.stringify(customer))}/${encodeURIComponent(JSON.stringify(items))}/${encodeURIComponent(JSON.stringify(shipping))}/${encodeURIComponent(JSON.stringify(payment))}/${finalTotal}/${encodeURIComponent(JSON.stringify(notes))}`;
      toast.success("Đặt hàng thành công!");
      if (paymentMethod === "bank") {
        try {
          // Tạo đơn hàng trước với trạng thái pending
          const orderResponse = await axios.post(url);
          const orderId = orderResponse.data.order._id; // Lấy orderId từ response của order service
          
          // Gọi payment service để lấy payment URL
          const paymentResponse = await axios.post(`http://localhost:4545/payment`, {
            amount: finalTotal.toString(),
            orderInfo: `Thanh toan don hang cho ${customer.name}`,
            // redirectUrl: window.location.origin + "/payment-return",
            // ipnUrl: window.location.origin + "/payment-callback",
            extraData: "",
            orderId: orderId,
            requestId: orderId,
            partnerCode: "MOMO",
            requestType: "payWithMethod"
          });

          if (paymentResponse.data && paymentResponse.data.payUrl) {
            // Lưu orderId để check khi redirect về
            localStorage.setItem('pendingOrderId', orderId);
            
            // Chuyển hướng người dùng đến trang thanh toán
            window.location.href = paymentResponse.data.payUrl;
          } else {
            toast.error("Không thể tạo URL thanh toán");
          }
        } catch (error) {
          toast.error("Lỗi khi tạo thanh toán: " + error.message);
          console.error("Lỗi khi tạo thanh toán:", error);
        }
      } else {
        // Xử lý đơn hàng bình thường cho các phương thức thanh toán khác
        const response = await axios.post(url);
        toast.success("Đặt hàng thành công!");
        navigate("/home", { state: { order: response.data.order } });

        // Xóa giỏ hàng của user sau khi đặt hàng thành công
        await axios.delete(`${CART_API_URL}/clear/${userId}`);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xử lý đơn hàng: " + errMsg);
      console.error("Lỗi khi xử lý đơn hàng:", error.message);
    }
  };

 
  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "565px",
        gap: "26px",
        color: "#C94D3F",
        fontWeight: "600",
        fontSize: "13px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2 style={{ color: "#000", fontSize: "18px" }}>Shipping Address</h2>

      {/* Email */}
      <div>
        <label htmlFor="email" style={{ lineHeight: "2.1" }}>
          Email Address <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Email Address"
        />
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="first-name" style={{ lineHeight: "2.1" }}>
          First Name <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="first-name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="First Name"
        />
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="last-name" style={{ lineHeight: "2.1" }}>
          Last Name <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="last-name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Last Name"
        />
      </div>

      {/* Street Address */}
      <div>
        <label htmlFor="address" style={{ lineHeight: "2.1" }}>
          Street Address <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Street Address"
        />
        <input
          type="text"
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
            marginTop: "11px",
          }}
          placeholder="Additional Street Address"
          aria-label="Additional Street Address"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" style={{ lineHeight: "2.1" }}>
          Phone Number <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Phone Number"
        />
      </div>

      <h2 style={{ color: "#000", fontSize: "18px" }}>Shipping & Payment</h2>

      {/* Shipping Method */}
      <div style={{ marginBottom: "11px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Shipping Method <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <select
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
        >
          <option value="standard">Standard (30,000 VND)</option>
          <option value="express">Express (50,000 VND)</option>
        </select>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: "11px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Payment Method <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
        >
          <option value="cod">Cash on Delivery</option>
          
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Order Note */}
      <div>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Order Note (optional)
        </label>
        <textarea
          id="customerNote"
          name="customerNote"
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          placeholder="Your note..."
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            width: "100%",
            height: "80px",
          }}
        ></textarea>
      </div>

      {/* Confirm Order Button */}
      <button
        type="button"
        onClick={handleOrderSubmit}
        style={{
          backgroundColor: "#C94D3F",
          color: "#FFF",
          borderRadius: "4px",
          border: "none",
          height: "50px",
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Confirm Order
      </button>
    </form>
  );
};

export default CheckoutForm;
