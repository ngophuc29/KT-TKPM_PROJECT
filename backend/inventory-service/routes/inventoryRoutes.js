const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");

// Statistics routes
router.get("/stats/general", inventoryController.getGeneralStats);
router.get("/stats/revenue", inventoryController.getRevenueStats);
router.get("/stats/top-selling", inventoryController.getTopSellingProducts);
router.get("/stats/inventory-by-category", inventoryController.getInventoryByCategory);

module.exports = router; 