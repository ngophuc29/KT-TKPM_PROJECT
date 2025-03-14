const Inventory = require("../models/InventoryModels");
const axios = require("axios");

// URL của Product Service (đổi nếu cần)
// const PRODUCT_SERVICE_URL = "http://localhost:4004/api/products";
// const PRODUCT_SERVICE_URLImport = "http://localhost:4004/api/product";

const PRODUCT_SERVICE_URL = "http://localhost:3000/api/products/products";
const PRODUCT_SERVICE_URLImport = "http://localhost:3000/api/products/product";

const LOW_STOCK_THRESHOLD = 5; // Ngưỡng cảnh báo tồn kho thấp

// ------------------------------
// Hàm helper dùng để lấy dữ liệu sản phẩm từ Product Service
// ------------------------------
const fetchProductsData = async () => {
    const response = await axios.get(PRODUCT_SERVICE_URL);
    const products = response.data.data;
    if (!Array.isArray(products)) {
        throw new Error("Dữ liệu không hợp lệ từ Product Service  ");
    }
    return products;
};

// ------------------------------
// 1️⃣ API lấy toàn bộ sản phẩm từ Product Service (để kiểm tra stock)
// ------------------------------
exports.getAllProducts = async (req, res) => {
    try {
        const products = await fetchProductsData();
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách sản phẩm",
            error: error.message,
        });
    }
};

// ------------------------------
// 2️⃣ API lấy danh sách tồn kho từ Product Service
//     Fallback: nếu lỗi, lấy dữ liệu từ Inventory Model
// ------------------------------
exports.getInventory = async (req, res) => {
    try {
        const products = await fetchProductsData();
        const inventoryWithWarning = products.map((product) => ({
            productId: product._id,
            name: product.name,
            stock: product.stock,
            lowStock: product.stock <= LOW_STOCK_THRESHOLD,
           
        }));
        res.json(inventoryWithWarning);
    } catch (error) {
        console.error("Lỗi khi lấy tồn kho từ Product Service:", error.message);
        // Fallback: lấy từ Inventory Model
        try {
            const inventoryData = await Inventory.find({});
            if (!inventoryData || inventoryData.length === 0) {
                return res.status(500).json({
                    message: "Không có dữ liệu tồn kho từ Inventory Model",
                    error: error.message,
                });
            }
            const fallbackData = inventoryData.map((item) => ({
                productId: item.productId,
                name: item.name,
                stock: item.quantity,
                lowStock: item.quantity <= LOW_STOCK_THRESHOLD,
            }));
            res.json(fallbackData);
        } catch (fallbackError) {
            res.status(500).json({
                message: "Lỗi khi lấy tồn kho từ Inventory Model",
                error: fallbackError.message,
            });
        }
    }
};

