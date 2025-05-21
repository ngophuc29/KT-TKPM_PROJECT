import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUserId } from "../../utils/getUserId";
import authorizedAxiosInstance from "../../utils/authorizedAxios";

const ORDER_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/orders`;
const INVENTORY_API = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/inventory`;
const CART_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/cart`;

const CheckoutForm = ({ selectedItems, shippingMethod, setShippingMethod, finalTotal }) => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(true);

  // Load user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setLoading(false);
          return;
        }
        const response = await authorizedAxiosInstance.get("http://localhost:3000/auth/users");
        const userData = response.data;

        // Split fullName into firstName and lastName
        const nameParts = userData.fullName?.split(" ") || [];
        const lastName = nameParts.pop() || "";
        const firstName = nameParts.join(" ") || "";

        setFirstName(firstName);
        setLastName(lastName);
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleNotification = async (orderId) => {
    try {
      const userId = getUserId();

      // Gửi thông báo với dữ liệu thực từ đơn hàng
      const response = await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/send-notification`, {
        userId: userId, // User ID của khách hàng (nếu có)
        orderId: orderId,
        orderStatus: "pending",
      });

      console.log("Notification sent: ", response.data);

      // Thêm yêu cầu đặc biệt để đảm bảo admin nhận được thông báo
      // Gửi một thông báo riêng cho admin với ID cố định
      await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/send-notification`, {
        userId: "admin-dashboard-123", // Fixed admin ID
        orderId: orderId,
        orderStatus: "pending",
      });
    } catch (error) {
      console.log("Error sending notification: ", error);
    }
  };

  const handleOrderEmail = async (orderId) => {
    try {
      // Gửi email xác nhận đơn hàng
      await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/send-order-email`, {
        orderData: {
          orderNumber: orderId,
          customer: {
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone,
            address: address,
          },
          items: selectedItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: finalTotal,
          shipping: {
            method: shippingMethod,
            fee: shippingMethod === "standard" ? 30000 : 50000,
          },
          payment: {
            method: paymentMethod,
          },
        },
      });
      console.log("Order confirmation email sent");
    } catch (error) {
      console.error("Error sending order email:", error);
    }
  };

  const handleOrderSubmit = async () => {
    // Validate
    if (!firstName || !lastName || !address || !phone || !email) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Giỏ hàng trống.");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }

    const customer = { name: `${firstName} ${lastName}`, address, phone, email };
    const items = selectedItems.map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));
    const shipping = {
      method: shippingMethod,
      fee: shippingMethod === "standard" ? 30000 : 50000,
      status: "processing",
      trackingNumber: "",
    };
    const payment = { method: paymentMethod, status: "pending" };
    const notes = { customerNote, sellerNote: "" };

    try {
      // 1) Check tồn kho
      const idsParam = items.map((i) => i.productId).join(",");
      const { data: inv } = await axios.get(`${INVENTORY_API}/bulk/${idsParam}`);
      for (let it of items) {
        const stockItem = inv.find((x) => x.productId === it.productId);
        if (!stockItem || stockItem.stock < it.quantity) {
          toast.error(`Sản phẩm ${it.name} không đủ hàng`);
          return;
        }
      }

      // 2) Tạo order trước
      const createUrl =
        `${ORDER_API_URL}/create/${userId}` +
        `/${encodeURIComponent(JSON.stringify(customer))}` +
        `/${encodeURIComponent(JSON.stringify(items))}` +
        `/${encodeURIComponent(JSON.stringify(shipping))}` +
        `/${encodeURIComponent(JSON.stringify(payment))}` +
        `/${finalTotal}` +
        `/${encodeURIComponent(JSON.stringify(notes))}`;
      const orderResp = await axios.post(createUrl);
      const orderId = orderResp.data.order._id;

      // Gửi thông báo với orderId thực
      await handleNotification(orderId);

      // Gửi email xác nhận đơn hàng
      await handleOrderEmail(orderId, orderResp.data.order);
      console.log("Order email sent", orderResp.data.order);

      // 3) Nếu chọn bank (Momo) → gọi service payment qua params
      if (paymentMethod === "bank") {
        const params = {
          amount: finalTotal.toString(),
          orderInfo: `Thanh toán đơn ${orderId}`,
          orderId,
          requestId: orderId,
          extraData: "",
        };
        const payResp = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/payment/payment`, { params });
        if (payResp.data.payUrl) {
          localStorage.setItem("pendingOrderId", orderId);
          window.location.href = payResp.data.payUrl;
          return;
        } else {
          toast.error("Không thể tạo URL thanh toán");
          return;
        }
      }

      // 4) Nếu COD hoặc khác → hoàn tất, xóa cart
      toast.success("Đặt hàng thành công!");
      navigate("/home", { state: { order: orderResp.data.order } });
      await axios.delete(`${CART_API_URL}/clear/${userId}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error("Lỗi khi xử lý đơn hàng: " + msg);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

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
        <label style={{ display: "block", marginBottom: "5px" }}>Order Note (optional)</label>
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
