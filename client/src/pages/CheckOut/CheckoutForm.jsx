import * as React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutForm = () => {
    const navigate = useNavigate();

    return (
        <form
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                maxWidth: "565px",
                gap: "26px",
                color: "#C94D3F",
                fontWeight: "600",
                fontSize: "13px",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            <h2
                style={{
                    color: "#000",
                    fontSize: "18px",
                }}
            >
                Shipping Address
            </h2>

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    Email Address <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                    }}
                    aria-label="Email Address"
                />
            </div>

            {/* First Name */}
            <div>
                <label
                    htmlFor="first-name"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    First Name <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <input
                    type="text"
                    id="first-name"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                    }}
                    aria-label="First Name"
                />
            </div>

            {/* Last Name */}
            <div>
                <label
                    htmlFor="last-name"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    Last Name <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <input
                    type="text"
                    id="last-name"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                    }}
                    aria-label="Last Name"
                />
            </div>

            {/* Street Address */}
            <div>
                <label
                    htmlFor="street-address"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    Street Address <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <input
                    type="text"
                    id="street-address"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                    }}
                    aria-label="Street Address"
                />
                <input
                    type="text"
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                        marginTop: "11px",
                    }}
                    placeholder="Additional Street Address"
                    aria-label="Additional Street Address"
                />
            </div>

            {/* City */}
            <div>
                <label
                    htmlFor="city"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    City <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <input
                    type="text"
                    id="city"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                    }}
                    aria-label="City"
                />
            </div>

            {/* State */}
            <div>
                <label
                    htmlFor="state"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    State/Province <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <select
                    id="state"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                        fontSize: "14px",
                        fontWeight: "400",
                    }}
                >
                    <option value="">Please select a state</option>
                    {/* Add state options here */}
                </select>
            </div>

            {/* Zip Code */}
            <div>
                <label
                    htmlFor="zip"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    Zip/Postal Code <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <input
                    type="text"
                    id="zip"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                    }}
                    aria-label="Zip/Postal Code"
                />
            </div>

            {/* Country */}
            <div>
                <label
                    htmlFor="country"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    Country <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <select
                    id="country"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                        fontSize: "14px",
                        fontWeight: "400",
                    }}
                >
                    <option value="United States">United States</option>
                    {/* Add country options here */}
                </select>
            </div>

            {/* Phone Number */}
            <div>
                <label
                    htmlFor="phone"
                    style={{
                        lineHeight: "2.1",
                    }}
                >
                    Phone Number <span style={{ color: "#C94D3F" }}>*</span>
                </label>
                <input
                    type="tel"
                    id="phone"
                    required
                    style={{
                        borderRadius: "4px",
                        border: "1px solid #A2A6B0",
                        backgroundColor: "#FFF",
                        width: "100%",
                        height: "50px",
                    }}
                    aria-label="Phone Number"
                />
            </div>

            {/* Confirm Button */}
            <button
                type="submit"
                style={{
                    backgroundColor: "#C94D3F",
                    color: "#FFF",
                    borderRadius: "4px",
                    border: "none",
                    height: "50px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                }}
            >
                Confirm
            </button>
        </form>
    );
};

export default CheckoutForm;
