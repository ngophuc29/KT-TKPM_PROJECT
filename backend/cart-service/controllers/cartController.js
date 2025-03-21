const Cart = require("../models/Cart");
const axios = require("axios");

// Thêm sản phẩm vào giỏ hàng
// Route ví dụ: POST /cart/add/:userId/:productId/:quantity
exports.addToCart = async (req, res) => {
    try {
        let { userId, productId, quantity } = req.params;
        quantity = parseInt(quantity, 10);
        if (!userId || !productId || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        // Kiểm tra tồn kho qua Inventory Service
        const stockResponse = await axios.get(`http://localhost:3000/api/inventory/${productId}`);
        const availableStock = stockResponse.data.stock;
        if (availableStock < quantity) {
            return res.status(400).json({ message: "Không đủ hàng trong kho" });
        }

        // Tính tổng số lượng sản phẩm này trong tất cả giỏ hàng
        const allCarts = await Cart.find({});
        let totalInCarts = 0;
        allCarts.forEach(cart => {
            cart.items.forEach(item => {
                if (item.productId.toString() === productId) {
                    totalInCarts += item.quantity;
                }
            });
        });
        // Nếu tổng số lượng sau khi thêm vượt quá tồn kho, báo lỗi
        if (totalInCarts + quantity > availableStock) {
            return res.status(400).json({
                message: `Không thể thêm sản phẩm. Chỉ còn ${availableStock - totalInCarts} sản phẩm có sẵn.`
            });
        }

        // Reserve số lượng cần thêm qua URL parameters
        const reserveResponse = await axios.post(`http://localhost:3000/api/inventory/reserve/${productId}/${quantity}`);
        if (!reserveResponse.data.success) {
            return res.status(400).json({ message: "Không thể đặt chỗ sản phẩm" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
        res.json({ message: "Thêm vào giỏ hàng thành công", cart });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi thêm vào giỏ", error: error.message });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
// Route ví dụ: PUT /cart/update/:userId/:productId/:quantity
exports.updateCartItem = async (req, res) => {
    try {
        let { userId, productId, quantity } = req.params;
        quantity = parseInt(quantity, 10);
        if (!userId || !productId || isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });
        }

        // Kiểm tra tồn kho trước khi cập nhật
        const stockResponse = await axios.get(`http://localhost:3000/api/inventory/${productId}`);
        const availableStock = stockResponse.data.stock;

        // Tính tổng số lượng của sản phẩm này trong các giỏ hàng của các user khác
        const otherCarts = await Cart.find({ userId: { $ne: userId } });
        let totalInOtherCarts = 0;
        otherCarts.forEach(cart => {
            cart.items.forEach(item => {
                if (item.productId.toString() === productId) {
                    totalInOtherCarts += item.quantity;
                }
            });
        });

        // Kiểm tra nếu tổng sau khi cập nhật vượt quá tồn kho
        if (totalInOtherCarts + quantity > availableStock) {
            return res.status(400).json({
                message: `Không thể cập nhật. Chỉ còn ${availableStock - totalInOtherCarts} sản phẩm có sẵn.`
            });
        }

        // Xác định sự khác biệt giữa số lượng mới và cũ
        const currentQuantity = cart.items[itemIndex].quantity;
        const diff = quantity - currentQuantity;
        if (diff > 0) {
            // Reserve thêm diff qua URL parameters
            const reserveResponse = await axios.post(`http://localhost:3000/api/inventory/reserve/${productId}/${diff}`);
            if (!reserveResponse.data.success) {
                return res.status(400).json({ message: "Không thể đặt chỗ thêm sản phẩm" });
            }
        } else if (diff < 0) {
            // Release số lượng chênh lệch qua URL parameters
            await axios.post(`http://localhost:3000/api/inventory/release/${productId}/${-diff}`);
        }

        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }
        await cart.save();
        res.json({ message: "Cập nhật giỏ hàng thành công", cart });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng", error: error.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
// Route ví dụ: DELETE /cart/remove/:userId/:productId
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        if (!userId || !productId) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }
        // Tìm số lượng của sản phẩm cần xóa
        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });
        }
        // Release số lượng đã được reserve qua URL parameters
        try {
            await axios.post(`http://localhost:3000/api/inventory/release/${productId}/${item.quantity}`);
        } catch (releaseError) {
            console.error("Lỗi khi giải phóng hàng:", releaseError.message);
            return res.status(500).json({ message: "Lỗi khi giải phóng hàng khỏi giỏ", error: releaseError.message });
        }
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();
        res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công", cart });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa khỏi giỏ hàng", error: error.message });
    }
};

// Lấy giỏ hàng của user
// Route ví dụ: GET /cart/:userId
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "UserId không hợp lệ" });
        }
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy giỏ hàng", error: error.message });
    }
};

// Xóa sạch giỏ hàng của user
// Route ví dụ: DELETE /cart/clear/:userId
// exports.clearCart = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         if (!userId) {
//             return res.status(400).json({ message: "UserId không hợp lệ" });
//         }
//         const cart = await Cart.findOne({ userId });
//         if (!cart) {
//             return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
//         }
//         // Release reserved quantity cho từng mặt hàng qua URL parameters
//         const releasePromises = cart.items.map(item =>
//             axios.post(`http://localhost:3000/api/inventory/release/${item.productId.toString()}/${item.quantity}`)
//                 .catch(err => {
//                     console.error("Lỗi khi giải phóng sản phẩm", item.productId, err.message);
//                     return null;
//                 })
//         );
//         await Promise.all(releasePromises);
//         cart.items = [];
//         await cart.save();
//         res.json({ message: "Giỏ hàng đã được xóa sạch", cart });
//     } catch (error) {
//         res.status(500).json({ message: "Lỗi khi xóa giỏ hàng", error: error.message });
//     }
// };
// Xóa sạch giỏ hàng của user
exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "UserId không hợp lệ" });
        }
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }
        // Loại bỏ bước giải phóng reserved vì đã được xử lý ở confirmOrder
        cart.items = [];
        await cart.save();
        res.json({ message: "Giỏ hàng đã được xóa sạch", cart });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa giỏ hàng", error: error.message });
    }
};

// Kiểm tra giỏ hàng: so sánh số lượng trong giỏ với tồn kho thực tế
// Route ví dụ: GET /cart/check/:userId
exports.checkCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }
        const productIds = cart.items.map(item => item.productId);
        // Gọi Inventory API bulk với params
        const inventoryRes = await axios.get(`http://localhost:3000/api/inventory/bulk/${productIds.join(',')}`);
        const inventoryData = inventoryRes.data;
        const result = cart.items.map(item => {
            const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
            return {
                productId: item.productId,
                requested: item.quantity,
                available: invItem ? invItem.stock : 0,
                isAvailable: invItem ? invItem.stock >= item.quantity : false,
            };
        });
        res.json({ result });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi kiểm tra giỏ hàng", error: error.message });
    }
};

