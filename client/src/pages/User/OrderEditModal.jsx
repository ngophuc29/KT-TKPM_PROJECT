import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";

export function OrderEditModal({ show, onHide, orderId, onUpdated }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [formData, setFormData] = useState({
        customerName: "",
        customerAddress: "",
        customerPhone: "",
        customerNote: "",
    });

    useEffect(() => {
        if (!show) return;
        setLoading(true);
        setError("");
        axios
            .get(`http://localhost:3000/api/orders/${orderId}`)
            .then((res) => {
                const d = res.data;
                setFormData({
                    customerName: d.customer?.name || "",
                    customerAddress: d.customer?.address || "",
                    customerPhone: d.customer?.phone || "",
                    customerNote: d.notes?.customerNote || "",
                });
                setOrderStatus(d.status || "");
            })
            .catch(() => setError("Lỗi khi tải thông tin"))
            .finally(() => setLoading(false));
    }, [show, orderId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Prepare the update data object
            const updateData = {
                customer: {
                    name: formData.customerName,
                    address: formData.customerAddress,
                    phone: formData.customerPhone,
                },
                notes: {
                    customerNote: formData.customerNote,
                },
            };
            
            // Convert the update data to a JSON string and encode for URL
            const encodedUpdateData = encodeURIComponent(JSON.stringify(updateData));
            
            // Use the correct endpoint with URL parameters
            await axios.put(`http://localhost:3000/api/orders/update/${orderId}/${encodedUpdateData}`);
            
            onUpdated();
            onHide();
        } catch (error) {
            console.error("Update error:", error);
            setError("Lỗi khi lưu thay đổi: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Completely standalone cancel function that uses fetch instead of axios
    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
            return;
        }
        
        setCancelling(true);
        setError("");
        
        try {
            // Set timeout to abort after 10 seconds
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(`http://localhost:3000/api/orders/cancel/${orderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Pre-update UI immediately for better perceived performance
            setOrderStatus("cancelled");
            
            // Parse response in background
            response.json().then(responseData => {
                console.log("Cancel response:", responseData);
                onUpdated();
                alert("Đơn hàng đã được hủy thành công");
                onHide();
            }).catch(err => {
                console.error("Error parsing JSON:", err);
                // If JSON parsing fails, still consider it successful if status was OK
                if (response.ok) {
                    onUpdated();
                    alert("Đơn hàng đã được hủy thành công");
                    onHide();
                }
            });
        } catch (error) {
            console.error("Cancel error:", error);
            alert(`Không thể hủy đơn hàng: ${error.message}`);
            setError(`Lỗi khi hủy đơn hàng: ${error.message}`);
            setCancelling(false);
        }
    };
    
    // Create a separate cancel button component that's completely detached from the form
    const CancelOrderButton = () => {
        if (orderStatus !== "pending") return null;
        
        return (
            <div className="mb-4">
                <Button 
                    variant="danger" 
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-100"
                >
                    {cancelling ? "Đang hủy đơn hàng..." : "Hủy đơn hàng này"}
                </Button>
                <small className="text-muted d-block text-center mt-1">
                    Hủy đơn hàng sẽ hoàn lại số lượng sản phẩm vào kho
                </small>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} size="md" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>✏️ Chỉnh sửa thông tin đơn hàng</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: "1.5rem 2rem" }}>
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        {error && <Alert variant="danger">{error}</Alert>}
                        
                        <div className="mb-4 p-3 bg-light rounded">
                            <h5 className="mb-1">Mã đơn hàng:</h5>
                            <div className="d-flex align-items-center">
                                <span className="fs-5 fw-bold text-primary">{orderId}</span>
                                <span className="ms-2 badge bg-secondary">ID</span>
                            </div>
                            <div className="mt-2">
                                <span className="me-2">Trạng thái:</span>
                                <span className={`badge ${
                                    orderStatus === "pending" ? "bg-warning" : 
                                    orderStatus === "confirmed" ? "bg-info" : 
                                    orderStatus === "shipping" ? "bg-primary" : 
                                    orderStatus === "completed" ? "bg-success" : 
                                    orderStatus === "cancelled" ? "bg-danger" : 
                                    "bg-secondary"
                                }`}>
                                    {orderStatus === "pending" ? "Chờ xác nhận" : 
                                     orderStatus === "confirmed" ? "Đã xác nhận" :
                                     orderStatus === "shipping" ? "Đang vận chuyển" :
                                     orderStatus === "completed" ? "Hoàn thành" :
                                     orderStatus === "cancelled" ? "Đã hủy" :
                                     orderStatus}
                                </span>
                            </div>
                        </div>

                        {/* Use the completely separate component for cancellation */}
                        <CancelOrderButton />

                        {/* Only show the form if the order isn't cancelled */}
                        {orderStatus !== "cancelled" && (
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Tên khách hàng</strong></Form.Label>
                                    <Form.Control
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên khách hàng"
                                        disabled
                                        className="bg-light"
                                    />
                                    <Form.Text className="text-muted">
                                        Tên khách hàng không thể thay đổi sau khi đặt hàng.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Địa chỉ</strong></Form.Label>
                                    <Form.Control
                                        name="customerAddress"
                                        value={formData.customerAddress}
                                        onChange={handleChange}
                                        placeholder="Nhập địa chỉ"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Số điện thoại</strong></Form.Label>
                                    <Form.Control
                                        name="customerPhone"
                                        value={formData.customerPhone}
                                        onChange={handleChange}
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label><strong>Ghi chú từ khách hàng</strong></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="customerNote"
                                        value={formData.customerNote}
                                        onChange={handleChange}
                                        placeholder="Nhập ghi chú (nếu có)"
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-end mt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={onHide}
                                        disabled={saving || cancelling}
                                        className="me-2"
                                    >
                                        Đóng
                                    </Button>
                                    
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        disabled={saving || cancelling}
                                    >
                                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                        
                        {/* Show a message if the order is cancelled */}
                        {orderStatus === "cancelled" && (
                            <div className="text-center p-3 border rounded bg-light">
                                <p className="mb-0">Đơn hàng đã bị hủy. Không thể chỉnh sửa.</p>
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
