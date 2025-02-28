const ProductModel = require("../models/ProductModel");

async function updateProduct(req, res) {
    try {
        const productId = req.params.id;
        const updateData = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "❌ Dữ liệu cập nhật không hợp lệ" });
        }

        console.log("🔄 Updating Product ID:", productId);
        console.log("📦 Update Data:", updateData);

        // Chỉ cập nhật trường cần thiết
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "❌ Không tìm thấy sản phẩm" });
        }

        res.status(200).json({
            message: "✅ Cập nhật sản phẩm thành công!",
            data: updatedProduct
        });
    } catch (error) {
        console.error("🚨 Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "❌ Lỗi server khi cập nhật sản phẩm", error: error.message });
    }
}

module.exports = updateProduct;
