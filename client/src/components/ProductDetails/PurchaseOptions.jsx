import React from "react";

function PurchaseOptions() {
    const containerStyle = {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "10px 0",
    };

    const priceStyle = {
        fontSize: "14px",
        color: "#000",
        fontWeight: "400",
    };

    const priceBoldStyle = {
        fontWeight: "600",
    };

    const quantityInputStyle = {
        width: "50px",
        height: "30px",
        textAlign: "center",
        border: "1px solid #ddd",
        borderRadius: "5px",
    };

    const addToCartStyle = {
        borderRadius: "30px",
        backgroundColor: "#0156FF",
        color: "#ffffff",
        fontWeight: "600",
        padding: "10px 25px",
        border: "none",
        fontSize: "14px",
        cursor: "pointer",
    };

    const paypalButtonStyle = {
        backgroundColor: "#FFB800",
        borderRadius: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "80px",
        height: "40px",
        border: "none",
        cursor: "pointer",
    };

    return (
        <div style={containerStyle}>
            {/* Giá sản phẩm */}
            <span style={priceStyle}>
                On Sale from <span style={priceBoldStyle}>$3,299.00</span>
            </span>

            {/* Input chọn số lượng */}
            <input type="number" min="1" defaultValue="1" style={quantityInputStyle} />

            {/* Nút "Add to Cart" */}
            <button style={addToCartStyle}>Add to Cart</button>

            {/* Nút PayPal */}
            <button style={paypalButtonStyle}>
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                    alt="PayPal"
                    style={{ width: "50px" }}
                />
            </button>
        </div>
    );
}

export default PurchaseOptions;
