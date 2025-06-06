require("dotenv").config();

const Order = require("../models/Order");
const axios = require("axios");

const CART_API_URL = process.env.CART_API_URL || "http://localhost:3000/api/cart";
const INVENTORY_API = process.env.INVENTORY_API || "http://localhost:3000/api/inventory";
const PRODUCT_SERVICE_URLImport = process.env.PRODUCT_SERVICE_URLImport || "http://localhost:3000/api/product";
const PRODUCT_UPDATE_STOCK_URL = process.env.PRODUCT_UPDATE_STOCK_URL || "http://localhost:3000/api/products/update-stock";

// 📌 Tạo đơn hàng

// body
// exports.createOrder = async (req, res) => {
//     try {
//         const { userId, customer, items, shipping, payment, finalTotal, notes } = req.body;

//         if (!userId || !customer || !items || items.length === 0) {
//             return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
//         }

//         // Lấy danh sách productId từ items
//         const productIds = items.map(item => item.productId);
//         // Chuyển mảng productIds thành chuỗi phân cách bởi dấu phẩy để truyền qua params
//         const productIdsParam = productIds.join(',');

//         // Gọi API bulk của Inventory theo kiểu GET, truyền productIds qua params
//         const { data: inventoryData } = await axios.get(`${INVENTORY_API}/bulk/${productIdsParam}`);

//         if (!inventoryData || inventoryData.length === 0) {
//             return res.status(400).json({ message: "Không tìm thấy sản phẩm trong kho" });
//         }

//         // Kiểm tra tồn kho của từng mặt hàng
//         for (let item of items) {
//             const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
//             if (!invItem || invItem.stock < item.quantity) {
//                 return res.status(400).json({ message: `Sản phẩm ${item.name} không đủ hàng` });
//             }
//         }

//         // Chuyển mảng items thành chuỗi JSON và encode để truyền qua params
//         const itemsParam = encodeURIComponent(JSON.stringify(items));
//         // Gọi API confirm của Inventory qua POST với dữ liệu items truyền qua params
//         const confirmRes = await axios.post(`${INVENTORY_API}/confirm/${itemsParam}`);
//         if (!confirmRes.data.success) {
//             return res.status(400).json({ message: "Xác nhận tồn kho thất bại" });
//         }

//         // Tạo đơn hàng
//         const order = new Order({
//             userId,
//             customer,
//             items,
//             shipping,
//             payment,
//             finalTotal,
//             notes
//         });
//         await order.save();

//         // Xóa giỏ hàng của user sau khi đặt hàng thành công
//         await axios.delete(`${CART_API_URL}/clear/${userId}`);

//         res.json({ message: "Đơn hàng đã được tạo", order });
//     } catch (error) {
//         console.error("Lỗi khi tạo đơn hàng:", error);
//         res.status(500).json({ message: "Lỗi server", error: error.message });
//     }
// };

