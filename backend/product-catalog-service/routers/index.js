const express = require("express");
const createProduct = require("../controller/createProduct");
const getProductNew = require("../controller/filterProduct/getProductNew");
const getProductBrand = require("../controller/filterProduct/getProductBrand");

const router = express.Router();

// Create product api
router.post("/create-product", createProduct);

// Get new products api
router.get("/products-new", getProductNew);

// Get products by brand api
router.get("/products-brand/:brand", getProductBrand);

module.exports = router;
