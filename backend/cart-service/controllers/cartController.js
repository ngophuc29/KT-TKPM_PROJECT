const Cart = require("../models/Cart");
const axios = require("axios");
const redisClient = require("../utils/redisClient");

// Get base API URL from environment variable or fallback to localhost for development
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "http://api-gateway:3000/api" : "http://localhost:3000/api";

const getCacheKey = (userId) => `cart:${userId}`;

// Hàm tạo lại cache sau khi cập nhật
const updateCartCache = async (userId, cart) => {
  try {
    const cacheKey = getCacheKey(userId);
    await redisClient.setEx(cacheKey, 600, JSON.stringify(cart));
  } catch (error) {
    console.error("Redis cache update failed:", error);
    // Continue without caching if Redis fails
  }
};

// Hàm lấy cart từ cache hoặc database
const getCartFromCacheOrDB = async (userId) => {
  try {
    const cacheKey = getCacheKey(userId);
    const cachedCart = await redisClient.get(cacheKey);
    if (cachedCart) {
      return JSON.parse(cachedCart);
    }
  } catch (error) {
    console.error("Redis cache retrieval failed:", error);
    // Continue to DB if Redis fails
  }

  const cart = await Cart.findOne({ userId });
  if (cart) {
    await updateCartCache(userId, cart);
  }
  return cart;
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    let { userId, productId, quantity } = req.params;
    quantity = parseInt(quantity, 10);
    if (!userId || !productId || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const stockResponse = await axios.get(`${API_BASE_URL}/inventory/${productId}`);
    const availableStock = stockResponse.data.stock;

    const allCarts = await Cart.find({});
    let totalInCarts = 0;
    allCarts.forEach((cart) => {
      cart.items.forEach((item) => {
        if (item.productId.toString() === productId) {
          totalInCarts += item.quantity;
        }
      });
    });

    if (totalInCarts + quantity > availableStock) {
      return res.status(400).json({
        message: `Không thể thêm sản phẩm. Chỉ còn ${availableStock - totalInCarts} sản phẩm có sẵn.`,
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await updateCartCache(userId, cart);

    res.json({ message: "Thêm vào giỏ hàng thành công", cart });
  } catch (error) {
    console.error("Cart add error:", error);
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ", error: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
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

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });
    }

    const stockResponse = await axios.get(`${API_BASE_URL}/inventory/${productId}`);
    const availableStock = stockResponse.data.stock;

    const otherCarts = await Cart.find({ userId: { $ne: userId } });
    let totalInOtherCarts = 0;
    otherCarts.forEach((cart) => {
      cart.items.forEach((item) => {
        if (item.productId.toString() === productId) {
          totalInOtherCarts += item.quantity;
        }
      });
    });

    if (totalInOtherCarts + quantity > availableStock) {
      return res.status(400).json({
        message: `Không thể cập nhật. Chỉ còn ${availableStock - totalInOtherCarts} sản phẩm có sẵn.`,
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await updateCartCache(userId, cart);

    res.json({ message: "Cập nhật giỏ hàng thành công", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng", error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    const item = cart.items.find((item) => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();
    await updateCartCache(userId, cart);

    res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa khỏi giỏ hàng", error: error.message });
  }
};

// Lấy giỏ hàng
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "UserId không hợp lệ" });

    const cart = await getCartFromCacheOrDB(userId);
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Lỗi khi lấy giỏ hàng", error: error.message });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "UserId không hợp lệ" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    cart.items = [];
    await cart.save();
    await updateCartCache(userId, cart);

    res.json({ message: "Giỏ hàng đã được xóa sạch", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa giỏ hàng", error: error.message });
  }
};

// Kiểm tra tồn kho giỏ hàng
exports.checkCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    const productIds = cart.items.map((item) => item.productId);
    const inventoryRes = await axios.get(`${API_BASE_URL}/inventory/bulk/${productIds.join(",")}`);
    const inventoryData = inventoryRes.data;

    const result = cart.items.map((item) => {
      const invItem = inventoryData.find((i) => i.productId.toString() === item.productId.toString());
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