// params
exports.createOrder = async (req, res) => {
    try {
        // Lấy dữ liệu từ params (với các trường phức tạp được truyền dưới dạng chuỗi JSON)
        const { userId, customer, items, shipping, payment, finalTotal, notes } = req.params;

        // Kiểm tra dữ liệu cơ bản
        if (!userId || !customer || !items || !shipping || !payment || !finalTotal || !notes) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        // Parse các trường JSON
        let customerObj, itemsArr, shippingObj, paymentObj, notesObj;
        try {
            customerObj = JSON.parse(customer);
            itemsArr = JSON.parse(items);
            shippingObj = JSON.parse(shipping);
            paymentObj = JSON.parse(payment);
            notesObj = JSON.parse(notes);
        } catch (err) {
            return res.status(400).json({ message: "Dữ liệu JSON không hợp lệ", error: err.message });
        }

        if (!Array.isArray(itemsArr) || itemsArr.length === 0) {
            return res.status(400).json({ message: "Không có mặt hàng để đặt hàng" });
        }

        // Lấy danh sách productId từ items
        const productIds = itemsArr.map(item => item.productId);
        // Chuyển mảng productIds thành chuỗi phân cách bởi dấu phẩy để truyền qua params
        const productIdsParam = productIds.join(',');

        // Gọi API bulk của Inventory theo kiểu GET, truyền productIds qua params
        const { data: inventoryData } = await axios.get(`${INVENTORY_API}/bulk/${productIdsParam}`);
        if (!inventoryData || inventoryData.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy sản phẩm trong kho" });
        }

        // Kiểm tra tồn kho của từng mặt hàng
        for (let item of itemsArr) {
            const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
            if (!invItem || invItem.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${item.name} không đủ hàng` });
            }
        }

        // Chuyển mảng items thành chuỗi JSON và encode để truyền qua params
        const itemsParam = encodeURIComponent(JSON.stringify(itemsArr));
        // Gọi API confirm của Inventory qua POST với dữ liệu items truyền qua params
        const confirmRes = await axios.post(`${INVENTORY_API}/confirm/${itemsParam}`);
        if (!confirmRes.data.success) {
            return res.status(400).json({ message: "Xác nhận tồn kho thất bại" });
        }

        // Tạo đơn hàng (giả sử Order đã được import)
        const order = new Order({
            userId,
            customer: customerObj,
            items: itemsArr,
            shipping: shippingObj,
            payment: paymentObj,
            finalTotal,
            notes: notesObj
        });
        await order.save();

        // Xóa giỏ hàng của user sau khi đặt hàng thành công
        // await axios.delete(`${CART_API_URL}/clear/${userId}`);
        for (let item of itemsArr) {
            await axios.delete(`${CART_API_URL}/remove/${userId}/${item.productId}`);
        }

        res.json({ message: "Đơn hàng đã được tạo", order });
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


// 📌 Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate("userId");
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy danh sách đơn hàng của user
exports.getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy tất cả đơn hàng (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("userId").sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo giảm dần (mới nhất trước);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Cập nhật đơn hàng (Admin)
// Cho phép cập nhật các trường như status, shipping, payment, sellerNote,...
// exports.updateOrder = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const updateData = req.body; // Ví dụ: { status: "completed", shipping: { ... }, payment: { ... } }
//         const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
//         if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
//         res.json({ message: "Đơn hàng đã được cập nhật", order });
//     } catch (error) {
//         res.status(500).json({ message: "Lỗi server", error: error.message });
//     }
// };
exports.updateOrder = async (req, res) => {
    try {
        const { orderId, updateData } = req.params;
        if (!orderId || !updateData) {
            return res.status(400).json({ message: "Thiếu dữ liệu cần thiết" });
        }

        let parsedData;
        try {
            parsedData = JSON.parse(updateData);
        } catch (err) {
            return res.status(400).json({ message: "Dữ liệu update không hợp lệ", error: err.message });
        }

        // Validate important fields
        if (parsedData.customer && (!parsedData.customer.name || !parsedData.customer.phone || !parsedData.customer.address)) {
            return res.status(400).json({ message: "Thiếu thông tin khách hàng quan trọng" });
        }

        // In case of status change, record previous status for handling logic
        let previousStatus = null;
        if (parsedData.status) {
            const currentOrder = await Order.findById(orderId);
            if (currentOrder) {
                previousStatus = currentOrder.status;
            }
        }

        console.log(`📝 Updating order ${orderId}`, parsedData);
        
        // Update the order
        const order = await Order.findByIdAndUpdate(orderId, parsedData, { new: true, runValidators: true });
        
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        
        // Handle status change logic if needed
        if (previousStatus && previousStatus !== order.status) {
            console.log(`📊 Order status changed from ${previousStatus} to ${order.status}`);
            
            // Add any special handling for status changes here
            // For example, if status changed to "cancelled", you might want to restore inventory
        }
        
        res.json({ 
            success: true,
            message: "Đơn hàng đã được cập nhật thành công", 
            order 
        });
    } catch (error) {
        console.error("🚨 Error updating order:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server khi cập nhật đơn hàng", 
            error: error.message 
        });
    }
};

// 📌 Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log(`Attempting to cancel order: ${orderId}`);
        
        // Use a single database operation to update the order
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: "cancelled" },
            { new: true, runValidators: false }
        );
        
        if (!order) {
            console.log(`Order not found: ${orderId}`);
            return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        }

        // Send response immediately, then handle inventory restoration
        // This way the client doesn't have to wait for inventory operations
        res.json({ 
            success: true,
            message: "Đơn hàng đã bị hủy thành công", 
            order 
        });
        
        // Process inventory restoration in the background
        restoreInventoryWithRetry(order.items).catch(err => {
            console.error("Background inventory restoration error:", err);
        });
        
    } catch (error) {
        console.error("Unhandled error in cancelOrder:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server khi hủy đơn hàng", 
            error: error.message 
        });
    }
};

// Optimized inventory restoration with parallel processing
async function restoreInventoryWithRetry(items) {
    // Process all items in parallel using Promise.all
    const results = await Promise.all(items.map(async (item) => {
        let retries = 2; // Reduce retries from 3 to 2
        
        while (retries >= 0) {
            try {
                // Shorter timeout (8s instead of 15s)
                const response = await axios.post(
                    `https://kt-tkpm-project-api-gateway-v1.onrender.com/api/inventory/restore/${item.productId}/${item.quantity}`,
                    {},
                    { timeout: 8000 }
                );
                
                console.log(`Successfully restored inventory for product ${item.productId}`);
                return { success: true, productId: item.productId };
            } catch (err) {
                retries--;
                console.error(`Attempt failed for product ${item.productId}, retries left: ${retries}`);
                
                // Shorter wait between retries (1s, 2s)
                if (retries >= 0) {
                    await new Promise(resolve => setTimeout(resolve, (2-retries) * 1000));
                } else {
                    return { 
                        success: false, 
                        productId: item.productId, 
                        error: err.message 
                    };
                }
            }
        }
    }));
    
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
        console.warn("Some inventory restorations failed:", errors);
    }
    
    return { success: errors.length === 0, errors };
}

