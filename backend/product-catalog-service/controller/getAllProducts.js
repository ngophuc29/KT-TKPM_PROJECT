// controllers/getAllProducts.js
const ProductModel = require("../models/ProductModel");


async function getAllProducts(req, res) {
    try {
        const products = await ProductModel.find();
        res.status(200).json({ data: products });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi lấy danh sách sản phẩm", error });
    }
}

module.exports = getAllProducts;
