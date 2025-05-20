import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ORDER_API_URL = "https://kt-tkpm-project-api-getaway.onrender.com/api/orders";

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
    // Add state for order items
    const [orderItems, setOrderItems] = useState([]);
    // Add state for tracking original total
    const [originalTotal, setOriginalTotal] = useState(0);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await axios.get(`${ORDER_API_URL}/${orderId}`);
                const orderData = response.data;
                setOrder(orderData);
                
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

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Prepare updated order data
            const updatedOrder = {
                customer: customerInfo,
                shipping: shippingInfo,
                // Payment info is not included for updates
                status: orderStatus,
                notes: notes
            };
            
            // Send update request
            await axios.put(`${ORDER_API_URL}/admin/edit/${orderId}`, updatedOrder);
            
            // Notify parent component
            if (onOrderUpdated) {
                onOrderUpdated();
            }
            
            // Close modal
            onClose();
        } catch (err) {
            setError("Lỗi khi cập nhật đơn hàng");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Add function to handle item quantity change
    const handleItemQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;
        
        setOrderItems(items => 
            items.map(item => 
                item._id === itemId ? { ...item, quantity: parseInt(newQuantity) } : item
            )
        );
    };

    // Add function to handle item removal
    const handleRemoveItem = (itemId) => {
        if (orderItems.length <= 1) {
            setError("Đơn hàng phải có ít nhất một sản phẩm");
            return;
        }
        
        setOrderItems(items => items.filter(item => item._id !== itemId));
    };

    // Add function to calculate new total
    const calculateUpdatedTotal = () => {
        const itemsTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return itemsTotal + (shippingInfo.fee || 0);
    };

    // Admin-specific edit function
    const handleAdminEdit = async () => {
        // Reset error state and set initial progress
        setError("");
        setSaving(true);
        setSaveProgress(10);
        
        // Validate required fields
        if (!customerInfo.phone.trim()) {
            setError("Số điện thoại không được để trống");
            setSaving(false);
            setSaveProgress(0);
            return;
        }

        if (!customerInfo.address.trim()) {
            setError("Địa chỉ không được để trống");
            setSaving(false);
            setSaveProgress(0);
            return;
        }

        if (orderItems.length === 0) {
            setError("Đơn hàng phải có ít nhất một sản phẩm");
            setSaving(false);
            setSaveProgress(0);
            return;
        }

        try {
            setSaveProgress(30);
            console.log("Admin đang chỉnh sửa đơn hàng:", orderId);
            
            // Add admin metadata for tracking changes
            const adminMetadata = {
                editedBy: "admin",
                editedAt: new Date().toISOString(),
                previousStatus: order.status
            };
            
            // Calculate the updated total
            const updatedTotal = calculateUpdatedTotal();
            
            // Prepare updated order data - include admin metadata
            // Keep original customer name and don't include payment info
            const updateData = {
                customer: {
                    ...customerInfo,
                    name: order.customer.name // Preserve original name
                },
                shipping: shippingInfo,
                status: orderStatus,
                notes: notes,
                items: orderItems, // Include the updated items
                finalTotal: updatedTotal, // Include the updated total
                // Don't include payment to preserve original values
                adminMeta: adminMetadata
            };
            
            setSaveProgress(50);
            
            // Convert to the format expected by the API
            const updateDataString = JSON.stringify(updateData);
            const encodedData = encodeURIComponent(updateDataString);
            
            // Try the update API endpoint with the encoded data
            try {
                await axios.put(`${ORDER_API_URL}/update/${orderId}/${encodedData}`);
            } catch (updateError) {
                console.warn("Update endpoint failed, trying admin edit endpoint");
                setSaveProgress(60);
                // Fallback to admin edit endpoint if the first one fails
                await axios.put(`${ORDER_API_URL}/admin/edit/${orderId}`, updateData);
            }
            
            setSaveProgress(80);
            
            // Special handling for status transitions
            if (orderStatus === "completed" && order.status !== "completed") {
                try {
                    // If admin completes the order, update shipping status too
                    await axios.put(`${ORDER_API_URL}/shipping/${orderId}`, {
                        status: "delivered",
                        trackingNumber: shippingInfo.trackingNumber
                    });
                } catch (shippingError) {
                    console.error("Could not update shipping status:", shippingError);
                    // Continue with the process, this is just an enhancement
                }
            }
            
            setSaveProgress(90);
            
            // Notify parent component
            if (onOrderUpdated) {
                onOrderUpdated();
            }
            
            setSaveProgress(100);
            
            // Show success message
            alert("Đơn hàng đã được cập nhật thành công!");
            
            // Close modal after a short delay to show 100% progress
            setTimeout(() => {
                onClose();
            }, 500);
            
        } catch (err) {
            console.error("Chi tiết lỗi:", err.response?.data || err.message);
            setError(`Lỗi khi cập nhật đơn hàng: ${err.response?.data?.message || err.message}`);
            setSaveProgress(0);
        } finally {
            setSaving(false);
        }
    };

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
                                    className="h-full bg-blue-600 rounded-full transition-all duration-300" 
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
                                        <SelectItem value="processing">Đang xử lý</SelectItem>
                                        <SelectItem value="shipped">Đã giao cho vận chuyển</SelectItem>
                                        <SelectItem value="delivered">Đã giao hàng</SelectItem>
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

                    {/* Order Items (Now Editable) */}
                    <fieldset className="border rounded-md p-4 mb-6">
                        <legend className="text-lg font-medium px-2">Sản phẩm trong đơn hàng</legend>
                        
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
                                    {orderItems.map((item) => (
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
                                    ))}
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
                    </fieldset>
                </div>

                {/* Footer with action buttons */}
                <div className="flex justify-end gap-2 border-t px-6 py-4">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={handleAdminEdit}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 font-medium"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu đơn hàng'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
