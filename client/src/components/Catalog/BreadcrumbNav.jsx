
const BreadcrumbNav = () => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb small mb-4">
        <li className="breadcrumb-item">Home</li>
        <li className="breadcrumb-item">Laptops</li>
        <li className="breadcrumb-item">Everyday Use Notebooks</li>
        <li className="breadcrumb-item">MSI Prestige Series</li>
        <li className="breadcrumb-item active" aria-current="page">
          MSI WS Series
        </li>
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
