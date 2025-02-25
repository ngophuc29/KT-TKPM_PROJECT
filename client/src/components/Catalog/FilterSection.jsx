

const FilterSection = () => {
  return (
    <div className="bg-light p-3 rounded">
      <div className="text-center mb-4">
        <h5 className="fw-bold mb-3">Filters</h5>
        <button className="btn btn-outline-secondary w-100">
          Clear Filter
        </button>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Category</h6>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f64b4290f32e6a4f276425609f366bf4d8fd3debf7439b25e61d9612c5ff3ff7?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Toggle"
            style={{ width: "16px", height: "16px" }}
          />
        </div>
        <div className="d-flex justify-content-between">
          <div className="small">
            <div>CUSTOM PCS</div>
            <div>MSI ALL-IN-ONE PCS</div>
            <div>HP/COMPAQ PCS</div>
          </div>
          <div className="text-end small">
            <div>15</div>
            <div>45</div>
            <div>1</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Price</h6>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/fb1ba39ff44b4321ff74e8fbbe75d2cf617f86047d984ea1d7c8fa0c47d5264f?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Toggle"
            style={{ width: "16px", height: "16px" }}
          />
        </div>
        <div className="d-flex justify-content-between">
          <div className="small">
            <div>$0.00 - $1,000.00</div>
            <div>$1,000.00 - $2,000.00</div>
            <div>$2,000.00 - $3,000.00</div>
            <div>$3,000.00 - $4,000.00</div>
            <div>$4,000.00 - $5,000.00</div>
            <div>$5,000.00 - $6,000.00</div>
            <div>$6,000.00 - $7,000.00</div>
            <div>$7,000.00 And Above</div>
          </div>
          <div className="text-end small">
            <div>19</div>
            <div>21</div>
            <div>9</div>
            <div>6</div>
            <div>3</div>
            <div>1</div>
            <div>1</div>
            <div>1</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Color</h6>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/fb1ba39ff44b4321ff74e8fbbe75d2cf617f86047d984ea1d7c8fa0c47d5264f?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Toggle"
            style={{ width: "16px", height: "16px" }}
          />
        </div>
        <div
          className="rounded-circle bg-dark"
          style={{ width: "23px", height: "23px" }}
        ></div>
      </div>

      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Filter Name</h6>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/9326ad59a058ecf01720c3885beadd603b9841918fe205a45fea5973ec1984aa?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Toggle"
            style={{ width: "16px", height: "16px" }}
          />
        </div>
        <button className="btn btn-primary w-100">Apply Filters (2)</button>
      </div>
    </div>
  );
};

export default FilterSection;
