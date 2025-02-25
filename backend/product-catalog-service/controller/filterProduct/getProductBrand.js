const ProductModel = require("../../models/ProductModel");

async function getProductBrand(req, res) {
  try {
    const products = await ProductModel.find({ brand: req.params.brand });
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this brand" });
    }
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy sản phẩm mới", error });
  }
}

module.exports = getProductBrand;