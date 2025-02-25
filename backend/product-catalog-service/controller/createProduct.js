const ProductModel = require("../models/ProductModel");

async function createProduct(req, res) {
  try {
    const newProduct = new ProductModel(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Thêm sản phẩm thành công!", product: newProduct });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo sản phẩm", error });
  }
}

module.exports = createProduct;
