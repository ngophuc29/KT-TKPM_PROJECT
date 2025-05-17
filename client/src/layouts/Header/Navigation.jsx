// Navigation.jsx
import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import { BiUser } from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation.css";
import UserInfoModal from "../../pages/User/UserInfoModal";
import EditUserModal from "../../pages/User/EditUserModal";
// OrderModal mặc định của bạn:
import OrderModal from "../../pages/User/OrderModal";

const Navigation = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserInfoModal, setShowUserInfoModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const categories = [
        "Laptops",
        "Desktop PCs",
        "Networking Devices",
        "Printers & Scanners",
        "PC Parts",
        "All Other Products",
        "Repairs",
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        setShowUserMenu(false);
        navigate("/login");
    };

    // Khi mở OrderModal thì ẩn dropdown
    const openOrderModal = () => {
        setShowUserMenu(false);
        setShowOrderModal(true);
    };

    // Khi đóng OrderModal: chỉ đóng modal, không reset dropdown
    const closeOrderModal = () => {
        setShowOrderModal(false);
    };

    const sampleUser = {
        id: 1,
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0912345678",
        address: "123 Đường Lê Lợi, Q.1, TP.HCM",
        avatar: "https://i.pravatar.cc/150?img=1",
    };
    const [user, setUser] = useState(sampleUser);

    const handleSaveUser = (updatedUser) => {
        setUser(updatedUser);
        setShowEditUserModal(false);
    };

    return (
        <>
            <div
                className="container-fluid"
                style={{ boxShadow: "0 2px 5px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}
            >
                <div
                    className="container"
                    style={{
                        width: "100%",
                        padding: "10px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Logo */}
                    <Link to="/">
                        <img
                            src={Logo}
                            alt="Logo"
                            style={{
                                width: 50,
                                height: 50,
                                objectFit: "contain",
                                cursor: "pointer",
                            }}
                        />
                    </Link>

                    {/* Categories or Search */}
                    {!showSearch ? (
                        <div style={{ display: "flex", gap: 20, flexGrow: 1, justifyContent: "center" }}>
                            {categories.map((cat, idx) => (
                                <Link
                                    to="/catalog"
                                    key={idx}
                                    style={{ fontSize: 14, fontWeight: 600, color: "#000" }}
                                    onMouseOver={(e) => (e.target.style.color = "#007bff")}
                                    onMouseOut={(e) => (e.target.style.color = "#000")}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#fff",
                                borderRadius: 25,
                                padding: "10px 20px",
                                flexGrow: 1,
                                marginLeft: 20,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            }}
                        >
                            <CiSearch size={20} color="#007bff" style={{ marginRight: 10 }} />
                            <input
                                type="text"
                                placeholder="Search entire store here..."
                                autoFocus
                                style={{
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    backgroundColor: "transparent",
                                    fontSize: 14,
                                }}
                            />
                        </div>
                    )}

                    {/* Icons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: 20 }}>
                        {showSearch ? (
                            <AiOutlineClose size={24} color="#007bff" onClick={() => setShowSearch(false)} style={{ cursor: "pointer" }} />
                        ) : (
                            <CiSearch size={24} onClick={() => setShowSearch(true)} style={{ cursor: "pointer" }} />
                        )}

                        <FiShoppingCart size={24} onClick={() => navigate("/cart")} style={{ cursor: "pointer" }} />

                        <div style={{ position: "relative" }}>
                            <BiUser
                                size={24}
                                color="#007bff"
                                onClick={() => setShowUserMenu((m) => !m)}
                                style={{ cursor: "pointer" }}
                            />
                            {showUserMenu && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 35,
                                        right: 0,
                                        backgroundColor: "#fff",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                                        borderRadius: 8,
                                        zIndex: 999,
                                        width: 160,
                                    }}
                                >
                                    <div
                                        className="user-menu-item"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            setShowUserInfoModal(true);
                                        }}
                                    >
                                        Xem thông tin
                                    </div>
                                    <div
                                        className="user-menu-item"
                                        onClick={openOrderModal}
                                    >
                                        Đơn hàng
                                    </div>
                                    <div
                                        className="user-menu-item"
                                        style={{ color: "red" }}
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </div>
                                </div>
                            )}
                        </div>

                        {!token && (
                            <>
                                <button
                                    className="btn btn-outline-primary"
                                    style={{ fontSize: 14, borderRadius: 20 }}
                                    onClick={() => navigate("/login")}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    className="btn btn-outline-primary"
                                    style={{ fontSize: 14, borderRadius: 20 }}
                                    onClick={() => navigate("/signup")}
                                >
                                    Đăng ký
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* User Info Modal */}
            <UserInfoModal
                show={showUserInfoModal}
                onHide={() => setShowUserInfoModal(false)}
                user={user}
                onEdit={() => {
                    setShowUserInfoModal(false);
                    setShowEditUserModal(true);
                }}
            />

            {/* Edit User Modal */}
            <EditUserModal
                show={showEditUserModal}
                onHide={() => setShowEditUserModal(false)}
                onBack={() => {
                    setShowEditUserModal(false);
                    setShowUserInfoModal(true);
                }}
                user={user}
                onSave={handleSaveUser}
            />

            {/* Order Modal */}
            <OrderModal show={showOrderModal} onHide={closeOrderModal} />
        </>
    );
};

export default Navigation;
