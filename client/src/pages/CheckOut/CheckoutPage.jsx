import * as React from "react";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                backgroundColor: "rgba(255, 255, 255, 1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                margin:'30px 0'
            }}
        >
             

            <main
                style={{
                    alignSelf: "center",
                    display: "flex",
                    marginTop: "20px",
                    width: "100%",
                    maxWidth: "1400px",
                    flexDirection: "column",
                    alignItems: "start",
                }}
                className="container"
            >
                <nav aria-label="Breadcrumb">
                    <div
                        style={{
                            color: "rgba(163, 163, 163, 1)",
                            textAlign: "center",
                            font: "300 12px Poppins, sans-serif",
                        }}
                    >
                        <span style={{ fontWeight: "400", color: "rgba(0,0,0,1)" }}>Home </span>
                        <span style={{ fontWeight: "400", color: "rgba(1,86,255,1)" }}>›</span>
                        <span style={{ fontWeight: "400", color: "rgba(0,0,0,1)" }}> Shopping Cart </span>
                        <span style={{ fontWeight: "400", color: "rgba(1,86,255,1)" }}>›</span>
                        <span style={{ fontWeight: "400", color: "rgba(0,0,0,1)" }}> Checkout Process</span>
                    </div>
                </nav>

                <div
                    style={{
                        display: "flex",
                        marginTop: "19px",
                        width: "100%",
                        maxWidth: "1349px",
                        gap: "20px",
                        fontFamily: "Poppins, sans-serif",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                    }}
                    className="row"
                >
                    <div
                        style={{
                            alignSelf: "start",
                            display: "flex",
                            gap: "32px",
                            fontWeight: "600",
                        }}
                        className="col-12 d-flex align-items-center"
                    >
                        <h1
                            style={{
                                color: "rgba(0, 0, 0, 1)",
                                fontSize: "32px",
                            }}
                        >
                            Checkout
                        </h1>
                        <button
                            style={{
                                borderRadius: "50px",
                                border: "2px solid #0156FF",
                                fontSize: "14px",
                                color: "#0156FF",
                                textAlign: "center",
                                padding: "18px 70px",
                                background: "none",
                                cursor: "pointer",
                            }}
                            className="btn btn-outline-primary"
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </button>
                    </div>

                     
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        // alignItems: "flex-start",
                        gap: "163px",
                        width: "100%",
                        // maxWidth: "1200px",
                        // margin: "0 auto",
                    }}
                >
                    <CheckoutForm />
                    <OrderSummary />
                </div>
            </main>

         
        </div>
    );
};

export default CheckoutPage;
