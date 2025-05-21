// OrderModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, ListGroup, Badge, Spinner } from "react-bootstrap";
import { OrderEditModal } from "./OrderEditModal";
import OrderDetailModal from "./OrderDetailModal";
import { getUserId } from "../../utils/getUserId";

const tabs = [
    { key: "all", label: "Tất cả đơn hàng" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "completed", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
];

const statusColors = {
    pending: "warning",
    confirmed: "info",
    completed: "success",
    cancelled: "danger",
};

const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
};

export default function OrderModal({ show, onHide }) {
    const [activeTab, setActiveTab] = useState("all");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [mode, setMode] = useState(null); // "detail" | "edit" | null

    // fetch danh sách đơn
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const userId = getUserId();
            if (!userId) {
                setError("Vui lòng đăng nhập để xem đơn hàng");
                return;
            }
            const res = await fetch(`${import.meta.env.VITE_APP_ORDER_API}/user/${userId}`);
            if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu đơn hàng");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError(err.message || "Lỗi mạng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) fetchOrders();
    }, [show]);

    // hủy đơn
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn này không?")) return;
        setCancelingId(orderId);
        try {
            const res = await fetch(`${import.meta.env.VITE_APP_ORDER_API}/cancel/${orderId}`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Hủy đơn thất bại");
            alert("Hủy đơn thành công!");
            fetchOrders();
        } catch (err) {
            alert(err.message || "Lỗi khi hủy đơn!");
        } finally {
            setCancelingId(null);
        }
    };

    const filteredOrders = orders.filter((o) =>
        activeTab === "all" ? true : o.status === activeTab
    );

    // callback sau khi chỉnh sửa xong
    const handleOrderUpdated = () => {
        fetchOrders();
        setMode(null);
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Quản lý đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ display: "flex", minHeight: "420px" }}>
                    {/* Sidebar tabs */}
                    <div style={{ width: 220, borderRight: "1px solid #ddd", paddingRight: 15 }}>
                        <ListGroup variant="flush">
                            {tabs.map((tab) => (
                                <ListGroup.Item
                                    key={tab.key}
                                    action
                                    active={activeTab === tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: 8,
                                        marginBottom: 8,
                                        fontWeight: activeTab === tab.key ? 600 : 500,
                                        backgroundColor: activeTab === tab.key ? "#007bff" : "transparent",
                                        color: activeTab === tab.key ? "#fff" : "#333",
                                        transition: "background-color 0.3s",
                                    }}
                                >
                                    {tab.label}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>

                    {/* Danh sách đơn */}
                    <div
                        style={{
                            flexGrow: 1,
                            paddingLeft: 25,
                            overflowY: "auto",
                            maxHeight: 400,
                        }}
                    >
                        {loading ? (
                            <div style={{ textAlign: "center", marginTop: 100 }}>
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : error ? (
                            <p style={{ color: "red", textAlign: "center", marginTop: 40 }}>
                                {error}
                            </p>
                        ) : filteredOrders.length === 0 ? (
                            <p style={{ fontStyle: "italic", color: "#666", textAlign: "center", marginTop: 40 }}>
                                Không có đơn hàng trong mục này.
                            </p>
                        ) : (
                            filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    style={{
                                        padding: "15px 20px",
                                        marginBottom: 15,
                                        borderRadius: 12,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        backgroundColor: "#fff",
                                        transition: "transform 0.2s",
                                    }}
                                >
                                    <div>
                                        <p><strong>Mã đơn:</strong> {order._id.slice(-6).toUpperCase()}</p>
                                        <p><strong>Khách hàng:</strong> {order.customer?.name}</p>
                                        <p>
                                            <strong>Ngày đặt:</strong>{" "}
                                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontWeight: 600 }}>
                                            {order.finalTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                        </p>
                                        <Badge bg={statusColors[order.status] || "secondary"}>
                                            {statusLabels[order.status] || order.status}
                                        </Badge>
                                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => {
                                                    setSelectedOrderId(order._id);
                                                    setMode("detail");
                                                }}
                                            >
                                                Xem chi tiết
                                            </Button>

                                            {order.status === "pending" && (
                                                <Button
                                                    size="sm"
                                                    variant="warning"
                                                    onClick={() => {
                                                        setSelectedOrderId(order._id);
                                                        setMode("edit");
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            )}

                                            {order.status === "pending" && (
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    disabled={cancelingId === order._id}
                                                    onClick={() => handleCancelOrder(order._id)}
                                                >
                                                    {cancelingId === order._id ? (
                                                        <>
                                                            <Spinner animation="border" size="sm" /> Đang hủy...
                                                        </>
                                                    ) : (
                                                        "Hủy đơn"
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal chi tiết */}
            {mode === "detail" && (
                <OrderDetailModal
                    show={true}
                    onHide={() => setMode(null)}
                    orderId={selectedOrderId}
                />
            )}

            {/* Modal chỉnh sửa */}
            {mode === "edit" && (
                <OrderEditModal
                    show={true}
                    onHide={() => setMode(null)}
                    orderId={selectedOrderId}
                    onUpdated={handleOrderUpdated}
                />
            )}
        </>
    );
}
