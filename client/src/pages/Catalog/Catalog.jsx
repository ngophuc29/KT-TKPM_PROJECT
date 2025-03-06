import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import FilterSection from "../../components/Catalog/FilterSection";
import BreadcrumbNav from "../../components/Catalog/BreadcrumbNav";
import Pagination from "../../components/Catalog/Pagination";
import SortingControls from "../../components/Catalog/SortingControls";
import axios from "axios";
import IMAGES from "../../constants/images";

const Catalog = () => {
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products`;
        const response = await axios.get(URL, { withCredentials: true });

        setProducts(response?.data?.data);
        console.log("Products: ", response?.data?.data);
      } catch (error) {
        console.log("Error fetching products: ", error);
      }
    };
    fetchProducts();
  }, []);

  const handleClearAll = () => {
    setAppliedFilters([]);
  };

  const handleRemoveFilter = (filter) => {
    setAppliedFilters((prevFilters) => prevFilters.filter((f) => f !== filter));
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container-fluid py-5 pt-0">
      <div className="container">
        <div className="mb-5">
          <img src={IMAGES.BannerCatalog} alt="Header banner" className="img-fluid mb-4" />
          <BreadcrumbNav />
          <h1 className="h3 display-3">MSI PS Series (20)</h1>
        </div>

        <SortingControls />

        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-12 col-md-3 mb-4">
            <FilterSection setAppliedFilters={setAppliedFilters} />

            <div className=" p-3 text-center mt-4 rounded" style={{ backgroundColor: "#F5F7FF" }}>
              <p className="fw-bold mb-3">Brands</p>
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
              >
                All Brands
              </button>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8eb535f7e707114e5ee989fcd93176aeeaf18454db55fea8c09b99dd5ce0ab90?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
                alt="Brand logos"
                className="img-fluid mt-3"
              />
            </div>

            <div className="p-3 text-center mt-4 rounded" style={{ backgroundColor: "#F5F7FF" }}>
              <p className="fw-bold mb-3">Compare Products</p>
              <p className="small text-muted">You have no items to compare.</p>
            </div>

            <div className="p-3 text-center mt-4 rounded" style={{ backgroundColor: "#F5F7FF" }}>
              <p className="fw-bold mb-3">My Wish List</p>
              <p className="small text-muted">You have no items in your wish list.</p>
            </div>

            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b6a78b711dbc58b395aef4fccb46f698313d5347dfbcb17eaca75f73108fd34f?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
              alt="Promotional banner"
              className="img-fluid mt-4"
            />
          </div>

          {/* Main Content */}
          <div className="col-12 col-md-9">
            <div className="d-flex gap-2 flex-wrap">
              {appliedFilters.map((filter, index) => (
                <button key={index} className="btn btn-outline-secondary">
                  {filter} <span className="text-muted">(24)</span>
                  <span onClick={() => handleRemoveFilter(filter)} style={{ cursor: "pointer", marginLeft: "5px" }}>
                    x
                  </span>
                </button>
              ))}
              {appliedFilters.length > 0 && (
                <button className="btn btn-outline-secondary" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gy-4">
              {currentProducts.map((product, index) => (
                <div key={index} className="col p-0">
                  <ProductCard {...product} />
                </div>
              ))}
            </div>

            <Pagination
              productsPerPage={productsPerPage}
              totalProducts={products.length}
              paginate={paginate}
              currentPage={currentPage}
            />

            <article className="mt-5 small text-muted">
              <p className="mb-3">
                MSI has unveiled the Prestige Series line of business-class and gaming notebooks. Tuned for color
                accuracy, the Prestige Series also leverages True Color Technology, which allows users to adjust the
                display profile to best fit their computing needs.
              </p>
              <p className="mb-3">
                There are six different screen profiles, which are tuned for gaming, reducing eye fatigue, sRGB color
                accuracy, increasing clarity for words and lines, reducing harmful blue light, and optimizing contrast
                for watching movies.
              </p>
              <p className="mb-3">
                Given the various display profiles and discrete graphics chip, the Prestige Series notebooks can be used
                for various design work as well as for office tasks given that the screen can be adjusted for better
                clarity, color accuracy, or for eye strain reduction. Users working with video or 3D rendering will
              </p>
              <p className="mb-3">
                strain. This is helpful when working on the computer for extended periods of time. Additionally, in
                their down time, brightness.
              </p>
            </article>

            <div className="text-center mt-4">
              <button className="btn btn-outline-secondary">More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
