const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

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

app.use(express.json());

// Cấu hình các service - sử dụng tên service từ docker-compose thay vì localhost
const services = {
  products: process.env.NODE_ENV === "production" ? "http://product-catalog-service:4004" : "http://localhost:4004",
  inventory: process.env.NODE_ENV === "production" ? "http://inventory-service:4000" : "http://localhost:4000",
  cart: process.env.NODE_ENV === "production" ? "http://cart-service:4005" : "http://localhost:4005",
  notification: process.env.NODE_ENV === "production" ? "http://notification-service:4001" : "http://localhost:4001",
  orders: process.env.NODE_ENV === "production" ? "http://order-service:4009" : "http://localhost:4009",
  payment: "http://localhost:4545",
};

// Proxy cho tất cả request đến API Gateway
Object.keys(services).forEach((route) => {
  console.log(`Forwarding /api/${route} to ${services[route]}`);
  app.use(
    `/api/${route}`,
    createProxyMiddleware({
      ws: true,
      target: services[route],
      changeOrigin: true,
      pathRewrite: { [`^/api/${route}`]: "" },
    })
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`);
});
