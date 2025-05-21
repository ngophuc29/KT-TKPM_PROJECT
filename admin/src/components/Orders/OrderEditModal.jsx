import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Update the API URLs with correct endpoints
const ORDER_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/orders`;
const PRODUCT_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products`;
const INVENTORY_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/inventory`;

export default function OrderEditModal({ orderId, onClose, onOrderUpdated }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saveProgress, setSaveProgress] = useState(0);

    // Form state
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        address: "",
        phone: "",
        email: ""
    });
    const [shippingInfo, setShippingInfo] = useState({
        method: "",
        fee: 0,
        status: "",
        trackingNumber: ""
    });
    const [paymentInfo, setPaymentInfo] = useState({
        method: "",
        status: ""
    });
    const [orderStatus, setOrderStatus] = useState("");
    const [notes, setNotes] = useState({
        customerNote: "",
        sellerNote: ""
    });
    // Add state for items management
    const [orderItems, setOrderItems] = useState([]);
    const [originalTotal, setOriginalTotal] = useState(0);

    // Add state for managing product selection
    const [showProductModal, setShowProductModal] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [productLoadError, setProductLoadError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productInitialized, setProductInitialized] = useState(false);

    // Add state for tracking original items for inventory adjustments
    const [originalOrderItems, setOriginalOrderItems] = useState([]);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await axios.get(`${ORDER_API_URL}/${orderId}`);
                const orderData = response.data;
                setOrder(orderData);

                // Store original items for inventory comparison
                setOriginalOrderItems(JSON.parse(JSON.stringify(orderData.items || [])));

                // Initialize form state with current values
                setCustomerInfo({
                    name: orderData.customer?.name || "",
                    address: orderData.customer?.address || "",
                    phone: orderData.customer?.phone || "",
                    email: orderData.customer?.email || ""
                });

                setShippingInfo({
                    method: orderData.shipping?.method || "",
                    fee: orderData.shipping?.fee || 0,
                    status: orderData.shipping?.status || "",
                    trackingNumber: orderData.shipping?.trackingNumber || ""
                });

                setPaymentInfo({
                    method: orderData.payment?.method || "",
                    status: orderData.payment?.status || ""
                });

                setOrderStatus(orderData.status || "");

                setNotes({
                    customerNote: orderData.notes?.customerNote || "",
                    sellerNote: orderData.notes?.sellerNote || ""
                });

                // Initialize order items
                setOrderItems(orderData.items || []);
                setOriginalTotal(orderData.finalTotal || 0);
            } catch (err) {
                setError("Lỗi khi lấy chi tiết đơn hàng");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    // Function to handle quantity change
    const handleItemQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;

        setOrderItems(items =>
            items.map(item =>
                item._id === itemId ? { ...item, quantity: parseInt(newQuantity) } : item
            )
        );
    };

    // Function to handle item removal
    const handleRemoveItem = (itemId) => {
        if (orderItems.length <= 1) {
            setError("Đơn hàng phải có ít nhất một sản phẩm");
            return;
        }

        setOrderItems(items => items.filter(item => item._id !== itemId));
    };

    // Function to calculate updated total
    const calculateUpdatedTotal = () => {
        const itemsTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return itemsTotal + (shippingInfo.fee || 0);
    };

    // Function to calculate inventory changes
    const calculateInventoryChanges = () => {
        const changes = [];

        // Map of original items by productId for quick lookup
        const originalItemsMap = new Map(
            originalOrderItems.map(item => [item.productId, item])
        );

        // Map of current items by productId for quick lookup
        const currentItemsMap = new Map(
            orderItems.map(item => [item.productId, item])
        );

        // Check for items whose quantity changed or were removed
        originalOrderItems.forEach(originalItem => {
            const currentItem = currentItemsMap.get(originalItem.productId);

            if (!currentItem) {
                // Item was completely removed, restore inventory
                changes.push({
                    productId: originalItem.productId,
                    restoreQuantity: originalItem.quantity,
                    operation: 'restore',
                    name: originalItem.name // Add product name for better logs
                });
            } else if (currentItem.quantity < originalItem.quantity) {
                // Quantity decreased, restore the difference
                changes.push({
                    productId: originalItem.productId,
                    restoreQuantity: originalItem.quantity - currentItem.quantity,
                    operation: 'restore',
                    name: originalItem.name // Add product name for better logs
                });
            } else if (currentItem.quantity > originalItem.quantity) {
                // Quantity increased, deduct the difference
                changes.push({
                    productId: originalItem.productId,
                    deductQuantity: currentItem.quantity - originalItem.quantity,
                    operation: 'deduct',
                    name: originalItem.name // Add product name for better logs
                });
            }
        });

        // Check for new items added to the order
        orderItems.forEach(currentItem => {
            if (!originalItemsMap.has(currentItem.productId)) {
                // New item added, deduct from inventory
                changes.push({
                    productId: currentItem.productId,
                    deductQuantity: currentItem.quantity,
                    operation: 'deduct',
                    name: currentItem.name // Add product name for better logs
                });
            }
        });

        return changes;
    };

    // Function to apply inventory changes with better error handling and direct product updates
    const applyInventoryChanges = async (changes) => {
        const results = [];
        let success = true;

        console.log("Applying inventory changes:", changes);

        // Add a visual notification that inventory is being updated
        const inventoryUpdateNotification = (message) => {
            // If needed, you can implement a toast notification here
            console.log("Inventory Update:", message);
        };

        inventoryUpdateNotification("Đang cập nhật tồn kho sản phẩm...");

        for (const change of changes) {
            try {
                if (change.operation === 'restore') {
                    // Restore inventory (add quantity back)
                    const response = await axios.post(
                        `${INVENTORY_API_URL}/restore/${change.productId}/${change.restoreQuantity}`,
                        {},
                        { timeout: 5000 }
                    );

                    // Also update the product stock in the product catalog
                    try {
                        // First get current product stock
                        const productResponse = await axios.get(`${PRODUCT_API_URL.replace('/products', '')}/product/${change.productId}`);
                        if (productResponse.data && typeof productResponse.data.stock === 'number') {
                            const newStock = productResponse.data.stock + change.restoreQuantity;
                            await axios.put(`${PRODUCT_API_URL.replace('/products', '')}/update-stock/${change.productId}/${newStock}`, null, {
                                timeout: 5000
                            });
                            console.log(`Updated product stock to ${newStock} after restoring ${change.restoreQuantity} items`);
                        }
                    } catch (productUpdateError) {
                        console.error(`Failed to update product stock for ${change.productId}:`, productUpdateError);
                        // Continue with the process even if product update fails
                    }

                    results.push({
                        productId: change.productId,
                        success: true,
                        operation: 'restore',
                        quantity: change.restoreQuantity,
                        name: change.name
                    });
                    console.log(`Restored ${change.restoreQuantity} items for product ${change.name} (${change.productId})`);
                } else if (change.operation === 'deduct') {
                    // Confirm order (deduct quantity)
                    const items = [{
                        productId: change.productId,
                        quantity: change.deductQuantity
                    }];
                    const encodedItems = encodeURIComponent(JSON.stringify(items));
                    const response = await axios.post(
                        `${INVENTORY_API_URL}/confirm/${encodedItems}`,
                        {},
                        { timeout: 5000 }
                    );

                    // Also update the product stock in the product catalog
                    try {
                        // First get current product stock
                        const productResponse = await axios.get(`${PRODUCT_API_URL.replace('/products', '')}/product/${change.productId}`);
                        if (productResponse.data && typeof productResponse.data.stock === 'number') {
                            const newStock = Math.max(0, productResponse.data.stock - change.deductQuantity);
                            await axios.put(`${PRODUCT_API_URL.replace('/products', '')}/update-stock/${change.productId}/${newStock}`, null, {
                                timeout: 5000
                            });
                            console.log(`Updated product stock to ${newStock} after deducting ${change.deductQuantity} items`);
                        }
                    } catch (productUpdateError) {
                        console.error(`Failed to update product stock for ${change.productId}:`, productUpdateError);
                        // Continue with the process even if product update fails
                    }

                    results.push({
                        productId: change.productId,
                        success: true,
                        operation: 'deduct',
                        quantity: change.deductQuantity,
                        name: change.name
                    });
                    console.log(`Deducted ${change.deductQuantity} items for product ${change.name} (${change.productId})`);
                }
            } catch (error) {
                console.error(`Error applying inventory change for product ${change.name} (${change.productId}):`, error);
                results.push({
                    productId: change.productId,
                    success: false,
                    error: error.message,
                    operation: change.operation,
                    name: change.name
                });
                success = false;
            }
        }

        // Notify about the results
        if (success) {
            inventoryUpdateNotification("Cập nhật tồn kho thành công");
        } else {
            inventoryUpdateNotification("Một số thay đổi tồn kho không thành công, vui lòng kiểm tra logs");
        }

        return { success, results };
    };

    // Completely rewritten Admin-specific save function with multiple fallback strategies
    const handleAdminSave = async () => {
        try {
            // Reset states
            setError("");
            setSaving(true);
            setSaveProgress(10);

            // Validation
            const validationErrors = [];
            if (!customerInfo.phone.trim()) validationErrors.push("Số điện thoại không được để trống");
            if (!customerInfo.address.trim()) validationErrors.push("Địa chỉ không được để trống");
            if (orderItems.length === 0) validationErrors.push("Đơn hàng phải có ít nhất một sản phẩm");

            if (validationErrors.length > 0) {
                setError(validationErrors.join(", "));
                setSaving(false);
                setSaveProgress(0);
                return;
            }

            // Calculate inventory changes needed
            const inventoryChanges = calculateInventoryChanges();
            console.log("Inventory changes needed:", inventoryChanges);

            // Check product stock availability before proceeding
            if (inventoryChanges.some(change => change.operation === 'deduct')) {
                setSaveProgress(15);
                try {
                    // Check stock for all products that need quantity deducted
                    const deductChanges = inventoryChanges.filter(change => change.operation === 'deduct');
                    const productIds = deductChanges.map(change => change.productId).join(',');

                    if (productIds.length > 0) {
                        const stockResponse = await axios.get(`${INVENTORY_API_URL}/bulk/${productIds}`);
                        const stockData = stockResponse.data;

                        // Check if there's enough stock for each product
                        for (const change of deductChanges) {
                            const stockItem = stockData.find(item => item.productId === change.productId);
                            if (!stockItem || stockItem.stock < change.deductQuantity) {
                                throw new Error(`Không đủ hàng cho sản phẩm ${change.productId}. Chỉ còn ${stockItem?.stock || 0} sản phẩm`);
                            }
                        }
                    }
                } catch (stockError) {
                    console.error("Stock check failed:", stockError);
                    setError(`Lỗi kiểm tra tồn kho: ${stockError.message}`);
                    setSaving(false);
                    setSaveProgress(0);
                    return;
                }
            }

            // Calculate updated final total
            const updatedTotal = calculateUpdatedTotal();

            // Clean the items array to prevent MongoDB casting errors
            const cleanedItems = orderItems.map(item => {
                // For items with temporary IDs (newly added), convert to proper format
                const isNewItem = typeof item._id === 'string' && (
                    item._id.startsWith('new-') ||
                    item._id === item.productId
                );

                return {
                    // If it's a new item, omit _id to let MongoDB generate one
                    ...(isNewItem ? {} : { _id: item._id }),
                    productId: item.productId,
                    name: item.name,
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                };
            });

            // STRATEGY 1: Dot notation format with fixed items array
            const dotNotationData = {
                'customer.name': order.customer.name,
                'customer.address': customerInfo.address,
                'customer.phone': customerInfo.phone,
                'customer.email': customerInfo.email,

                'shipping.method': shippingInfo.method,
                'shipping.fee': Number(shippingInfo.fee),
                'shipping.status': shippingInfo.status,
                'shipping.trackingNumber': shippingInfo.trackingNumber,

                'payment.method': paymentInfo.method,
                'payment.status': paymentInfo.status,

                'status': orderStatus,

                'notes.customerNote': notes.customerNote,
                'notes.sellerNote': notes.sellerNote,

                // Use the cleaned items array to prevent casting errors
                'items': cleanedItems,
                'finalTotal': Number(updatedTotal)
            };

            setSaveProgress(25);
            console.log("Attempt 1: Using dot notation format with cleaned items", dotNotationData);

            try {
                // First attempt: Standard update with dot notation
                const updateDataString = JSON.stringify(dotNotationData);
                const encodedData = encodeURIComponent(updateDataString);

                // Update the order in the database
                const response = await axios({
                    method: 'put',
                    url: `${ORDER_API_URL}/update/${orderId}/${encodedData}`,
                    timeout: 8000,
                    headers: { 'Content-Type': 'application/json' }
                });

                console.log("Order update successful:", response.data);
                setSaveProgress(60);

                // Apply inventory changes
                if (inventoryChanges.length > 0) {
                    const inventoryResult = await applyInventoryChanges(inventoryChanges);
                    console.log("Inventory update result:", inventoryResult);

                    if (!inventoryResult.success) {
                        console.warn("Some inventory updates failed, but order was saved", inventoryResult.results);
                    }
                }

                // Add special handling for order cancellation
                // Check if order status was changed to cancelled
                if (orderStatus === "cancelled" && order.status !== "cancelled") {
                    console.log("Order status changed to cancelled, restoring all inventory");

                    // For cancelled orders, restore all quantities for all items
                    const cancelInventoryChanges = orderItems.map(item => ({
                        productId: item.productId,
                        restoreQuantity: item.quantity,
                        operation: 'restore',
                        name: item.name
                    }));

                    if (cancelInventoryChanges.length > 0) {
                        console.log("Applying cancel-specific inventory changes:", cancelInventoryChanges);
                        const cancelResult = await applyInventoryChanges(cancelInventoryChanges);
                        console.log("Cancel inventory restore result:", cancelResult);
                    }
                }

                // Add this new code to ensure inventory and product stock sync
                console.log("Running final inventory synchronization...");
                try {
                    // Sync inventory with product catalog
                    await axios.post(`${INVENTORY_API_URL}/syncInventory`, {}, { timeout: 8000 });
                    console.log("Inventory synchronized with product catalog");
                } catch (syncError) {
                    console.error("Failed to synchronize inventory:", syncError);
                    // Non-critical error, don't stop the process
                }

                setSaveProgress(100);

                // Update the original items with the new set for future comparisons
                setOriginalOrderItems(JSON.parse(JSON.stringify(orderItems)));

                if (onOrderUpdated) onOrderUpdated();
                alert("Đơn hàng đã được cập nhật thành công!");
                onClose();
                return;
            } catch (error1) {
                console.error("Strategy 1 failed:", error1);
                setSaveProgress(40);

                // STRATEGY 2: Nested object format
                try {
                    console.log("Attempt 2: Using nested object format");
                    const nestedData = {
                        customer: {
                            name: order.customer.name,
                            address: customerInfo.address,
                            phone: customerInfo.phone,
                            email: customerInfo.email
                        },
                        shipping: {
                            method: shippingInfo.method,
                            fee: Number(shippingInfo.fee),
                            status: shippingInfo.status,
                            trackingNumber: shippingInfo.trackingNumber
                        },
                        payment: {
                            method: paymentInfo.method,
                            status: paymentInfo.status
                        },
                        status: orderStatus,
                        notes: {
                            customerNote: notes.customerNote,
                            sellerNote: notes.sellerNote
                        },
                        items: cleanedItems,
                        finalTotal: Number(updatedTotal)
                    };

                    setSaveProgress(55);

                    // Try direct PUT without encoding
                    const response2 = await axios.put(
                        `${ORDER_API_URL}/${orderId}`,
                        nestedData,
                        {
                            timeout: 8000,
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );

                    console.log("Update successful with approach 2:", response2.data);
                    if (onOrderUpdated) onOrderUpdated();
                    alert("Đơn hàng đã được cập nhật thành công!");
                    onClose();
                    return;
                } catch (error2) {
                    console.error("Strategy 2 failed:", error2);
                    setSaveProgress(70);

                    // STRATEGY 3: Admin-specific endpoint with POST
                    try {
                        console.log("Attempt 3: Using admin endpoint with POST");

                        // Simple data format with minimal nesting
                        const simpleData = {
                            orderId: orderId,
                            customerName: order.customer.name,
                            customerAddress: customerInfo.address,
                            customerPhone: orderInfo.phone,
                            customerEmail: customerInfo.email,

                            shippingMethod: shippingInfo.method,
                            shippingFee: Number(shippingInfo.fee),
                            shippingStatus: shippingInfo.status,
                            trackingNumber: shippingInfo.trackingNumber,

                            orderStatus: orderStatus,
                            customerNote: notes.customerNote,
                            sellerNote: notes.sellerNote,

                            orderItems: orderItems.map(item => ({
                                id: item._id,
                                productId: item.productId,
                                name: item.name,
                                quantity: Number(item.quantity),
                                price: Number(item.price)
                            })),
                            totalAmount: Number(updatedTotal)
                        };

                        setSaveProgress(85);

                        // Try POST to admin endpoint as last resort
                        const response3 = await axios.post(
                            `${ORDER_API_URL}/admin/${orderId}`,
                            simpleData,
                            { timeout: 8000 }
                        );

                        console.log("Update successful with approach 3:", response3.data);
                        if (onOrderUpdated) onOrderUpdated();
                        alert("Đơn hàng đã được cập nhật thành công!");
                        onClose();
                        return;
                    } catch (error3) {
                        console.error("All strategies failed:", error3);
                        throw new Error("Không thể cập nhật đơn hàng sau khi thử nhiều phương pháp");
                    }
                }
            }
        } catch (error) {
            console.error("Final error:", error);
            setSaveProgress(0);

            // Generate detailed error message with actionable advice
            let errorMessage = "Không thể lưu đơn hàng: ";

            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.message.includes("timeout")) {
                errorMessage += "Yêu cầu bị hết thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.";
            } else if (error.message.includes("Network Error")) {
                errorMessage += "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
            } else {
                errorMessage += error.message;
            }

            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Function to toggle product selection
    const toggleProductSelection = (product) => {
        setSelectedProducts(prev => {
            // Check if product is already selected
            const isSelected = prev.some(p => p._id === product._id);

            if (isSelected) {
                // Remove product if already selected
                return prev.filter(p => p._id !== product._id);
            } else {
                // Add product if not selected
                return [...prev, product];
            }
        });
    };

    // Function to add selected products to order - fix the ID format for new items
    const addSelectedProductsToOrder = () => {
        if (selectedProducts.length === 0) {
            return; // No products selected
        }

        const newOrderItems = [...orderItems];

        // Process each selected product
        selectedProducts.forEach(product => {
            // Check if product already exists in order
            const existingItemIndex = newOrderItems.findIndex(item =>
                item.productId === product._id);

            if (existingItemIndex >= 0) {
                // Increase quantity if product already exists
                newOrderItems[existingItemIndex].quantity += 1;
            } else {
                // Add new product to order items - with proper MongoDB-compatible IDs
                newOrderItems.push({
                    // Use productId as temporary ID without "new-" prefix that causes casting issues
                    _id: product._id,  // Changed from the custom format with "new-" prefix
                    productId: product._id,
                    name: product.name,
                    quantity: 1,
                    price: product.price,
                });
            }
        });

        // Update order items
        setOrderItems(newOrderItems);

        // Clear selection and close modal
        setSelectedProducts([]);
        setShowProductModal(false);
    };

    // Completely revised product loading function with better error handling and debugging
    const fetchProducts = async (page = 1, limit = 30) => {
        try {
            if (page === 1) {
                setIsSearching(true);
                setProductLoadError("");
            } else {
                setIsLoadingMore(true);
            }

            console.log("Fetching products from:", PRODUCT_API_URL);

            // Simple request first - we'll focus on getting any data
            const response = await axios.get(PRODUCT_API_URL, {
                timeout: 15000
            });

            // Log the raw response to debug what we're getting
            console.log("API response:", response);

            // Check if we have data and process it
            if (response.data) {
                // Handle different response formats - try to locate the products array
                let productsArray = null;

                if (Array.isArray(response.data)) {
                    productsArray = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    productsArray = response.data.data;
                } else if (response.data.products && Array.isArray(response.data.products)) {
                    productsArray = response.data.products;
                }

                if (!productsArray) {
                    console.error("Could not locate products array in response:", response.data);
                    setProductLoadError("Không thể xác định định dạng dữ liệu sản phẩm từ API");
                    setAvailableProducts([]);
                    setSearchResults([]);
                    return;
                }

                console.log(`Found ${productsArray.length} products`);

                // Format products to ensure all required fields exist
                const formattedProducts = productsArray.map(product => ({
                    _id: product._id || '',
                    name: product.name || 'Unnamed Product',
                    price: product.price || 0,
                    stock: typeof product.stock === 'number' ? product.stock : 0,
                    category: product.category || '',
                    brand: product.brand || '',
                    image: product.image || '',
                    color: Array.isArray(product.color) ? product.color : [],
                    description: product.description || '',
                    details: Array.isArray(product.details) ? product.details : []
                }));

                if (page === 1) {
                    // Replace data on first page
                    setAvailableProducts(formattedProducts);
                    setSearchResults(formattedProducts);
                } else {
                    // Append data for subsequent pages
                    setAvailableProducts(prev => {
                        // Filter out duplicates by ID
                        const existingIds = new Set(prev.map(p => p._id));
                        const uniqueNewProducts = formattedProducts.filter(p => !existingIds.has(p._id));
                        return [...prev, ...uniqueNewProducts];
                    });

                    // Update search results if there's a search term
                    if (searchTerm.trim()) {
                        const filteredNew = formattedProducts.filter(product =>
                            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product._id.includes(searchTerm) ||
                            (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                        setSearchResults(prev => [...prev, ...filteredNew]);
                    } else {
                        setSearchResults(prev => [...prev, ...formattedProducts]);
                    }
                }

                // Determine if more products can be loaded
                setHasMore(formattedProducts.length >= limit);
                setCurrentPage(page);
                setProductInitialized(true);
            } else {
                console.warn("API returned no data:", response);
                setProductLoadError("API không trả về dữ liệu sản phẩm");
                if (page === 1) {
                    setAvailableProducts([]);
                    setSearchResults([]);
                }
            }
        } catch (err) {
            console.error("Error fetching products:", err);

            // Detailed error logging
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error response data:", err.response.data);
                console.error("Error response status:", err.response.status);
                console.error("Error response headers:", err.response.headers);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("Error request:", err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", err.message);
            }

            // Try alternate API endpoint if first one fails
            if (page === 1 && err.message.includes("404")) {
                console.log("Trying alternate API endpoint...");
                try {
                    // Try another common endpoint pattern
                    const alternateResponse = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products`, {
                        timeout: 10000
                    });

                    if (alternateResponse.data && (Array.isArray(alternateResponse.data) ||
                        (alternateResponse.data.data && Array.isArray(alternateResponse.data.data)))) {

                        console.log("Alternate API endpoint succeeded:", alternateResponse);

                        // Process data from alternate endpoint (similar to above)
                        const altProductsArray = Array.isArray(alternateResponse.data) ?
                            alternateResponse.data : alternateResponse.data.data;

                        const formattedProducts = altProductsArray.map(product => ({
                            _id: product._id || '',
                            name: product.name || 'Unnamed Product',
                            price: product.price || 0,
                            stock: typeof product.stock === 'number' ? product.stock : 0,
                            category: product.category || '',
                            brand: product.brand || '',
                            image: product.image || '',
                            color: Array.isArray(product.color) ? product.color : [],
                            description: product.description || '',
                            details: Array.isArray(product.details) ? product.details : []
                        }));

                        setAvailableProducts(formattedProducts);
                        setSearchResults(formattedProducts);
                        setHasMore(false); // Don't try pagination with alternate endpoint
                        setCurrentPage(1);
                        setProductInitialized(true);
                        setProductLoadError("");
                        return;
                    }
                } catch (altErr) {
                    console.error("Alternate API endpoint also failed:", altErr);
                }
            }

            // More detailed error message for the user
            const errorMessage = err.response?.status === 404 ? "Không tìm thấy API sản phẩm. Vui lòng kiểm tra đường dẫn API." :
                               err.code === 'ECONNABORTED' ? "Quá thời gian tải dữ liệu sản phẩm. Mạng có thể chậm." :
                               err.message.includes('Network Error') ? "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet." :
                               `Lỗi khi tải dữ liệu sản phẩm: ${err.message}`;

            setProductLoadError(errorMessage);

            // Try a limited set of dummy data as last resort
            if (page === 1) {
                console.log("Using fallback dummy data");
                const dummyProducts = [
                    { _id: 'dummy1', name: 'Sản phẩm mẫu 1', price: 100000, stock: 10, category: 'Mẫu', brand: 'Demo' },
                    { _id: 'dummy2', name: 'Sản phẩm mẫu 2', price: 150000, stock: 5, category: 'Mẫu', brand: 'Demo' },
                    { _id: 'dummy3', name: 'Sản phẩm mẫu 3', price: 200000, stock: 3, category: 'Mẫu', brand: 'Demo' }
                ];
                setAvailableProducts(dummyProducts);
                setSearchResults(dummyProducts);
                setHasMore(false);
                setProductInitialized(true);
            }
        } finally {
            if (page === 1) {
                setIsSearching(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    };

    // Load more products when scrolling to bottom
    const loadMoreProducts = () => {
        if (!isLoadingMore && hasMore) {
            fetchProducts(currentPage + 1);
        }
    };

    // Comprehensive search function
    const handleSearch = (term) => {
        setSearchTerm(term);

        if (!term.trim()) {
            setSearchResults(availableProducts);
            return;
        }

        // Enhanced search with multiple fields
        const filtered = availableProducts.filter(product =>
            product.name?.toLowerCase().includes(term.toLowerCase()) ||
            product._id?.includes(term) ||
            product.category?.toLowerCase().includes(term.toLowerCase()) ||
            product.brand?.toLowerCase().includes(term.toLowerCase()) ||
            product.description?.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filtered);
    };

    // Add a function to check API status before opening modal
    const checkApiAndOpenModal = async () => {
        setSelectedProducts([]); // Reset selections
        setSearchTerm("");       // Reset search term
        setCurrentPage(1);       // Reset to first page
        setHasMore(true);        // Reset more flag

        // Always show the modal immediately
        setShowProductModal(true);

        // Check if we need to load products
        if (!productInitialized || availableProducts.length === 0) {
            // Start with a simple API check before full product load
            try {
                const testEndpoints = [
                    `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products`,
                    `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products`,
                    `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/product`, // Some APIs use singular endpoint
                ];

                let apiFound = false;

                for (const endpoint of testEndpoints) {
                    try {
                        console.log(`Testing API endpoint: ${endpoint}`);
                        const response = await axios.get(endpoint, { timeout: 5000 });
                        if (response.status === 200) {
                            console.log(`Found working API at: ${endpoint}`);
                            // Update the product API URL to the working endpoint
                            // Note: we can't modify the constant, but we can use this endpoint in our fetch call
                            apiFound = true;
                            // Use the working endpoint to fetch products
                            await fetchProductsFromEndpoint(endpoint);
                            break;
                        }
                    } catch (err) {
                        console.log(`Endpoint ${endpoint} failed:`, err.message);
                    }
                }

                if (!apiFound) {
                    console.error("No working API endpoints found");
                    fetchProducts(1); // Try the original approach as fallback
                }
            } catch (error) {
                console.error("API check failed:", error);
                fetchProducts(1); // Try the original approach as fallback
            }
        } else {
            // Just reset the search results to show all available products
            setSearchResults(availableProducts);
        }
    };

    // Helper function to fetch products from a specific endpoint
    const fetchProductsFromEndpoint = async (endpoint) => {
        try {
            setIsSearching(true);
            const response = await axios.get(endpoint, { timeout: 10000 });

            let productsArray = null;

            if (Array.isArray(response.data)) {
                productsArray = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                productsArray = response.data.data;
            } else if (response.data.products && Array.isArray(response.data.products)) {
                productsArray = response.data.products;
            }

            if (productsArray) {
                const formattedProducts = productsArray.map(product => ({
                    _id: product._id || '',
                    name: product.name || 'Unnamed Product',
                    price: product.price || 0,
                    stock: typeof product.stock === 'number' ? product.stock : 0,
                    category: product.category || '',
                    brand: product.brand || '',
                    image: product.image || '',
                    color: Array.isArray(product.color) ? product.color : [],
                    description: product.description || '',
                    details: Array.isArray(product.details) ? product.details : []
                }));

                setAvailableProducts(formattedProducts);
                setSearchResults(formattedProducts);
                setHasMore(false); // Don't try pagination for now
                setProductInitialized(true);
            } else {
                throw new Error("Could not parse products array from response");
            }
        } catch (error) {
            console.error("Error fetching from endpoint:", endpoint, error);
            setProductLoadError(`Không thể tải sản phẩm từ ${endpoint}`);
            throw error;
        } finally {
            setIsSearching(false);
        }
    };

    // Replace the openProductModal function with our new function
    const openProductModal = checkApiAndOpenModal;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
                    <div className="p-6 text-center">
                        <p>Đang tải thông tin đơn hàng...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-semibold">Chỉnh sửa đơn hàng</h2>
                    <button
                        onClick={onClose}
                        className="text-3xl text-gray-500 hover:text-gray-700"
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {saveProgress > 0 && saveProgress < 100 && (
                        <div className="mb-4">
                            <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{ width: `${saveProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-center mt-1">Đang lưu ({saveProgress}%)</p>
                        </div>
                    )}

                    {/* Order ID (read-only) */}
                    <div className="mb-6">
                        <Label>Mã đơn hàng</Label>
                        <Input value={order?._id || ""} readOnly />
                    </div>

                    {/* Customer Information */}
                    <fieldset className="border rounded-md p-4 mb-6">
                        <legend className="text-lg font-medium px-2">Thông tin khách hàng</legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label htmlFor="customerName">Tên khách hàng</Label>
                                <Input
                                    id="customerName"
                                    value={customerInfo.name}
                                    readOnly
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Không thể chỉnh sửa tên khách hàng</p>
                            </div>

                            <div>
                                <Label htmlFor="customerPhone">Số điện thoại</Label>
                                <Input
                                    id="customerPhone"
                                    value={customerInfo.phone}
                                    onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="customerEmail">Email</Label>
                            <Input
                                id="customerEmail"
                                type="email"
                                value={customerInfo.email}
                                onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                            />
                        </div>

                        <div>
                            <Label htmlFor="customerAddress">Địa chỉ</Label>
                            <Textarea
                                id="customerAddress"
                                value={customerInfo.address}
                                onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                                rows={2}
                            />
                        </div>
                    </fieldset>

                    {/* Shipping Information */}
                    <fieldset className="border rounded-md p-4 mb-6">
                        <legend className="text-lg font-medium px-2">Thông tin giao hàng</legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label htmlFor="shippingMethod">Phương thức</Label>
                                <Select
                                    value={shippingInfo.method}
                                    onValueChange={(value) => setShippingInfo({...shippingInfo, method: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn phương thức" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Tiêu chuẩn</SelectItem>
                                        <SelectItem value="express">Nhanh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="shippingFee">Phí vận chuyển</Label>
                                <Input
                                    id="shippingFee"
                                    type="number"
                                    value={shippingInfo.fee}
                                    onChange={e => setShippingInfo({
                                        ...shippingInfo,
                                        fee: parseInt(e.target.value) || 0
                                    })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="shippingStatus">Trạng thái vận chuyển</Label>
                                <Select
                                    value={shippingInfo.status}
                                    onValueChange={(value) => setShippingInfo({...shippingInfo, status: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                                        <SelectItem value="processing">Đang xử lý</SelectItem>
                                        <SelectItem value="shipped">Đã giao cho vận chuyển</SelectItem>
                                        <SelectItem value="delivered">Đã giao hàng</SelectItem>
                                        <SelectItem value="failed">Thất bại</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="trackingNumber">Mã vận đơn</Label>
                                <Input
                                    id="trackingNumber"
                                    value={shippingInfo.trackingNumber}
                                    onChange={e => setShippingInfo({
                                        ...shippingInfo,
                                        trackingNumber: e.target.value
                                    })}
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Payment Information (Read-only) */}
                    <fieldset className="border rounded-md p-4 mb-6 bg-gray-50">
                        <legend className="text-lg font-medium px-2">Thông tin thanh toán (Không thể chỉnh sửa)</legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="paymentMethod">Phương thức</Label>
                                <Input
                                    id="paymentMethod"
                                    value={paymentInfo.method === "cod" ? "COD" :
                                           paymentInfo.method === "bank_transfer" ? "Chuyển khoản" :
                                           paymentInfo.method === "credit_card" ? "Thẻ tín dụng" :
                                           paymentInfo.method === "e_wallet" ? "Ví điện tử" :
                                           paymentInfo.method}
                                    readOnly
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
                                <Input
                                    id="paymentStatus"
                                    value={paymentInfo.status === "pending" ? "Chờ thanh toán" :
                                           paymentInfo.status === "paid" ? "Đã thanh toán" :
                                           paymentInfo.status === "failed" ? "Thất bại" :
                                           paymentInfo.status === "refunded" ? "Đã hoàn tiền" :
                                           paymentInfo.status}
                                    readOnly
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 italic">
                            Thông tin thanh toán chỉ có thể được thay đổi thông qua quy trình thanh toán riêng.
                        </p>
                    </fieldset>

                    {/* Order Status */}
                    <div className="mb-6">
                        <Label htmlFor="orderStatus">Trạng thái đơn hàng</Label>
                        <Select
                            value={orderStatus}
                            onValueChange={setOrderStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                <SelectItem value="completed">Hoàn thành</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <fieldset className="border rounded-md p-4 mb-6">
                        <legend className="text-lg font-medium px-2">Ghi chú</legend>

                        <div className="mb-4">
                            <Label htmlFor="customerNote">Ghi chú của khách hàng</Label>
                            <Textarea
                                id="customerNote"
                                value={notes.customerNote}
                                onChange={e => setNotes({...notes, customerNote: e.target.value})}
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="sellerNote">Ghi chú của nhà bán</Label>
                            <Textarea
                                id="sellerNote"
                                value={notes.sellerNote}
                                onChange={e => setNotes({...notes, sellerNote: e.target.value})}
                                rows={2}
                            />
                        </div>
                    </fieldset>

                    {/* Order Items (Now Editable with Add Product feature) */}
                    <fieldset className="border rounded-md p-4 mb-6">
                        <legend className="text-lg font-medium px-2">Sản phẩm trong đơn hàng</legend>

                        <div className="mb-4 flex justify-end">
                            <Button
                                onClick={openProductModal}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Thêm sản phẩm
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Sản phẩm</th>
                                        <th className="px-4 py-2 text-center">Số lượng</th>
                                        <th className="px-4 py-2 text-right">Giá</th>
                                        <th className="px-4 py-2 text-right">Thành tiền</th>
                                        <th className="px-4 py-2 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                                Không có sản phẩm nào trong đơn hàng
                                            </td>
                                        </tr>
                                    ) : (
                                        orderItems.map((item) => (
                                            <tr key={item._id} className="border-b">
                                                <td className="px-4 py-2">{item.name}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemQuantityChange(item._id, e.target.value)}
                                                        className="w-20 text-center mx-auto"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(item.price)}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(item.price * item.quantity)}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(item._id)}
                                                        disabled={orderItems.length <= 1}
                                                        className="h-8 px-3"
                                                    >
                                                        Xóa
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    <tr className="font-bold">
                                        <td colSpan="3" className="px-4 py-2 text-right">Tổng tiền sản phẩm:</td>
                                        <td className="px-4 py-2 text-right">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td colSpan="3" className="px-4 py-2 text-right">Phí vận chuyển:</td>
                                        <td className="px-4 py-2 text-right">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(shippingInfo.fee || 0)}
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr className="font-bold text-lg bg-gray-50">
                                        <td colSpan="3" className="px-4 py-3 text-right">Tổng cộng:</td>
                                        <td className="px-4 py-3 text-right">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(calculateUpdatedTotal())}
                                        </td>
                                        <td></td>
                                    </tr>
                                    {originalTotal !== calculateUpdatedTotal() && (
                                        <tr className="text-sm text-blue-600">
                                            <td colSpan="5" className="px-4 py-1 text-right italic">
                                                * Tổng tiền đã thay đổi từ {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(originalTotal)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            * Bạn có thể thêm sản phẩm mới hoặc chỉnh sửa số lượng sản phẩm hiện có
                        </p>
                    </fieldset>
                </div>

                {/* Footer with simple save button */}
                <div className="flex justify-end gap-2 border-t px-6 py-4">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleAdminSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 font-medium"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu đơn hàng'}
                    </Button>
                </div>
            </div>

            {/* Product Selection Modal - Enhanced UI with full product data */}
            {showProductModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Chọn sản phẩm cho đơn hàng</h3>
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="text-2xl text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="flex items-center mb-2">
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên, mã, danh mục hoặc nhãn hiệu..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full"
                                />
                                <Button
                                    className="ml-2 whitespace-nowrap"
                                    variant="outline"
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setProductInitialized(false);
                                        fetchProducts(1);
                                    }}
                                >
                                    Làm mới
                                </Button>
                            </div>
                            <div className="mt-2 flex justify-between">
                                <span className="text-sm text-gray-500">
                                    Tổng số: {availableProducts.length} sản phẩm
                                </span>
                                <span className="text-sm text-blue-600">
                                    Đã chọn: {selectedProducts.length} sản phẩm
                                </span>
                            </div>
                        </div>

                        <div
                            className="overflow-y-auto flex-grow p-4"
                            onScroll={(e) => {
                                // Load more when scrolling near bottom
                                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                if (scrollHeight - scrollTop <= clientHeight * 1.5) {
                                    loadMoreProducts();
                                }
                            }}
                        >
                            {productLoadError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200">
                                    {productLoadError}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="ml-2"
                                        onClick={() => {
                                            setProductLoadError("");
                                            fetchProducts(1);
                                        }}
                                    >
                                        Thử lại
                                    </Button>
                                </div>
                            )}

                            {isSearching ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="animate-spin inline-block w-6 h-6 border-2 border-t-transparent border-blue-600 rounded-full mb-2"></div>
                                    <p>Đang tải danh sách sản phẩm...</p>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    {searchTerm ? "Không tìm thấy sản phẩm phù hợp" : "Không có sản phẩm nào"}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {searchResults.map(product => {
                                            const isSelected = selectedProducts.some(p => p._id === product._id);
                                            const isInOrder = orderItems.some(item => item.productId === product._id);
                                            const existingItemQuantity = orderItems.find(item => item.productId === product._id)?.quantity || 0;

                                            return (
                                                <div
                                                    key={product._id}
                                                    className={`border rounded p-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
                                                        isSelected ? 'bg-blue-50 border-blue-300' :
                                                        isInOrder ? 'bg-green-50 border-green-300' :
                                                        'hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => toggleProductSelection(product)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Product Image */}
                                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-grow">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-grow">
                                                                    <div className="font-medium text-base line-clamp-2">
                                                                        {product.name}
                                                                    </div>

                                                                    <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-x-3">
                                                                        <span title={product._id}>Mã: {product._id.substring(0, 8)}...</span>

                                                                        {product.category && (
                                                                            <span>Loại: {product.category}</span>
                                                                        )}

                                                                        {product.brand && (
                                                                            <span>Nhãn hiệu: {product.brand}</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}} // Controlled component
                                                                    className="h-4 w-4 text-blue-600 mt-1 ml-2 flex-shrink-0"
                                                                />
                                                            </div>

                                                            {product.color && product.color.length > 0 && (
                                                                <div className="mt-1 flex items-center gap-1">
                                                                    <span className="text-xs text-gray-500">Màu:</span>
                                                                    {product.color.slice(0, 3).map((color, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                                                            style={{ backgroundColor: color }}
                                                                            title={color}
                                                                        />
                                                                    ))}
                                                                    {product.color.length > 3 && (
                                                                        <span className="text-xs text-gray-500">+{product.color.length - 3}</span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="mt-2 flex justify-between items-center">
                                                                <div className="font-semibold text-blue-600">
                                                                    {new Intl.NumberFormat("vi-VN", {
                                                                        style: "currency",
                                                                        currency: "VND",
                                                                    }).format(product.price)}
                                                                </div>

                                                                <div className={`text-sm ${
                                                                    product.stock > 10 ? 'text-green-600' :
                                                                    product.stock > 0 ? 'text-orange-500' :
                                                                    'text-red-500'
                                                                }`}>
                                                                    {product.stock > 0 ? `Còn lại: ${product.stock}` : 'Hết hàng'}
                                                                </div>
                                                            </div>

                                                            {isInOrder && (
                                                                <div className="mt-1 text-xs text-green-600">
                                                                    * Đã có trong đơn hàng (SL: {existingItemQuantity})
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {isLoadingMore && (
                                        <div className="text-center my-4">
                                            <div className="animate-spin inline-block w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                                            <p className="text-sm text-gray-500 mt-1">Đang tải thêm sản phẩm...</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t flex justify-between items-center">
                            <div className="text-sm">
                                {selectedProducts.length > 0 ? (
                                    <span className="text-blue-600">Đã chọn {selectedProducts.length} sản phẩm</span>
                                ) : (
                                    <span className="text-gray-500">Chưa có sản phẩm nào được chọn</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowProductModal(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={addSelectedProductsToOrder}
                                    disabled={selectedProducts.length === 0}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Thêm vào đơn hàng
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
