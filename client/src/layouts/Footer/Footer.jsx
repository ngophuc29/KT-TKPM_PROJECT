import React from "react";

const Footer = () => {
  const footerLinks = {
    Information: [
      "About Us",
      "About Zip",
      "Privacy Policy",
      "Search",
      "Terms",
      "Orders and Returns",
      "Contact Us",
      "Advanced Search",
      "Newsletter Subscription",
    ],
    "PC Parts": [
      "CPUs",
      "Add On Cards",
      "Hard Drives (Internal)",
      "Graphic Cards",
      "Keyboards / Mice",
      "Cases / Power Supplies / Cooling",
      "RAM (Memory)",
      "Software",
      "Speakers / Headsets",
      "Motherboards",
    ],
    "Desktop PCs": [
      "Custom PCs",
      "Servers",
      "MSI All-In-One PCs",
      "HP/Compaq PCs",
      "ASUS PCs",
      "Tecs PCs",
    ],
    Laptops: [
      "Everyday Use Notebooks",
      "MSI Workstation Series",
      "MSI Prestige Series",
      "Tablets and Pads",
      "Netbooks",
      "Infinity Gaming Notebooks",
    ],
  };

  return (
    <footer
      style={{
        backgroundColor: "#000",
        padding: "10px 20px",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Newsletter Section */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "10px" }}>
          Sign Up To Our Newsletter.
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "20px" }}>
          Be the first to hear about the latest offers.
        </p>
        <form
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="email"
            placeholder="Your Email"
            style={{
              padding: "10px 20px",
              borderRadius: "30px",
              border: "1px solid #fff",
              backgroundColor: "#000",
              color: "white",
              fontSize: "14px",
              width: "250px",
              maxWidth: "100%",
            }}
            required
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#0156FF",
              color: "white",
              padding: "10px 25px",
              borderRadius: "30px",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Footer Links */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "30px",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} style={{ flex: "1", minWidth: "200px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              {title}
            </h3>
            {links.map((link, index) => (
              <a
                key={index}
                href="#"
                style={{
                  color: "white",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                {link}
              </a>
            ))}
          </div>
        ))}
        {/* Address Section */}
        <div style={{ flex: "1", minWidth: "200px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Address
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.8" }}>
            Address: 1234 Street Address, City Address, 1234 <br />
            Phones:{" "}
            <a
              href="tel:0012345678"
              style={{ color: "#0156FF", textDecoration: "none" }}
            >
              (00) 1234 5678
            </a>
            <br />
            Email:{" "}
            <a
              href="mailto:shop@email.com"
              style={{ color: "#0156FF", textDecoration: "none" }}
            >
              shop@email.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          paddingTop: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "14px", color: "#888" }}>
          Copyright © 2025 Solomon Team
        </p>
      </div>
    </footer>
  );
};

export default Footer;
