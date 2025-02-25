
const Pagination = () => {
  return (
    <nav aria-label="Page navigation" className="my-4">
      <ul className="pagination justify-content-center">
        <li className="page-item">
          <button className="page-link" aria-label="Previous">
            <span aria-hidden="true">‹</span>
          </button>
        </li>
        <li className="page-item">
          <button className="page-link">1</button>
        </li>
        <li className="page-item active">
          <button className="page-link">2</button>
        </li>
        <li className="page-item">
          <button className="page-link">3</button>
        </li>
        <li className="page-item">
          <button className="page-link">...</button>
        </li>
        <li className="page-item">
          <button className="page-link">15</button>
        </li>
        <li className="page-item">
          <button className="page-link" aria-label="Next">
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
