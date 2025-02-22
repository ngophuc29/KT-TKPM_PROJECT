import React from "react";
import NavigationTabs from "./NavigationTabs";
import PurchaseOptions from "./PurchaseOptions";

function ProductDetailsHead({ activeTab, setActiveTab }) {
    const containerStyle = {
        borderRadius: "0px",
        fontSize: "14px",
        fontFamily: "Poppins, sans-serif",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        margin: "8px 0",
        width: "100%",
        maxWidth: "100%",
        // padding:'0 13%'
    };


    const headerStyle = {
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "26px 70px",
    };

    const contentWrapperStyle = {
        display: "flex",
        width: "100%",
        maxWidth: "73%",
        gap: "20px",
        flexWrap: "wrap",
        justifyContent: "space-between",
    };

    const productImageStyle = {
        objectFit: "contain",
        objectPosition: "center",
        width: "100%",
    };

    return (
        <div className="container" style={containerStyle}>
            <div className="bg-white d-flex flex-column align-items-center justify-content-center" style={headerStyle}>
                <div className="d-flex flex-wrap justify-content-between w-100" style={contentWrapperStyle}>
                    <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <PurchaseOptions />
                </div>
            </div>
            <img
                style={productImageStyle}
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/3dd038b02be0dbb84b4a1ca001af306658a1cedd790bd63ecb34f1ac738844b4?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
                alt="Product details"
                loading="lazy"
            />
        </div>
    );
}

export default ProductDetailsHead;
