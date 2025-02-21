import PropTypes from "prop-types";
import ProductCard from "./ProductCard";

const ProductSection = ({ title, products, seeAllLink, brandImage }) => {
  return (
    <div className="container my-5">
      {!brandImage && (
        <div className="row mb-3">
          <div className="col">
            <h2 className="">{title}</h2>
          </div>
          <div className="col text-end">
            <a href={seeAllLink} className="text-decoration-underline">
              {seeAllLink}
            </a>
          </div>
        </div>
      )}
      <div className="row">
        {brandImage && (
          <div className="col-md-3 position-relative">
            <img src={brandImage} alt="Brand logo" className="img-fluid" />

            <div className="position-absolute d-flex flex-column top-0 justify-content-center align-items-center">
              <h2 className="text-center">{title}</h2>
              <a href={seeAllLink} className="text-decoration-underline">
                {seeAllLink}
              </a>
            </div>
          </div>
        )}
        <div className={`${brandImage ? "col-md-9" : "col"}`}>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {products.map((product, index) => (
              <div className="col" key={index}>
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

ProductSection.propTypes = {
  title: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      inStock: PropTypes.bool.isRequired,
      imageSrc: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      originalPrice: PropTypes.number.isRequired,
      discountedPrice: PropTypes.number.isRequired,
    })
  ).isRequired,
  seeAllLink: PropTypes.string.isRequired,
  brandImage: PropTypes.string,
};

export default ProductSection;
