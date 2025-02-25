
const SortingControls = () => {
  return (
    <div className="row align-items-center mb-4">
      <div className="col-auto">
        <button className="btn btn-outline-secondary">‹ Back</button>
      </div>
      <div className="col">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="text-muted">Items 1-35 of 61</span>

          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="sortDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="text-muted">Sort By: </span>Position
            </button>
            <ul className="dropdown-menu" aria-labelledby="sortDropdown">
              <li>
                <a className="dropdown-item" href="#">
                  Position
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Price
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Name
                </a>
              </li>
            </ul>
          </div>

          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="showDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="text-muted">Show: </span>35 per page
            </button>
            <ul className="dropdown-menu" aria-labelledby="showDropdown">
              <li>
                <a className="dropdown-item" href="#">
                  35 per page
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  50 per page
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  100 per page
                </a>
              </li>
            </ul>
          </div>

          <div className="btn-group" role="group" aria-label="View options">
            <button type="button" className="btn btn-outline-secondary">
              <i className="bi bi-grid"></i>
            </button>
            <button type="button" className="btn btn-outline-secondary">
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingControls;
