import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ORDER_API_URL = "http://localhost:3000/api/orders";

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
            } catch (err) {
                setError("Lỗi khi lấy chi tiết đơn hàng");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrderDetail();
    }, [orderId]);

    // Admin-specific edit function
    const handleAdminSave = async () => {
        try {
            // Reset states
            setError("");
            setSaving(true);
            
            // Validation
            const validationErrors = [];
            if (!customerInfo.phone.trim()) validationErrors.push("Số điện thoại không được để trống");
            if (!customerInfo.address.trim()) validationErrors.push("Địa chỉ không được để trống");
            
            if (validationErrors.length > 0) {
                setError(validationErrors.join(", "));
                setSaving(false);
                return;
            }
            
            // Format data exactly as the backend expects it - keeping original name and payment info
            const updateData = {
                'customer.address': customerInfo.address,
                'customer.phone': customerInfo.phone,
                'customer.email': customerInfo.email,
                
                'shipping.method': shippingInfo.method,
                'shipping.fee': shippingInfo.fee,
                'shipping.status': shippingInfo.status,
                'shipping.trackingNumber': shippingInfo.trackingNumber,
                
                'status': orderStatus,
                
                'notes.customerNote': notes.customerNote,
                'notes.sellerNote': notes.sellerNote
            };
            
            console.log("Sending update with properly formatted data");
            
            // This matches the exact format your backend is expecting
            const updateDataString = JSON.stringify(updateData);
            const encodedData = encodeURIComponent(updateDataString);
            
            // Make the request using the format we see in your payment service
            const response = await axios.put(
                `${ORDER_API_URL}/update/${orderId}/${encodedData}`
            );
            
            console.log("Update response:", response.data);
            
            // Notify the parent component to refresh the data
            if (onOrderUpdated) {
                onOrderUpdated();
            }
            
            // Show success message
            alert("Đơn hàng đã được cập nhật thành công!");
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            
            // Provide a helpful error message
            if (error.response?.data?.message) {
                setError(`Lỗi: ${error.response.data.message}`);
            } else {
                setError(`Không thể cập nhật đơn hàng: ${error.message}`);
            }
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

                    {/* Order Items (Read-only for now) */}
                    <fieldset className="border rounded-md p-4 mb-6">
                        <legend className="text-lg font-medium px-2">Sản phẩm trong đơn hàng</legend>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Sản phẩm</th>
                                        <th className="px-4 py-2 text-left">Số lượng</th>
                                        <th className="px-4 py-2 text-left">Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order?.items?.map((item) => (
                                        <tr key={item._id} className="border-b">
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2">{item.quantity}</td>
                                            <td className="px-4 py-2">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            * Chỉnh sửa sản phẩm sẽ được cập nhật trong phiên bản tiếp theo
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
        </div>
    );
}