// ------------------------------
// 3️⃣ API lấy stock theo danh sách productId
//     Fallback: nếu lỗi, lấy dữ liệu từ Inventory Model
// ------------------------------
// exports.getStockByProductIds = async (req, res) => {
//     try {
//         const { productIds } = req.body;
//         if (!Array.isArray(productIds)) {
//             return res.status(400).json({ message: "Danh sách productIds không hợp lệ" });
//         }
//         const products = await fetchProductsData();
//         const filtered = products.filter((product) =>
//             productIds.includes(product._id)
//         );
//         res.json(filtered.map((p) => ({ productId: p._id, stock: p.stock })));
//     } catch (error) {
//         console.error("Lỗi khi lấy tồn kho theo danh sách từ Product Service:", error.message);
//         // Fallback: lấy từ Inventory Model
//         try {
//             const inventoryData = await Inventory.find({
//                 productId: { $in: req.body.productIds },
//             });
//             res.json(inventoryData.map((item) => ({
//                 productId: item.productId,
//                 stock: item.quantity,
//             })));
//         } catch (fallbackError) {
//             res.status(500).json({
//                 message: "Lỗi khi lấy tồn kho theo danh sách từ Inventory Model",
//                 error: fallbackError.message,
//             });
//         }
//     }
// };
exports.getStockByProductIds = async (req, res) => {
    try {
        // Lấy productIds từ params và chuyển thành mảng
        const { productIds } = req.params;
        const productIdsArray = productIds ? productIds.split(',') : [];
        if (!Array.isArray(productIdsArray) || productIdsArray.length === 0) {
            return res.status(400).json({ message: "Danh sách productIds không hợp lệ" });
        }
        const products = await fetchProductsData();
        const filtered = products.filter((product) =>
            productIdsArray.includes(product._id)
        );
        res.json(filtered.map((p) => ({ productId: p._id, stock: p.stock })));
    } catch (error) {
        console.error("Lỗi khi lấy tồn kho theo danh sách từ Product Service:", error.message);
        // Fallback: lấy từ Inventory Model
        try {
            const productIdsArray = req.params.productIds ? req.params.productIds.split(',') : [];
            const inventoryData = await Inventory.find({
                productId: { $in: productIdsArray },
            });
            res.json(inventoryData.map((item) => ({
                productId: item.productId,
                stock: item.quantity,
            })));
        } catch (fallbackError) {
            res.status(500).json({
                message: "Lỗi khi lấy tồn kho theo danh sách từ Inventory Model",
                error: fallbackError.message,
            });
        }
    }
};

