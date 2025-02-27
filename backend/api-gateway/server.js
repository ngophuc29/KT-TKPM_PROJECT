const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// Cấu hình các service
const services = {
  products: "http://localhost:4004",
};

// Proxy cho tất cả request đến API Gateway
Object.keys(services).forEach((route) => {
  app.use(
    `/api/${route}`,
    createProxyMiddleware({
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
