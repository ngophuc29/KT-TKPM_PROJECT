import PropTypes from "prop-types";
import { useState } from "react";

const ProductCard = ({ stock, image, rating, description, price, discount }) => {
  const [hover, setHover] = useState(false);

  // Calculate final price
  const finalPrice = price - (price * discount) / 100;

  return (
    <div
      className={`card h-100 border-0 ${hover ? "shadow" : ""}`}
      style={{
        zIndex: hover ? 1 : 0,
        transition: "0.2s",
        cursor: "pointer",
        transform: hover ? "scale(1.05)" : "scale(1)",
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <div className={`badge position-absolute top-0 start-0 m-2 ${stock ? "bg-success" : "bg-warning"}`}>
        {stock > 0 ? "In Stock" : "Check Availability"}
      </div>
      <img src={image} className="img-fluid mx-auto mb-3" style={{ maxWidth: "150px", height: "auto" }} />
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c69911b8ada2410925a43ecf4446ac533bac25e2ad400b898670da368828a79d?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Rating stars"
            className="img-fluid"
            style={{ width: "74px" }}
          />
          <small>Reviews ({rating})</small>
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
          <span className="ms-2 fw-bold">${finalPrice.toFixed(2)}</span>
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
