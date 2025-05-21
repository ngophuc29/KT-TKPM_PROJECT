import PropTypes from "prop-types";
import { useState } from "react";
import ICONS from "../constants/icons";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getUserId } from "../utils/getUserId";

const ProductCard = ({ _id, stock, image, rating, name, price, discount }) => {
  const [hover, setHover] = useState(false);
  // Use environment variable for API URL instead of hardcoded URL
  const CART_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/cart/add`;

  // Calculate final price
  const finalPrice = price - (price * discount) / 100;
  // Xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async (productId) => {
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
        return;
      }
      await axios.post(`${CART_API_URL}/${userId}/${productId}/1`);
      toast.success("🛒Thêm vào giỏ hàng thành công");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng", error.response?.data || error.message);
      toast.error("Không thể thêm vào giỏ hàng: " + (error.response?.data?.message || error.message));
    }
  };
  return (
    <NavLink
      to={`/details/${_id}`}
      className={`card px-5 py-1 h-100 border-0 position-relative holographic-card`}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <div className="badge position-absolute top-0 start-0 m-2">
        {stock > 0 ? (
          <span className="d-flex align-items-center gap-2 fw-medium" style={{ color: "#78A962" }}>
            <img src={ICONS.Check} alt="" />
            in Stock
          </span>
        ) : (
          <span className="d-flex align-items-center gap-2 fw-medium" style={{ color: "#C94D3F" }}>
            <img src={ICONS.CallCheck} alt="" />
            check Availability
          </span>
        )}
      </div>
      {hover && stock > 0 && (
        <button
          className="position-absolute top-0 end-0 m-2 btn m-0 p-0 border-0 hover"
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart(_id);
          }}
        >
          <img src={ICONS.Cart} alt="" className="hover" />
        </button>
      )}
      <img src={image} className="img-fluid mx-auto mb-3 mt-5" style={{ maxWidth: "150px", height: "auto" }} />
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c69911b8ada2410925a43ecf4446ac533bac25e2ad400b898670da368828a79d?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Rating stars"
            className="img-fluid"
            style={{ width: "74px" }}
          />
          <small style={{ color: "#A2A6B0" }}>Reviews ({rating})</small>
        </div>
        <p
          className="card-title mb-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "3em",
          }}
        >
          {name}
        </p>
        <div style={{ marginTop: "auto" }}>
          <span className="text-muted text-decoration-line-through">${price}</span>
          <br />
          <span className="fw-bold">${finalPrice.toFixed(2)}</span>
        </div>
      </div>
    </NavLink>
  );
};

ProductCard.propTypes = {
  stock: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
};

export default ProductCard;
