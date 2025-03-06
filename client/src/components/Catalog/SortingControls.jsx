import ICONS from "../../constants/icons";
import { Link } from "react-router-dom";
const SortingControls = () => {
  return (
    <div className="row align-items-center mb-4">
      <div className="col-12 col-md-3">
        <Link
          to="/"
          className="d-flex align-items-center justify-content-center btn w-100 border-0 fw-bold hover"
          style={{ fontSize: "14px" }}
        >
          <img src={ICONS.Arrow} alt="" style={{ transform: "rotate(90deg)" }} />
          Back
        </Link>
      </div>
      <div className="col">
        <div className="d-flex align-items-center justify-content-between">
          <span className="text-muted" style={{ fontSize: "13px", color: "#A2A6B0" }}>
            Items 1-35 of 61
          </span>

          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn fw-bold hover"
              style={{ width: "176px", height: "50px", borderColor: "#CACDD8", borderWidth: 2, fontSize: "13px" }}
            >
              <span className="text-muted" style={{ color: "#A2A6B0" }}>
                Sort By:{" "}
              </span>
              Position
              <img src={ICONS.Arrow} alt="" />
            </button>

            <button
              className="btn fw-bold hover"
              style={{ width: "176px", height: "50px", fontSize: "13px", borderColor: "#CACDD8", borderWidth: 2 }}
            >
              <span className="text-muted" style={{ color: "#A2A6B0" }}>
                Show:{" "}
              </span>
              35 per page
              <img src={ICONS.Arrow} alt="" />
            </button>

            <button className="btn border-0 hover">
              <img src={ICONS.All} alt="" />
            </button>
            <button className="btn border-0 hover">
              <img src={ICONS.Filter} alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingControls;
