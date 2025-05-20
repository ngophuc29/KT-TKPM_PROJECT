const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
 
const allowedOrigins = ["http://localhost:2000", "http://localhost:5173","https://kt-tkpm-project.vercel.app"];
 

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
  products: "https://kt-tkpm-project-product-catalog-service.onrender.com",
  inventory: "https://kt-tkpm-project-inventory-service.onrender.com",
  cart: "https://kt-tkpm-project-cart-service.onrender.com",
  notification: "https://kt-tkpm-project-notification-service.onrender.com",
  orders: 'https://kt-tkpm-project-order-service.onrender.com',
  payment: "https://kt-tkpm-project-payment-service.onrender.com",
  // api-getaway:'https://kt-tkpm-project-api-getaway.onrender.com'
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
