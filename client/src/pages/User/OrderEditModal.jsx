import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import axios from "axios";

export function OrderEditModal({ show, onHide, orderId, onUpdated }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
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
            await axios.put(`http://localhost:3000/api/orders/${orderId}`, {
                customer: {
                    name: formData.customerName,
                    address: formData.customerAddress,
                    phone: formData.customerPhone,
                },
                notes: {
                    customerNote: formData.customerNote,
                },
            });
            onUpdated();
            onHide();
        } catch {
            setError("Lỗi khi lưu thay đổi");
        } finally {
            setSaving(false);
        }
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
                    <Form onSubmit={handleSubmit}>
                        {error && <p className="text-danger">{error}</p>}

                        <Form.Group className="mb-3">
                            <Form.Label><strong>Tên khách hàng</strong></Form.Label>
                            <Form.Control
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Nhập tên khách hàng"
                                required
                            />
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

                        <div className="d-flex justify-content-end">
                            <Button
                                variant="secondary"
                                onClick={onHide}
                                disabled={saving}
                                className="me-2"
                            >
                                Hủy
                            </Button>
                            <Button type="submit" variant="primary" disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
}
