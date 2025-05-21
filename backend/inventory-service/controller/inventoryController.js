require("dotenv").config();

const Inventory = require("../models/InventoryModels");
const axios = require("axios");
const { callApiWithRetry } = require("../utils/apiRetry");

// URL của Product Service (đổi nếu cần)
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3000/api/products/products";
const PRODUCT_SERVICE_URLImport = process.env.PRODUCT_SERVICE_URLImport || "http://localhost:3000/api/products/product";
const PRODUCT_UPDATE_STOCK_URL = process.env.PRODUCT_UPDATE_STOCK_URL || "http://localhost:3000/api/products/update-stock";
const CART_API_URL = process.env.CART_API_URL || "http://localhost:3000/api/cart";
const Order_api = process.env.ORDER_API || 'http://localhost:3000/api/orders'
const LOW_STOCK_THRESHOLD = 5; // Ngưỡng cảnh báo tồn kho thấp

// ------------------------------
// Hàm helper dùng để lấy dữ liệu sản phẩm từ Product Service
// ------------------------------
const fetchProductsData = async () => {
    const response = await callApiWithRetry({
        method: 'get',
        url: PRODUCT_SERVICE_URL
    });
    const products = response.data.data;
    if (!Array.isArray(products)) {
        throw new Error("Dữ liệu không hợp lệ từ Product Service");
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
// 2️⃣ API lấy danh sách tồn kho từ Inventory Model
// ------------------------------
exports.getInventory = async (req, res) => {
    try {
        // Ưu tiên lấy dữ liệu từ Inventory Model
        const inventoryData = await Inventory.find({});
        if (!inventoryData || inventoryData.length === 0) {
            return res.status(404).json({ message: "Không có dữ liệu tồn kho trong Inventory" });
        }
        const result = inventoryData.map(item => ({
            productId: item.productId,
            name: item.name,
            stock: item.quantity,
            lowStock: item.quantity <= LOW_STOCK_THRESHOLD
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy tồn kho từ Inventory Model",
            error: error.message,
        });
    }
};

// ------------------------------
// 3️⃣ API lấy stock theo danh sách productId
//     Fallback: nếu lỗi, lấy dữ liệu từ Inventory Model
// ------------------------------
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
// 4️⃣ API kiểm tra sản phẩm còn hàng không (chỉ dùng Inventory Model)
// ------------------------------
exports.getProductStock = async (req, res) => {
    try {
        const inventoryData = await Inventory.findOne({ productId: req.params.productId });
        if (!inventoryData) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong Inventory Model" });
        }
        res.json({ inStock: inventoryData.quantity > 0, stockInInventory: inventoryData.quantity });
    } catch (fallbackError) {
        res.status(500).json({
            message: "Lỗi khi kiểm tra tồn kho từ Inventory Model",
            error: fallbackError.message,
        });
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
//      Sau khi cập nhật Product Service, cập nhật luôn Inventory Model để đảm bảo đồng bộ
// ------------------------------
exports.importStock = async (req, res) => {
    try {
        const { productId, quantity } = req.params;
        const qty = Number(quantity);
        if (!productId || qty <= 0) {
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
        const newStock = product.stock + qty;
        console.log("📌 Stock mới:", newStock);

        // Cập nhật stock trong Product Service
        const updateResponse = await axios.put(`${PRODUCT_SERVICE_URLImport}/${productId}`, { stock: newStock });
        console.log("🔄 Kết quả cập nhật:", updateResponse.data);
        if (!updateResponse.data.data || updateResponse.data.data.stock == null) {
            return res.status(500).json({ message: "❌ Không thể cập nhật stock" });
        }

        // Cập nhật luôn Inventory Model sau khi Product Service được cập nhật
        await Inventory.findOneAndUpdate(
            { productId: productId, name: product.name },
            { quantity: updateResponse.data.data.stock, updatedAt: new Date() },
            { upsert: true, new: true }
        );

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

// ------------------------------
// 8️⃣ API xác nhận đơn hàng
//     Sau khi xác nhận, giảm số lượng tồn trong Inventory và cập nhật stock cho Product Service
// ------------------------------
exports.confirmOrder = async (req, res) => {
    try {
        // Giả sử items được truyền dưới dạng chuỗi JSON trong req.params.items
        const items = JSON.parse(req.params.items);
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Không có mặt hàng để xác nhận" });
        }

        await Promise.all(
            items.map(async (item) => {
                // Cập nhật Inventory: trừ quantity (không còn reserved)
                const updated = await Inventory.findOneAndUpdate(
                    { productId: item.productId },
                    {
                        $inc: { quantity: -item.quantity },
                        $set: { updatedAt: new Date() }
                    },
                    { new: true }
                );
                if (!updated) {
                    throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
                }
                if (updated.quantity < 0) {
                    throw new Error(`Không đủ hàng cho sản phẩm ${item.productId} sau khi xác nhận`);
                }
                // Cập nhật lại stock trong Product Service thông qua endpoint updateStock
                await axios.put(`${PRODUCT_UPDATE_STOCK_URL}/${item.productId}/${updated.quantity}`, null, { timeout: 5000 });
            })
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xác nhận đơn hàng trong Inventory", error: error.message });
    }
};

// ------------------------------
// 9️⃣ API restore stock: cộng thêm số lượng vào tồn kho (tham số qua params: productId và quantity)
// ------------------------------
exports.restoreStock = async (req, res) => {
    try {
        const { productId, quantity } = req.params;
        const qty = Number(quantity);
        if (!productId || !qty || qty <= 0) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }
        const inventory = await Inventory.findOne({ productId });
        if (!inventory) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        // Restore: cộng thêm số lượng vào tồn kho
        inventory.quantity += qty;
        inventory.updatedAt = new Date();
        await inventory.save();
        res.json({ success: true, quantity: inventory.quantity });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi restore sản phẩm", error: error.message });
    }
};

// ------------------------------
// 10️⃣ API lấy thông tin sản phẩm trong Inventory
// ------------------------------
exports.getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const item = await Inventory.findOne({ productId });
        if (!item) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        res.json({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin tồn kho", error: error.message });
    }
};

// ------------------------------
// 11️⃣ API thống kê tổng quan
// ------------------------------
exports.getGeneralStats = async (req, res) => {
    try {
        // Lấy thông tin từ các service
        const [products, orders, inventory] = await Promise.all([
            axios.get(PRODUCT_SERVICE_URL),
            axios.get(Order_api),
            Inventory.find({})
        ]);

        // Tính toán thống kê
        const totalProducts = products.data.data.length;
        const totalOrders = orders.data.length;
        const totalInventory = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = orders.data.reduce((sum, order) => sum + order.finalTotal, 0);

        // Thống kê theo trạng thái đơn hàng
        const orderStatusStats = orders.data.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        // Thống kê sản phẩm theo danh mục
        const categoryStats = products.data.data.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {});

        // Thống kê sản phẩm tồn kho thấp
        const lowStockProducts = inventory.filter(item => item.quantity <= LOW_STOCK_THRESHOLD);

        res.json({
            general: {
                totalProducts,
                totalOrders,
                totalInventory,
                totalRevenue,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
            },
            orderStatus: orderStatusStats,
            categoryStats,
            inventoryAlerts: {
                lowStockCount: lowStockProducts.length,
                lowStockProducts: lowStockProducts.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    currentStock: item.quantity
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê tổng quan",
            error: error.message
        });
    }
};

// ------------------------------
// 12️⃣ API thống kê doanh thu theo thời gian
// ------------------------------
exports.getRevenueStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query; // period: 'day', 'week', 'month', 'year'
        const orders = await axios.get(Order_api);

        // Lọc các đơn hàng đã hoàn thành
        const completedOrders = orders.data.filter(order => order.status === 'completed');

        // Nhóm doanh thu theo thời gian
        const revenueByPeriod = completedOrders.reduce((acc, order) => {
            const date = new Date(order.createdAt);
            let periodKey;

            switch (period) {
                case 'day':
                    periodKey = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    periodKey = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                case 'year':
                    periodKey = date.getFullYear().toString();
                    break;
                default:
                    periodKey = date.toISOString().split('T')[0];
            }

            acc[periodKey] = (acc[periodKey] || 0) + order.finalTotal;
            return acc;
        }, {});

        // Tính toán các chỉ số
        const totalRevenue = Object.values(revenueByPeriod).reduce((sum, val) => sum + val, 0);
        const averageRevenue = Object.values(revenueByPeriod).length > 0
            ? totalRevenue / Object.values(revenueByPeriod).length
            : 0;

        res.json({
            revenueByPeriod,
            totalRevenue,
            averageRevenue,
            period
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê doanh thu",
            error: error.message
        });
    }
};

// ------------------------------
// 13️⃣ API thống kê sản phẩm bán chạy
// ------------------------------
exports.getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const orders = await axios.get(Order_api);

        // Tính toán số lượng bán của từng sản phẩm
        const productSales = orders.data.reduce((acc, order) => {
            if (order.status === 'completed') {
                order.items.forEach(item => {
                    acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
                });
            }
            return acc;
        }, {});

        // Lấy thông tin chi tiết sản phẩm
        const products = await axios.get(PRODUCT_SERVICE_URL);
        const productDetails = products.data.data;

        // Kết hợp thông tin và sắp xếp theo số lượng bán
        const topProducts = Object.entries(productSales)
            .map(([productId, quantity]) => {
                const product = productDetails.find(p => p._id === productId);
                return {
                    productId,
                    name: product?.name || 'Unknown Product',
                    category: product?.category || 'Unknown Category',
                    totalSold: quantity,
                    price: product?.price || 0,
                    revenue: (product?.price || 0) * quantity
                };
            })
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, parseInt(limit));

        res.json({
            topProducts,
            totalProducts: Object.keys(productSales).length
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê sản phẩm bán chạy",
            error: error.message
        });
    }
};

// ------------------------------
// 14️⃣ API thống kê tồn kho theo danh mục
// ------------------------------
exports.getInventoryByCategory = async (req, res) => {
    try {
        const products = await axios.get(PRODUCT_SERVICE_URL);
        const inventory = await Inventory.find({});

        // Tạo map để dễ dàng truy xuất thông tin sản phẩm
        const productMap = products.data.data.reduce((acc, product) => {
            acc[product._id] = product;
            return acc;
        }, {});

        // Thống kê tồn kho theo danh mục
        const categoryStats = inventory.reduce((acc, item) => {
            const product = productMap[item.productId];
            if (product) {
                const category = product.category;
                if (!acc[category]) {
                    acc[category] = {
                        totalProducts: 0,
                        totalStock: 0,
                        lowStockCount: 0,
                        products: []
                    };
                }

                acc[category].totalProducts++;
                acc[category].totalStock += item.quantity;
                if (item.quantity <= LOW_STOCK_THRESHOLD) {
                    acc[category].lowStockCount++;
                }

                acc[category].products.push({
                    productId: item.productId,
                    name: item.name,
                    currentStock: item.quantity,
                    price: product.price,
                    totalValue: item.quantity * product.price
                });
            }
            return acc;
        }, {});

        // Tính toán tổng giá trị tồn kho
        const totalInventoryValue = Object.values(categoryStats).reduce(
            (sum, category) => sum + category.products.reduce(
                (catSum, product) => catSum + product.totalValue, 0
            ), 0
        );

        res.json({
            categoryStats,
            totalInventoryValue,
            totalCategories: Object.keys(categoryStats).length
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê tồn kho theo danh mục",
            error: error.message
        });
    }
};

// ------------------------------
// 15️⃣ API thống kê chi tiết đơn hàng theo trạng thái
// ------------------------------
exports.getOrderStatusStats = async (req, res) => {
    try {
        const orders = await axios.get(Order_api);

        // Thống kê theo trạng thái
        const statusStats = orders.data.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        // Thống kê doanh thu theo trạng thái
        const revenueByStatus = orders.data.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + order.finalTotal;
            return acc;
        }, {});

        // Thống kê theo thời gian (24h gần nhất, 7 ngày, 30 ngày)
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const last7days = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const last30days = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const timeStats = {
            last24h: orders.data.filter(order => new Date(order.createdAt) > last24h).length,
            last7days: orders.data.filter(order => new Date(order.createdAt) > last7days).length,
            last30days: orders.data.filter(order => new Date(order.createdAt) > last30days).length
        };

        res.json({
            statusStats,
            revenueByStatus,
            timeStats,
            totalOrders: orders.data.length
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê trạng thái đơn hàng",
            error: error.message
        });
    }
};

