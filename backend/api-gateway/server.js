require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const authMiddleware = require("./middlewares/authMiddleware");
const roleMiddleware = require("./middlewares/roleMiddleware");
const app = express();
const rateLimit = require('express-rate-limit');
const allowedOrigins = ["http://localhost:2000", "http://localhost:5173", "https://kt-tkpm-project.vercel.app", "https://kt-tkpm-project-kmr6.vercel.app"];


console.log("Allowed Origins:", allowedOrigins);
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
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
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);


// app.use((req, res, next) => {
//   console.log("Gateway Authorization:", req.headers.authorization);
//   next();
// });
// Cấu hình các service - sử dụng tên service từ docker-compose thay vì localhost
const services = {
  products: process.env.PRODUCTS || "http://localhost:4004",
  inventory: process.env.INVENTORY || "http://localhost:4000",
  cart: process.env.CART || "http://localhost:4005",
  notification: process.env.NOTIFICATION || "http://localhost:4001",
  orders: process.env.ORDERS || 'http://localhost:4009',
  payment: process.env.PAYMENT || "http://localhost:4545",
  auth: process.env.AUTH || "http://localhost:5000"
};

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 50, // tối đa 20 request mỗi phút cho mỗi IP
  message: { message: "Bạn gọi API quá nhanh, vui lòng thử lại sau!" }
});
// Proxy cho tất cả request đến API Gateway
app.use("/api/auth", authLimiter);
const productsLimiter = rateLimit({ windowMs: 60 * 1000, max: 50, message: { message: "Bạn gọi API quá nhanh, vui lòng thử lại sau!" } });
app.use("/api/products", productsLimiter);
app.use(
  "/api/auth",
  createProxyMiddleware({
    ws: true,
    target: services.auth,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
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
  // authMiddleware,
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
  // authMiddleware,
  // roleMiddleware("user"),
  createProxyMiddleware({
    ws: true,
    target: services.notification,
    changeOrigin: true,
    pathRewrite: { "^/api/notification": "" },
  })
);

app.use(
  "/api/orders",
  // authMiddleware,
  // roleMiddleware("admin"),
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
