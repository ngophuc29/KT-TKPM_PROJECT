import React, { useState } from "react";
import { Modal, Button, ListGroup, Badge } from "react-bootstrap";

const ordersSample = [
    {
        id: "ORD001",
        customerName: "Nguyễn Văn A",
        status: "Chờ xác nhận",
        date: "2025-05-10",
        total: 1200000,
    },
    {
        id: "ORD002",
        customerName: "Trần Thị B",
        status: "Chờ giao",
        date: "2025-05-11",
        total: 2300000,
    },
    {
        id: "ORD003",
        customerName: "Lê Văn C",
        status: "Đã nhận",
        date: "2025-05-09",
        total: 1500000,
    },
    {
        id: "ORD004",
        customerName: "Phạm Thị D",
        status: "Chờ xác nhận",
        date: "2025-05-15",
        total: 750000,
    },
];

const tabs = [
    { key: "all", label: "Tất cả đơn hàng" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "shipping", label: "Chờ giao" },
    { key: "received", label: "Đã nhận" },
];

const statusColors = {
    "Chờ xác nhận": "warning",
    "Chờ giao": "info",
    "Đã nhận": "success",
};

const OrderModal = ({ show, onHide }) => {
    const [activeTab, setActiveTab] = useState("all");

    const filteredOrders = ordersSample.filter((order) => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return order.status === "Chờ xác nhận";
        if (activeTab === "shipping") return order.status === "Chờ giao";
        if (activeTab === "received") return order.status === "Đã nhận";
        return false;
    });

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Quản lý đơn hàng</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ display: "flex", minHeight: "420px" }}>
                {/* Sidebar tabs */}
                <div
                    style={{
                        width: "220px",
                        borderRight: "1px solid #ddd",
                        paddingRight: "15px",
                    }}
                >
                    <ListGroup variant="flush">
                        {tabs.map((tab) => (
                            <ListGroup.Item
                                key={tab.key}
                                action
                                active={activeTab === tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    cursor: "pointer",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                    fontWeight: activeTab === tab.key ? "600" : "500",
                                    backgroundColor:
                                        activeTab === tab.key ? "#007bff" : "transparent",
                                    color: activeTab === tab.key ? "#fff" : "#333",
                                    transition: "background-color 0.3s",
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = "#f0f8ff";
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                {tab.label}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>

                {/* Content: list đơn hàng */}
                <div
                    style={{
                        flexGrow: 1,
                        paddingLeft: "25px",
                        overflowY: "auto",
                        maxHeight: "400px",
                    }}
                >
                    {filteredOrders.length === 0 ? (
                        <p
                            style={{
                                fontStyle: "italic",
                                color: "#666",
                                textAlign: "center",
                                marginTop: "40px",
                                fontSize: "16px",
                            }}
                        >
                            Không có đơn hàng nào trong mục này.
                        </p>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                style={{
                                    padding: "15px 20px",
                                    marginBottom: "15px",
                                    borderRadius: "12px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    backgroundColor: "#fff",
                                    transition: "transform 0.2s",marginRight: "20px"
                                }}
                                
                            >
                                <div style={{ lineHeight: 1.5 }}>
                                    <div>
                                        <strong>Mã đơn:</strong> {order.id}
                                    </div>
                                    <div>
                                        <strong>Khách hàng:</strong> {order.customerName}
                                    </div>
                                    <div>
                                        <strong>Ngày đặt:</strong> {order.date}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        textAlign: "right",
                                        minWidth: "120px",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    <div style={{ marginBottom: "6px", fontWeight: "600" }}>
                                        {order.total.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </div>
                                    <Badge
                                        bg={statusColors[order.status]}
                                        style={{ fontSize: "0.9em", padding: "6px 12px" }}
                                    >
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} style={{ borderRadius: "20px" }}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default OrderModal;
