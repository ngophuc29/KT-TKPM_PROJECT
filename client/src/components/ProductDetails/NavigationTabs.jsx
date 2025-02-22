import React from "react";

function NavigationTabs({ activeTab, setActiveTab }) {
    const navTabsStyle = {
        display: "flex",
        gap: "29px",
        color: "#666", // dùng giá trị fallback của var(--Color---10)
        fontWeight: 600,
        margin: "auto 0",
        cursor: "pointer",
    };

    const activeTabStyle = {
        display: "flex",
        flexDirection: "column",
        color: "#000",
    };

    const activeIndicatorStyle = {
        aspectRatio: "52.63",
        objectFit: "contain",
        objectPosition: "center",
        width: "105px",
        strokeWidth: 2,
        stroke: "#0156FF", // dùng giá trị fallback của var(--Color---3)
    };

    return (
        <div style={navTabsStyle}>
            <div
                style={activeTab === "about" ? activeTabStyle : {}}
                onClick={() => setActiveTab("about")}
            >
                <div>About Product</div>
                {activeTab === "about" && (
                    <img
                        style={activeIndicatorStyle}
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d66cf3254d6d27b272a920788a49af169cafd24765f6af6db87ecf17feea707f?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
                        alt=""
                        loading="lazy"
                    />
                )}
            </div>
            <div
                style={activeTab === "details" ? activeTabStyle : {}}
                onClick={() => setActiveTab("details")}
            >
                <div>Details</div>
                {activeTab === "details" && (
                    <img
                        style={activeIndicatorStyle}
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d66cf3254d6d27b272a920788a49af169cafd24765f6af6db87ecf17feea707f?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
                        alt=""
                        loading="lazy"
                    />
                )}
            </div>
            <div
                style={activeTab === "specs" ? activeTabStyle : {}}
                onClick={() => setActiveTab("specs")}
            >
                <div>Specs</div>
                {activeTab === "specs" && (
                    <img
                        style={activeIndicatorStyle}
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d66cf3254d6d27b272a920788a49af169cafd24765f6af6db87ecf17feea707f?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
                        alt=""
                        loading="lazy"
                    />
                )}
            </div>
        </div>
    );
}

export default NavigationTabs;
