// Navigation.jsx
import React, { useState, useEffect, useRef } from "react";
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
import axios from "axios";
import authorizedAxiosInstance from '../../utils/authorizedAxios';
import { handleLogoutAPI } from "../../apis";
import { getUserId } from "../../utils/getUserId";
const Navigation = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserInfoModal, setShowUserInfoModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // States cho chức năng tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    const searchRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const categories = [
        "Custome Builds", "MSI Laptops", "Desktops", "Gaming Monitors",
    ];
    const fetchUserInfo = async () => {
        try {
            const res = await authorizedAxiosInstance.get('http://localhost:3000/api/auth/users');
            setUser(res.data);
        } catch (err) {
            console.error("Lỗi lấy thông tin user:", err);
        }
    };
    const handleLogout = () => {
        handleLogoutAPI();
        setShowUserMenu(false);
        navigate("/login");
    };

    const openOrderModal = () => {
        setShowUserMenu(false);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
    };

    // const sampleUser = {
    //     id: 1,
    //     name: "Nguyễn Văn A",
    //     email: "nguyenvana@example.com",
    //     phone: "0912345678",
    //     address: "123 Đường Lê Lợi, Q.1, TP.HCM",
    //     avatar: "https://i.pravatar.cc/150?img=1",
    // };
    const [user, setUser] = useState();

    // Fetch cart data when component mounts or token changes
    const fetchCartData = async () => {
        if (!token) {
            console.log("No token found, setting cart count to 0");
            setCartCount(0);
            return;
        }
        try {
            const userId = getUserId();
            console.log("Fetching cart for userId:", userId);
            if (!userId) {
                console.log("No userId found in token");
                return;
            }
            const res = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/cart/${userId}`);
            console.log("Cart data received:", res.data);
            const totalItems = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
            console.log("Total items in cart:", totalItems);
            setCartCount(totalItems);
        } catch (err) {
            console.error("Error fetching cart data:", err);
            setCartCount(0);
        }
    };

    // Listen for cart updates
    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartData();
        };

        // Add event listener for cart updates
        window.addEventListener('cartUpdated', handleCartUpdate);

        // Initial fetch
        fetchCartData();

        // Cleanup
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [token]);

    // Xử lý click bên ngoài kết quả tìm kiếm
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Chỉ thực hiện tìm kiếm khi có ít nhất 1 ký tự và ô tìm kiếm đang hiển thị
            if (searchTerm.trim().length > 0 && showSearch) {
                performSearch();
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300); // Đợi 300ms sau khi người dùng ngừng gõ

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, showSearch]);

    const performSearch = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.set('name', searchTerm);
            params.set('limit', '5');

            const response = await axios.get(
                `https://kt-tkpm-project-api-gateway-v1.onrender.com/api/products/products-filters?${params.toString()}`
            );

            // Lọc kết quả để chỉ hiển thị sản phẩm có tên chứa từ khóa tìm kiếm
            const filteredResults = response.data.data || [];

            setSearchResults(filteredResults);
            setShowResults(true);
            setLoading(false);
        } catch (error) {
            console.error("Error searching products:", error);
            setSearchResults([]);
            setLoading(false);
            setShowResults(true);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Chỉ hiển thị kết quả và loading khi có ít nhất 1 ký tự
        if (value.trim().length > 0) {
            setLoading(true);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        setShowResults(false);
        setShowSearch(false);
        setSearchTerm("");
    };

    const handleViewAllResults = () => {
        if (searchTerm.trim()) {
            const params = new URLSearchParams();
            params.set('name', searchTerm);
            navigate(`/products?${params.toString()}`);
            setShowResults(false);
            setShowSearch(false);
        }
    };
    const handleSaveUser = async (form) => {
        try {
            const res = await authorizedAxiosInstance.put(
                'http://localhost:3000/api/auth/user',
                {
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    // address: form.address, // nếu backend có trường này
                }
            );
            setUser(res.data.user || form);
            alert("Cập nhật thành công!");
            // Cập nhật lại state user nếu cần
        } catch (err) {
            alert(err.response?.data?.message || "Cập nhật thất bại!");
        }
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
                                    to={`/catalog?category=${cat}`}
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
                            ref={searchRef}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#fff",
                                borderRadius: 25,
                                padding: "10px 20px",
                                flexGrow: 1,
                                marginLeft: 20,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                position: "relative"
                            }}
                        >
                            <CiSearch size={20} color="#007bff" style={{ marginRight: 10 }} />
                            <input
                                type="text"
                                placeholder="Search entire store here..."
                                autoFocus
                                value={searchTerm}
                                onChange={handleInputChange}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && searchTerm.trim()) {
                                        handleViewAllResults();
                                    }
                                }}
                                style={{
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    backgroundColor: "transparent",
                                    fontSize: 14,
                                }}
                            />

                            {/* Dropdown kết quả tìm kiếm */}
                            {showResults && (
                                <div className="search-results-dropdown">
                                    {loading ? (
                                        <div className="search-loading">Đang tìm kiếm...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="no-results">
                                            Không tìm thấy sản phẩm nào cho từ khóa "{searchTerm}"
                                        </div>
                                    ) : (
                                        <>
                                            <div className="search-results-header">
                                                Kết quả cho: <strong>{searchTerm}</strong>
                                            </div>
                                            <ul className="results-list">
                                                {searchResults.map(product => (
                                                    <li
                                                        key={product._id}
                                                        className="result-item"
                                                        onClick={() => handleProductClick(product._id)}
                                                    >
                                                        <div className="result-image">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} />
                                                            ) : (
                                                                <div className="no-image">No Image</div>
                                                            )}
                                                        </div>
                                                        <div className="result-details">
                                                            <h4>{product.name}</h4>
                                                            <p className="result-category">{product.category}</p>
                                                            <p className="result-price">
                                                                {product.price?.toLocaleString('vi-VN') || 0}đ
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="view-all-results">
                                                <button onClick={handleViewAllResults}>
                                                    Xem tất cả kết quả cho "{searchTerm}"
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Icons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: 20 }}>
                        {showSearch ? (
                            <AiOutlineClose
                                size={24}
                                color="#007bff"
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchTerm("");
                                    setShowResults(false);
                                }}
                                style={{ cursor: "pointer" }}
                            />
                        ) : (
                            <CiSearch size={24} onClick={() => setShowSearch(true)} style={{ cursor: "pointer" }} />
                        )}

                        <div style={{ position: "relative" }}>
                            <FiShoppingCart size={24} onClick={() => navigate("/cart")} style={{ cursor: "pointer" }} />
                            {cartCount > 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -8,
                                        right: -8,
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: "18px",
                                        height: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        zIndex: 1000
                                    }}
                                >
                                    {cartCount}
                                </div>
                            )}
                        </div>

                        <div style={{ position: "relative" }}>
                            <BiUser
                                size={24}
                                color="#007bff"
                                onClick={() => {
                                    if (!token) {
                                        navigate('/login');
                                    } else {
                                        setShowUserMenu((m) => !m);
                                    }
                                }}
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
                                        onClick={async () => {
                                            setShowUserMenu(false);
                                            await fetchUserInfo()
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
