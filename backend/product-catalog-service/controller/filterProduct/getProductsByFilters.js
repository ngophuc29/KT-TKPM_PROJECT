const ProductModel = require("../../models/ProductModel");

async function getProductsByFilters(req, res) {
  try {
    const { name, category, priceRange } = req.query;
    let priceBounds = [];

    if (priceRange) {
      priceBounds = priceRange.split("-").map((price) => parseFloat(price.replace(/[^0-9.-]+/g, "")));
    }

    const query = {
      ...(category && { category }),
      ...(priceRange && { price: { $gte: priceBounds[0], $lte: priceBounds[1] || Infinity } }),
    };

    // Trong hàm getProductsByFilters, cập nhật cách xử lý tìm kiếm theo tên
    if (name) {
      // Sử dụng RegExp để tìm kiếm sản phẩm có tên chứa từ khóa (không phân biệt hoa thường)
      query.name = new RegExp(name, "i");
    }

    const products = await ProductModel.find(query);
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy danh sách sản phẩm", error });
  }
}

module.exports = getProductsByFilters;