// ------------------------------
// 4️⃣ API kiểm tra sản phẩm còn hàng không (truy vấn Product Service)
//     Fallback: nếu lỗi, tìm trong Inventory Model
// ------------------------------
exports.getProductStock = async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE_URLImport}/${req.params.productId}`);
        const product = response.data.data;
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        res.json({ inStock: product.stock > 0, stock: product.stock });
    } catch (error) {
        console.error("Lỗi khi kiểm tra tồn kho từ Product Service:", error.message);
        // Fallback: lấy từ Inventory Model
        try {
            const inventoryData = await Inventory.findOne({ productId: req.params.productId });
            if (!inventoryData) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại trong Inventory Model" });
            }
            res.json({ inStock: inventoryData.quantity > 0, stock: inventoryData.quantity });
        } catch (fallbackError) {
            res.status(500).json({
                message: "Lỗi khi kiểm tra tồn kho từ Inventory Model",
                error: fallbackError.message,
            });
        }
    }
};

// ------------------------------
// 5️⃣ API thống kê tổng số lượng hàng tồn kho từ Product Service
//     Fallback: nếu lỗi, tính từ dữ liệu trong Inventory Model
// ------------------------------
exports.getStockStats = async (req, res) => {
    try {
        const products = await fetchProductsData();
        const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
        res.json({ totalStock });
    } catch (error) {
        console.error("Lỗi khi thống kê tồn kho từ Product Service:", error.message);
        // Fallback: tính tổng từ Inventory Model
        try {
            const inventoryData = await Inventory.find({});
            const totalStock = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
            res.json({ totalStock });
        } catch (fallbackError) {
            res.status(500).json({
                message: "Lỗi khi thống kê tồn kho từ Inventory Model",
                error: fallbackError.message,
            });
        }
    }
};

// ------------------------------
// 6️⃣ API nhập hàng - tăng stock trong Product Service
//      Sau khi cập nhật Product Service, cập nhật luôn Inventory Model để đảm bảo đồng bộ ngay lúc đó.
// ------------------------------
exports.importStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || quantity <= 0) {
            return res.status(400).json({ message: "❌ Dữ liệu không hợp lệ" });
        }
        console.log("📌 Nhập hàng cho Product ID:", productId);

        // Lấy thông tin sản phẩm từ Product Service
        const productResponse = await axios.get(`${PRODUCT_SERVICE_URLImport}/${productId}`);
        console.log("🔍 Dữ liệu sản phẩm nhận được:", productResponse.data);
        const product = productResponse.data;
        if (!product || product.stock == null) {
            return res.status(404).json({ message: "❌ Sản phẩm không tồn tại hoặc thiếu stock" });
        }
        if (typeof product.stock !== "number") {
            console.error("🚨 Lỗi: stock không phải là số", product);
            return res.status(500).json({ message: "❌ stock không hợp lệ", stockType: typeof product.stock });
        }

        // Tăng stock
        const newStock = product.stock + quantity;
        console.log("📌 Stock mới:", newStock);

        // Cập nhật stock trong Product Service
        const updateResponse = await axios.put(`${PRODUCT_SERVICE_URLImport}/${productId}`, { stock: newStock });
        console.log("🔄 Kết quả cập nhật:", updateResponse.data);
        if (!updateResponse.data.data || updateResponse.data.data.stock == null) {
            return res.status(500).json({ message: "❌ Không thể cập nhật stock" });
        }

        // --- Cập nhật luôn Inventory Model ngay sau khi Product Service được cập nhật ---
        await Inventory.findOneAndUpdate(
            { productId: productId, name: product.name },
            { quantity: updateResponse.data.data.stock, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        // -------------------------------------------------------------------------------

        res.status(200).json({
            message: "✅ Nhập hàng thành công!",
            newStock: updateResponse.data.data.stock,
        });
    } catch (error) {
        console.error("🚨 Lỗi nhập hàng:", error.response?.data || error.message);
        res.status(500).json({
            message: "❌ Lỗi server khi nhập hàng",
            error: error.message,
        });
    }
};

// ------------------------------
// 7️⃣ API đồng bộ Inventory với Product Service
// ------------------------------
exports.syncInventory = async (req, res) => {
    try {
        console.log("🔄 Đang đồng bộ dữ liệu từ Product Service...");
        const products = await fetchProductsData();
        await Promise.all(
            products.map((product) =>
                Inventory.findOneAndUpdate(
                    { productId: product._id, name: product.name },
                    { quantity: product.stock, updatedAt: new Date() },
                    { upsert: true, new: true }
                )
            )
        );
        console.log("✅ Đồng bộ dữ liệu thành công!");
        res.json({ message: "Đồng bộ dữ liệu thành công!" });
    } catch (error) {
        console.error("🚨 Lỗi khi đồng bộ Inventory:", error.message);
        res.status(500).json({
            message: "Lỗi server khi đồng bộ Inventory",
            error: error.message,
        });
    }
};


// Đặt chỗ số lượng sản phẩm
 
exports.reserveStock = async (req, res) => {
    try {
            const { productId, quantity } = req.params;
            const parsedQuantity = parseInt(quantity, 10);
    
            if (!productId || isNaN(parsedQuantity) || parsedQuantity <= 0) {
                return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
            }
    
            const inventory = await Inventory.findOne({ productId });
            if (!inventory) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại" });
            }
    
            const available = inventory.quantity - inventory.reserved;
            if (available < parsedQuantity) {
                return res.status(400).json({ message: `Không đủ hàng. Chỉ còn ${available} sản phẩm có sẵn.` });
            }
    
            inventory.reserved += parsedQuantity;
            inventory.updatedAt = new Date();
            await inventory.save();
    
            res.json({ success: true, reserved: inventory.reserved });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi đặt chỗ sản phẩm", error: error.message });
        }
};


// Giải phóng số lượng sản phẩm đã đặt chỗ
exports.releaseStock = async (req, res) => {
     try {
            const { productId, quantity } = req.params;
            const parsedQuantity = parseInt(quantity, 10);
    
            if (!productId || isNaN(parsedQuantity) || parsedQuantity <= 0) {
                return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
            }
    
            const inventory = await Inventory.findOne({ productId });
            if (!inventory) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại" });
            }
    
            if (inventory.reserved < parsedQuantity) {
                return res.status(400).json({ message: "Không thể giải phóng nhiều hơn số lượng đã đặt chỗ" });
            }
    
            inventory.reserved -= parsedQuantity;
            inventory.updatedAt = new Date();
            await inventory.save();
    
            res.json({ success: true, reserved: inventory.reserved });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi giải phóng sản phẩm", error: error.message });
        }
};