// 📌 Hủy đơn hàng bởi Admin (không ràng buộc trạng thái)
// exports.adminCancelOrder = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const order = await Order.findById(orderId);
//         if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

//         // Cập nhật trạng thái đơn hàng thành "cancelled"
//         order.status = "cancelled";
//         await order.save();

//         // Duyệt qua từng mặt hàng và restore stock trong Inventory Service
//         for (const item of order.items) {
//             try {
//                 // Gọi API restore để cộng lại số lượng vào tồn kho
//                 await axios.put(`${INVENTORY_API}/restore`, {
//                     productId: item.productId.toString(),
//                     quantity: item.quantity
//                 });
//                 // Sau đó, đồng bộ lại stock ở Product Service
//                 const invRes = await axios.get(`${INVENTORY_API}/product/${item.productId.toString()}`);
//                 if (invRes.data) {
//                     await axios.put(`${PRODUCT_SERVICE_URLImport}/${item.productId.toString()}`, {
//                         stock: invRes.data.quantity
//                     });
//                 }
//             } catch (err) {
//                 console.error(`Lỗi khi restore stock cho sản phẩm ${item.productId.toString()}:`, err.response?.data || err.message);
//             }
//         }

//         res.json({ message: "Đơn hàng đã được hủy bởi Admin và tồn kho đã được khôi phục", order });
//     } catch (error) {
//         console.error("Lỗi trong adminCancelOrder:", error.message);
//         res.status(500).json({ message: "Lỗi server", error: error.message });
//     }
// };

exports.adminCancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Cập nhật trạng thái đơn hàng thành "cancelled"
        order.status = "cancelled";
        await order.save();

        // Duyệt qua từng mặt hàng và gọi API restore theo dạng params
        for (const item of order.items) {
            try {
                // Gọi API restore của Inventory Service để cộng thêm số lượng
                await axios.post(`${INVENTORY_API}/restore/${item.productId.toString()}/${item.quantity}`);

                // Sau đó, lấy dữ liệu mới từ Inventory qua endpoint GET /product/:productId
                const invRes = await axios.get(`${INVENTORY_API}/product/${item.productId.toString()}`);
                if (invRes.data) {
                    // Cập nhật lại stock trong Product Service dựa trên số liệu mới từ Inventory
                    // await axios.put(`${PRODUCT_SERVICE_URLImport}/${item.productId.toString()}`, {
                    //     stock: invRes.data.quantity
                    // });
                    await axios.put(`${PRODUCT_UPDATE_STOCK_URL}/${item.productId}/${invRes.data.quantity}`, null, { timeout: 5000 });

                }
            } catch (err) {
                console.error(
                    `Lỗi khi restore stock cho sản phẩm ${item.productId.toString()}:`,
                    err.response?.data || err.message
                );
            }
        }

        res.json({ message: "Đơn hàng đã được hủy bởi Admin; tồn kho và Product Service đã được restore", order });
    } catch (error) {
        console.error("Lỗi trong adminCancelOrder:", error.message);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};








// 📌 Xóa đơn hàng bởi Admin (AdminDeleteOrder)
// Lưu ý: Trước khi xóa, nếu đơn hàng chưa bị hủy, bạn có thể gọi API Inventory để hoàn trả hàng về kho.
exports.adminDeleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Nếu đơn hàng chưa bị hủy, thực hiện hoàn trả hàng về kho
        if (order.status !== "cancelled") {
            // Thay vì gọi API với body { items: order.items },
            // lặp qua từng mặt hàng và gọi API release theo params.
            for (const item of order.items) {
                try {
                    await axios.put(`${INVENTORY_API}/release/${item.productId}/${item.quantity}`);
                } catch (err) {
                    console.error(
                        `Lỗi khi gọi API release cho sản phẩm ${item.productId}:`,
                        err.response?.data || err.message
                    );
                    return res.status(500).json({
                        message: "Lỗi khi hoàn trả hàng về kho",
                        error: err.message,
                    });
                }
            }
        }

        // Xóa đơn hàng khỏi CSDL
        await Order.findByIdAndDelete(orderId);
        res.json({ message: "Đơn hàng đã được xóa bởi Admin" });
    } catch (error) {
        console.error("Lỗi trong adminDeleteOrder:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Khi Order gọi đến Inventory để kiểm tra stock (day ne)
async function checkInventoryWithRetry(productIds) {
  let retries = 3;
  while (retries > 0) {
    try {
      return await axios.get(`${INVENTORY_API}/bulk/${productIdsParam}`);
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000)); // chờ 3s
    }
  }
}


