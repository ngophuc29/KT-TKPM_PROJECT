import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Spinner,
    Table,
    Row,
    Col,
    Badge,
    Container,
} from "react-bootstrap";
import axios from "axios";

export default function OrderDetailModal({ show, onHide, orderId }) {
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!show) return;
        setLoading(true);
        setError("");
        axios
            .get(`${import.meta.env.VITE_APP_ORDER_API}/${orderId}`)
            .then((res) => setOrderDetail(res.data))
            .catch(() => setError("Lỗi khi lấy chi tiết đơn hàng"))
            .finally(() => setLoading(false));
    }, [show, orderId]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);

    const getStatusVariant = (status) => {
        switch (status) {
            case "Đã giao":
                return "success";
            case "Đang xử lý":
                return "warning";
            case "Đã hủy":
                return "danger";
            default:
                return "secondary";
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            backdrop="static"
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <strong>Chi tiết đơn hàng</strong>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: "1.5rem 2rem" }}>
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <p className="text-danger text-center">{error}</p>
                ) : (
                    <Container fluid>
                        <div className="mb-4">
                            <h6 className="text-muted">Mã đơn hàng:</h6>
                            <h5 className="text-primary">{orderDetail._id}</h5>
                        </div>

                        <div className="mb-4">
                            <h5 className="mb-3">👤 Thông tin khách hàng</h5>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Tên:</strong> {orderDetail.customer?.name}</p>
                                    <p><strong>SĐT:</strong> {orderDetail.customer?.phone}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Email:</strong> {orderDetail.customer?.email}</p>
                                    <p><strong>Địa chỉ:</strong> {orderDetail.customer?.address}</p>
                                </Col>
                            </Row>
                        </div>

                        <div className="mb-4">
                            <h5 className="mb-3">🛒 Danh sách sản phẩm</h5>
                            <Table bordered hover responsive>
                                <thead className="table-light">
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-center">Số lượng</th>
                                        <th className="text-end">Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetail.items?.map((item) => (
                                        <tr key={item._id}>
                                            <td>{item.name}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end">{formatCurrency(item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        <div className="mb-4">
                            <h5 className="mb-3">📦 Thông tin đơn hàng</h5>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Trạng thái:</strong>{" "}
                                        <Badge bg={getStatusVariant(orderDetail.status)}>
                                            {orderDetail.status}
                                        </Badge>
                                    </p>
                                    <p><strong>Ngày tạo:</strong>{" "}
                                        {new Date(orderDetail.createdAt).toLocaleString()}
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Tổng tiền:</strong>{" "}
                                        <span className="text-success fw-bold">
                                            {formatCurrency(orderDetail.finalTotal)}
                                        </span>
                                    </p>
                                </Col>
                            </Row>
                        </div>

                        <div>
                            <h5 className="mb-3">📝 Ghi chú</h5>
                            <p><strong>Khách hàng:</strong> {orderDetail.notes?.customerNote || "Không có"}</p>
                            <p><strong>Nhà bán:</strong> {orderDetail.notes?.sellerNote || "Không có"}</p>
                        </div>
                    </Container>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