// ------------------------------
// 16️⃣ API thống kê doanh thu chi tiết theo sản phẩm
// ------------------------------
exports.getProductRevenueStats = async (req, res) => {
    try {
        const orders = await axios.get(Order_api);
        const products = await axios.get(PRODUCT_SERVICE_URL);

        // Tạo map sản phẩm để dễ truy xuất
        const productMap = products.data.data.reduce((acc, product) => {
            acc[product._id] = product;
            return acc;
        }, {});

        // Tính toán doanh thu và số lượng bán cho từng sản phẩm
        const productStats = orders.data.reduce((acc, order) => {
            if (order.status === 'completed') {
                order.items.forEach(item => {
                    if (!acc[item.productId]) {
                        acc[item.productId] = {
                            productId: item.productId,
                            name: productMap[item.productId]?.name || 'Unknown',
                            category: productMap[item.productId]?.category || 'Unknown',
                            totalSold: 0,
                            totalRevenue: 0,
                            averagePrice: 0,
                            orders: 0
                        };
                    }

                    acc[item.productId].totalSold += item.quantity;
                    acc[item.productId].totalRevenue += item.price * item.quantity;
                    acc[item.productId].orders += 1;
                });
            }
            return acc;
        }, {});

        // Tính giá trung bình và sắp xếp theo doanh thu
        const productStatsArray = Object.values(productStats).map(stat => ({
            ...stat,
            averagePrice: stat.totalSold > 0 ? stat.totalRevenue / stat.totalSold : 0
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);

        // Thống kê theo danh mục
        const categoryStats = productStatsArray.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = {
                    totalRevenue: 0,
                    totalSold: 0,
                    productCount: 0
                };
            }
            acc[product.category].totalRevenue += product.totalRevenue;
            acc[product.category].totalSold += product.totalSold;
            acc[product.category].productCount += 1;
            return acc;
        }, {});

        res.json({
            productStats: productStatsArray,
            categoryStats,
            totalRevenue: productStatsArray.reduce((sum, p) => sum + p.totalRevenue, 0),
            totalProducts: productStatsArray.length
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê doanh thu sản phẩm",
            error: error.message
        });
    }
};

