function ProductDetailsHead({ activeTab, setActiveTab, price }) {
  const styles = {
    container: { fontSize: 14, fontFamily: "Poppins, sans-serif", textAlign: "center", margin: "8px 0" },
    activeTab: { color: "#000", borderBottom: "2px solid #0156FF", cursor: "pointer" },
    tab: { borderBottom: "2px solid transparent", cursor: "pointer" },
    price: { fontSize: 14, color: "#000", fontWeight: 400 },
    priceBold: { fontWeight: 600 },
    quantityInput: { width: 50, height: 30, textAlign: "center", border: "1px solid #ddd", borderRadius: 5 },
  };

  const tabs = ["about", "details", "specs"];

  return (
    <div className="container" style={styles.container}>
      <div className="bg-white d-flex flex-column align-items-center justify-content-center p-4">
        <div className="d-flex flex-wrap justify-content-between w-100" style={{ maxWidth: "73%" }}>
          <div className="d-flex justify-content-center gap-3 text-secondary fw-semibold cursor-pointer">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={
                  activeTab === tab
                    ? "text-dark d-flex flex-column justify-content-center"
                    : "d-flex flex-column justify-content-center"
                }
                style={activeTab === tab ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab(tab)}
              >
                <div>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
              </div>
            ))}
          </div>
          <div className="d-flex align-items-center gap-3 py-2">
            <span style={styles.price}>
              On Sale from <span style={styles.priceBold}>${price}</span>
            </span>
            <input
              type="number"
              min="1"
              defaultValue="1"
              className="form-control text-center"
              style={styles.quantityInput}
            />
            <button className="btn btn-primary rounded-pill px-4">Add to Cart</button>
            <button
              className="btn btn-warning rounded-pill d-flex align-items-center justify-content-center"
              style={{ width: 80, height: 40 }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width="50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsHead;
