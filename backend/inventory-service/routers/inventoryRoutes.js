const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");

// ✅ API lấy danh sách sản phẩm từ Product Service
router.get("/products", inventoryController.getAllProducts);

// ✅ API lấy danh sách tồn kho từ Product Service
router.get("/", inventoryController.getInventory);

// ✅ API kiểm tra tồn kho theo productId
router.get("/:productId", inventoryController.getProductStock);

// ✅ API lấy stock theo danh sách productIds
router.post("/bulk", inventoryController.getStockByProductIds);

// ✅ API thống kê tổng tồn kho
router.get("/stats", inventoryController.getStockStats);
// ✅ API nhập hàng vào kho
router.post("/import", inventoryController.importStock);

// ✅ **API đồng bộ Inventory với Product Service**
router.post("/syncInventory", inventoryController.syncInventory);


 
module.exports = router
