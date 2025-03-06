import PropTypes from "prop-types";
import { useState } from "react";
import ICONS from "../constants/icons";

const ProductCard = ({ stock, image, rating, description, price, discount }) => {
  const [hover, setHover] = useState(false);

  // Calculate final price
  const finalPrice = price - (price * discount) / 100;

  return (
    <div
      className={`card px-5 py-1 h-100 border-0 ${hover ? "shadow" : ""}`}
      style={{
        zIndex: hover ? 1 : 0,
        transition: "0.2s",
        cursor: "pointer",
        transform: hover ? "scale(1.05)" : "scale(1)",
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <div className={`badge position-absolute top-0 start-0 m-2`}>
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
      <img src={image} className="img-fluid mx-auto mb-3 mt-5" style={{ maxWidth: "150px", height: "auto" }} />
      <div className="card-body">
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
          {description}
        </p>
        <div>
          <span className="text-muted text-decoration-line-through">${price}</span>
          <br />
          <span className="fw-bold">${finalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
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