// ------------------------------
// 17️⃣ API thống kê tổng hợp chi tiết
// ------------------------------
exports.getDetailedStats = async (req, res) => {
    try {
        const [orders, products, inventory] = await Promise.all([
            axios.get(Order_api),
            axios.get(PRODUCT_SERVICE_URL),
            Inventory.find({})
        ]);

        // Thống kê đơn hàng
        const orderStats = {
            total: orders.data.length,
            byStatus: orders.data.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {}),
            revenue: orders.data.reduce((sum, order) => sum + order.finalTotal, 0),
            averageOrderValue: orders.data.length > 0
                ? orders.data.reduce((sum, order) => sum + order.finalTotal, 0) / orders.data.length
                : 0
        };

        // Thống kê sản phẩm
        const productStats = {
            total: products.data.data.length,
            byCategory: products.data.data.reduce((acc, product) => {
                acc[product.category] = (acc[product.category] || 0) + 1;
                return acc;
            }, {}),
            lowStock: inventory.filter(item => item.quantity <= LOW_STOCK_THRESHOLD).length,
            outOfStock: inventory.filter(item => item.quantity === 0).length
        };

        // Thống kê doanh thu theo thời gian
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const revenueStats = {
            total: orderStats.revenue,
            thisMonth: orders.data
                .filter(order => new Date(order.createdAt) >= thisMonth)
                .reduce((sum, order) => sum + order.finalTotal, 0),
            lastMonth: orders.data
                .filter(order => new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) < thisMonth)
                .reduce((sum, order) => sum + order.finalTotal, 0)
        };

        // Thống kê tồn kho
        const inventoryStats = {
            totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: inventory.reduce((sum, item) => {
                const product = products.data.data.find(p => p._id === item.productId);
                return sum + (item.quantity * (product?.price || 0));
            }, 0),
            lowStockItems: inventory.filter(item => item.quantity <= LOW_STOCK_THRESHOLD)
                .map(item => ({
                    productId: item.productId,
                    name: item.name,
                    currentStock: item.quantity
                }))
        };

        res.json({
            orderStats,
            productStats,
            revenueStats,
            inventoryStats,
            lastUpdated: new Date()
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê chi tiết",
            error: error.message
        });
    }
};
