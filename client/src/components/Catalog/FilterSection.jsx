import { useState } from "react";
import ICONS from "../../constants/icons";

const FilterSection = ({ setAppliedFilters }) => {
  const [isCategoryVisible, setIsCategoryVisible] = useState(true);
  const [isPriceVisible, setIsPriceVisible] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);

  const toggleCategoryVisibility = () => {
    setIsCategoryVisible(!isCategoryVisible);
  };

  const togglePriceVisibility = () => {
    setIsPriceVisible(!isPriceVisible);
  };

  const categories = [
    { name: "Custome Builds", count: 15 },
    { name: "MSI Laptops", count: 45 },
    { name: "Desktops", count: 1 },
    { name: "Gaming Monitors", count: 1 },
  ];

  const prices = [
    { range: "$0.00 - $1,000.00", count: 19 },
    { range: "$1,000.00 - $2,000.00", count: 21 },
    { range: "$2,000.00 - $3,000.00", count: 9 },
    { range: "$3,000.00 - $4,000.00", count: 6 },
    { range: "$4,000.00 - $5,000.00", count: 3 },
    { range: "$5,000.00 - $6,000.00", count: 1 },
    { range: "$6,000.00 - $7,000.00", count: 1 },
    { range: "$7,000.00 And Above", count: 1 },
  ];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handlePriceClick = (price) => {
    setSelectedPrice(price === selectedPrice ? null : price);
  };

  const handleApplyFilters = () => {
    const filters = [];
    if (selectedCategory) filters.push(selectedCategory);
    if (selectedPrice) filters.push(selectedPrice);
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedPrice(null);
    setAppliedFilters([]);
  };

  const transitionStyles = {
    transition: "max-height 0.6s ease-in-out",
    overflow: "hidden",
  };

  return (
    <div className=" p-3 rounded" style={{ backgroundColor: "#F5F7FF" }}>
      <div className="text-center mb-4">
        <p className="fw-bold mb-3" style={{ fontSize: "16px" }}>
          Filters
        </p>
        <button
          className="btn btn-outline-primary w-100 fw-bold"
          style={{
            height: "37px",
            borderColor: "#CACDD8",
            borderWidth: 2,
            fontSize: "15px",
            borderRadius: "999px",
            color: "#A2A6B0",
          }}
          onClick={handleClearFilters}
        >
          Clear Filter
        </button>
      </div>

      <div className="mb-4">
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ cursor: "pointer" }}
          onClick={toggleCategoryVisibility}
        >
          <p className="mb-0 fw-bold">Category</p>
          <img src={ICONS.Arrow} alt="" style={{ transform: isCategoryVisible ? "rotate(0deg)" : "rotate(90deg)" }} />
        </div>
        <div
          style={{
            ...transitionStyles,
            maxHeight: isCategoryVisible ? "500px" : "0",
          }}
        >
          {categories.map((category, index) => (
            <button
              key={index}
              className={`btn w-100 d-flex align-items-center justify-content-between hover ${
                selectedCategory === category.name ? "active btn-outline-primary" : ""
              }`}
              style={{ borderRadius: "6px", fontSize: "14px" }}
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.name} <span>{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ cursor: "pointer" }}
          onClick={togglePriceVisibility}
        >
          <p className="mb-0 fw-bold">Price</p>
          <img src={ICONS.Arrow} alt="" style={{ transform: isPriceVisible ? "rotate(0deg)" : "rotate(90deg)" }} />
        </div>
        <div
          style={{
            ...transitionStyles,
            maxHeight: isPriceVisible ? "500px" : "0",
          }}
        >
          {prices.map((price, index) => (
            <button
              key={index}
              className={`btn w-100 d-flex align-items-center justify-content-between hover hover ${
                selectedPrice === price.range ? "active btn-outline-primary" : ""
              }`}
              style={{ borderRadius: "6px", fontSize: "14px" }}
              onClick={() => handlePriceClick(price.range)}
            >
              {price.range} <span>{price.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0 fw-bold">Color</p>
        </div>
        <div className="rounded-circle bg-dark" style={{ width: "23px", height: "23px" }}></div>
      </div>

      <button
        className="btn btn-primary w-100 fw-bold text-white hover"
        style={{
          height: "37px",
          borderColor: "#CACDD8",
          borderWidth: 2,
          fontSize: "15px",
          borderRadius: "999px",
        }}
        onClick={handleApplyFilters}
      >
        Apply Filters ({(selectedCategory ? 1 : 0) + (selectedPrice ? 1 : 0)})
      </button>
    </div>
  );
};

export default FilterSection;
