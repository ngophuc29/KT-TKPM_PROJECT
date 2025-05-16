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
import OrderModal from "../../pages/User/OrderModal";
    const Navigation = () => {
        const [showSearch, setShowSearch] = useState(false);
        const [showUserMenu, setShowUserMenu] = useState(false);
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
        const [showUserInfoModal, setShowUserInfoModal] = useState(false);
        const [showEditUserModal, setShowEditUserModal] = useState(false);
        const [showOrderModal, setShowOrderModal] = useState(false);
        const sampleUser = {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            phone: "0912345678",
            address: "123 Đường Lê Lợi, Q.1, TP.HCM",
            avatar: "https://i.pravatar.cc/150?img=1"
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
                style={{
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    backgroundColor: '#fff',
                }}>
                <div
                    className="container"
                    style={{
                        width: "100%",
                        padding: "10px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                    {/* Logo */}
                    <Link to="/">
                        <img
                            src={Logo}
                            alt="Logo"
                            style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "contain",
                                backgroundColor: "#fff",
                                cursor: "pointer"
                            }}
                        />
                    </Link>

                    {/* Conditional Rendering */}
                    {!showSearch ? (
                        <div style={{
                            display: "flex",
                            gap: "20px",
                            flexGrow: 1,
                            justifyContent: "center",
                        }}>
                            {categories.map((category, index) => (
                                <Link to="/catalog"
                                    key={index}
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        color: "#000",
                                    }}
                                    onMouseOver={(e) => (e.target.style.color = "#007bff")}
                                    onMouseOut={(e) => (e.target.style.color = "#000")}
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#fff",
                            borderRadius: "25px",
                            padding: "10px 20px",
                            flexGrow: 1,
                            marginLeft: "20px",
                            transition: "all 0.3s ease-in-out",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}>
                            <CiSearch size={20} color="#007bff" style={{ marginRight: "10px" }} />
                            <input
                                type="text"
                                placeholder="Search entire store here..."
                                style={{
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    fontSize: "14px",
                                    backgroundColor: "transparent",
                                }}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Icons */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        marginLeft: "20px",
                        position: "relative",
                    }}>
                        {showSearch ? (
                            <AiOutlineClose
                                size={24}
                                color="#007bff"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowSearch(false)}
                            />
                        ) : (
                            <CiSearch
                                size={24}
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowSearch(true)}
                            />
                        )}
                        <FiShoppingCart size={24} style={{ cursor: "pointer" }} onClick={() => navigate('/cart')} />

                            {/* {token ? ( */}
                                <div style={{ position: "relative" }}>
                                    <BiUser
                                        size={24}
                                        color="#007bff"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowUserMenu((prev) => !prev)}
                                    />
                                    {showUserMenu && (
                                        <div style={{
                                            position: "absolute",
                                            top: "35px",
                                            right: 0,
                                            backgroundColor: "#fff",
                                            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                                            borderRadius: "8px",
                                            zIndex: 999,
                                            width: "160px"
                                        }}>
                                            <div
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    setShowUserInfoModal(true);
                                                }}
                                                className="user-menu-item"
                                            >
                                                Xem thông tin
                                            </div>
                                            <div
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                setShowOrderModal(true); // mở modal đơn hàng
                                                  }}
                                                className="user-menu-item"
                                            >
                                                Đơn hàng
                                            </div>
                                            <div
                                                onClick={handleLogout}
                                                className="user-menu-item"
                                                style={{ color: "red", borderBottom: "none" }}
                                            >
                                                Đăng xuất
                                            </div>
                                        </div>
                                    )}
                                </div>
                        {/* ) : ( */}
                                <>
                                    <button
                                        className="btn btn-outline-primary"
                                        style={{ fontSize: "14px", borderRadius: "20px" }}
                                        onClick={() => navigate('/login')}
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        className="btn btn-outline-primary"
                                        style={{ fontSize: "14px", borderRadius: "20px" }}
                                        onClick={() => navigate('/signup')}
                                    >
                                        Đăng ký
                                    </button>
                                </>
                            {/*   )} */}

                    </div>
                </div>
                </div>
                
                <UserInfoModal
                    show={showUserInfoModal}
                    onHide={() => setShowUserInfoModal(false)}
                    user={user}
                    onEdit={() => {
                        setShowUserInfoModal(false);
                        setShowEditUserModal(true);
                    }}
                />

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
                <OrderModal show={showOrderModal} onHide={() => setShowOrderModal(false)} />
            </>
        );
    };

    export default Navigation;
