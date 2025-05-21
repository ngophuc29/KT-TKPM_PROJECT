// src/components/UserInfoModal.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

const UserInfoModal = ({ show, onHide, user, onEdit }) => {
    if (!user) return null;

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Thông tin cá nhân</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Họ tên:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>SĐT:</strong> {user.phone}</p>
                <p><strong>Địa chỉ:</strong> {user.address}</p>
                <p><strong>Ngày tạo:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onEdit}>
                    Chỉnh sửa
                </Button>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserInfoModal;
