import * as React from "react";

const OrderSummary = () => {
    const items = [
        {
            id: 1,
            image: "http://b.io/ext_15-1",
            name: "MSI MEG Trident X 10SD-1012AU Intel i7 10700K, 2070 SUPER",
            quantity: 1,
            price: 3799.00
        },
        {
            id: 2,
            image: "http://b.io/ext_15-2",
            name: "MSI MEG Trident X 10SD-1012AU Intel i7 10700K, 2070 SUPER",
            quantity: 1,
            price: 3799.00
        }
    ];

    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <div
            style={{
                backgroundColor: "#F5F7FF",
                display: "flex",
                width: "100%",
                flexDirection: "column",
                padding: "18px 31px 29px",
                maxWidth: "550px",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                height:'100%'
            }}
            className="container"
        >
            <h2
                style={{
                    color: "#000",
                    fontWeight: "600",
                    fontSize: "24px",
                    fontFamily: "Poppins, sans-serif",
                    marginBottom: "20px"
                }}
            >
                Order Summary
            </h2>

            <div
                style={{
                    display: "flex",
                    marginBottom: "20px",
                    gap: "20px",
                    color: "#000",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                }}
            >
                <div>{items.length} Items in Cart</div>
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/881161bee43a56cddc40e90290f05b7df6796948834c5d4043d83a75f5eb36b7?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
                    alt="Cart Icon"
                    style={{
                        aspectRatio: "1.07",
                        objectFit: "contain",
                        objectPosition: "center",
                        width: "16px",
                        margin: "auto 0"
                    }}
                />
            </div>

            {items.map((item) => (
                <div
                    key={item.id}
                    style={{
                        display: "flex",
                        marginTop: "25px",
                        gap: "15px",
                        borderBottom: "1px solid #E2E2E2",
                        paddingBottom: "15px",
                    }}
                >
                    <img
                        loading="lazy"
                        src={item.image}
                        alt="Product Image"
                        style={{
                            aspectRatio: "1",
                            objectFit: "contain",
                            objectPosition: "center",
                            width: "62px",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: "1",
                            fontSize: "14px",
                            fontFamily: "Poppins, sans-serif",
                        }}
                    >
                        <div style={{ color: "#000", fontWeight: "500" }}>
                            {item.name}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                marginTop: "6px",
                                gap: "12px",
                                fontWeight: "600",
                                lineHeight: "1.4",
                            }}
                        >
                            <div style={{ color: "#A2A6B0" }}>
                                <span style={{ fontWeight: "400" }}>Qty </span>
                                <span>{item.quantity}</span>
                            </div>
                            <div style={{ color: "#000" }}>${item.price.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            ))}

            <div
                style={{
                    display: "flex",
                    marginTop: "20px",
                    justifyContent: "space-between",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#000",
                    paddingTop: "10px",
                }}
            >
                <div>Total</div>
                <div>${totalAmount.toFixed(2)}</div>
            </div>
        </div>
    );
};

export default OrderSummary;
