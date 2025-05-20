require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const authMiddleware = require("./middlewares/authMiddleware");
const roleMiddleware = require("./middlewares/roleMiddleware");
const app = express();
const allowedOrigins = ["http://localhost:2000", "http://localhost:5173"];

console.log("Allowed Origins:", allowedOrigins);

// Cấu hình CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy does not allow this origin."));
      }
    },
    credentials: true,
  })
);



// Cấu hình các service
const services = {
  auth: "http://localhost:5000",
  products: "http://localhost:4004",
  inventory: "http://localhost:4000",
  cart: "http://localhost:4005",
  notification: "http://localhost:4001",
  orders: "http://localhost:4009",
  payment: "http://localhost:4545",
};
// Proxy cho tất cả request đến API Gateway
app.use(
  "/auth",
  createProxyMiddleware({
    ws: true,
    target: services.auth,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
    onProxyReq: (proxyReq, req, res) => {
      console.log("Proxying request:", req.method, req.url);
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
    }
  })
);


// Proxy các service còn lại
app.use(
  "/api/products",
  createProxyMiddleware({
    ws: true,
    target: services.products,
    changeOrigin: true,
    pathRewrite: { "^/api/products": "" },
  })
);

app.use(
  "/api/inventory",
  createProxyMiddleware({
    ws: true,
    target: services.inventory,
    changeOrigin: true,
    pathRewrite: { "^/api/inventory": "" },
  })
);

app.use(
  "/api/cart",
  authMiddleware,
  createProxyMiddleware({
    ws: true,
    target: services.cart,
    changeOrigin: true,
    pathRewrite: { "^/api/cart": "" },
  })
);

// Ví dụ chỉ admin mới được gọi notification
app.use(
  "/api/notification",
  authMiddleware,
  roleMiddleware("user"),
  createProxyMiddleware({
    ws: true,
    target: services.notification,
    changeOrigin: true,
    pathRewrite: { "^/api/notification": "" },
  })
);

app.use(
  "/api/orders",
  authMiddleware,
  roleMiddleware("admin"),
  createProxyMiddleware({
    ws: true,
    target: services.orders,
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "" },
  })
);

app.use(
  "/api/payment",
  createProxyMiddleware({
    ws: true,
    target: services.payment,
    changeOrigin: true,
    pathRewrite: { "^/api/payment": "" },
  })
);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`);
});
