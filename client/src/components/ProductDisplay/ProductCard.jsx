import PropTypes from "prop-types";
const ProductCard = ({ inStock, imageSrc, rating, description, originalPrice, discountedPrice }) => {
  return (
    <div className="card h-100">
      <div className={`badge position-absolute top-0 start-0 m-2 ${inStock ? "bg-success" : "bg-warning"}`}>
        {inStock ? "In Stock" : "Check Availability"}
      </div>
      <img src={imageSrc} alt={description} className="card-img-top p-3" />
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c69911b8ada2410925a43ecf4446ac533bac25e2ad400b898670da368828a79d?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Rating stars"
            className="w-25"
          />
          <small>Reviews ({rating})</small>
        </div>
        <p className="card-text mb-2">{description}</p>
        <div>
          <span className="text-muted text-decoration-line-through">${originalPrice}</span>
          <span className="ms-2 fw-bold">${discountedPrice}</span>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  inStock: PropTypes.bool.isRequired,
  imageSrc: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  originalPrice: PropTypes.number.isRequired,
  discountedPrice: PropTypes.number.isRequired,
};

export default ProductCard;
