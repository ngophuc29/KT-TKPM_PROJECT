import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Features from "../Home/Features";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { createRateLimiter } from "../../utils/rateLimiter";
import { toast } from "react-toastify";
import VerifyEmail from "../../components/VerifyEmail"; // Import component xác thực email

const RegisterForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Thêm state phone
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const navigate = useNavigate();
  const canSignup = createRateLimiter(5, 60000);
  const handleRegister = async (e) => {
    e.preventDefault();
    const result = canSignup();
    if (!result.allowed) {
      toast.warning(`Bạn thao tác quá nhanh, vui lòng thử lại sau ${result.secondsLeft} giây!`);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth/register`, {
        fullName,
        email,
        phone, // Gửi phone lên backend
        password,
      });
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      setShowVerify(true); // Hiện form xác thực
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  if (showVerify) {
    return <VerifyEmail email={email} onVerified={() => navigate("/login")} />;
  }

  return (
    <>
      <div className="container mt-5" style={{ maxWidth: "1279px" }}>
        {/* Breadcrumb Navigation */}
        <nav className="text-muted mb-4" style={{ fontSize: "14px", fontWeight: 300 }}>
          <span className="text-dark">Home </span>
          <span className="text-primary">›</span>
          <span className="text-dark"> Register</span>
        </nav>

        {/* Page Title */}
        <h1 className="mb-5 text-dark" style={{ fontWeight: 600, fontSize: "36px" }}>
          Customer Registration
        </h1>

        {/* Main Content */}
        <form
          className="p-5 shadow-sm"
          style={{ borderRadius: "12px", backgroundColor: '#F5F7FF' }}
          onSubmit={handleRegister}
        >
          <h2 className="text-dark mb-4" style={{ fontWeight: 600, fontSize: "22px" }}>
            Create New Account
          </h2>

          {/* Full Name Input */}
          <div className="mb-4">
            <label htmlFor="fullName" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              className="form-control"
              placeholder="Your Full Name"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Your Email"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone Input */}
          <div className="mb-4">
            <label htmlFor="phone" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Phone
            </label>
            <input
              type="text"
              id="phone"
              className="form-control"
              placeholder="Your Phone Number"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Create Password"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Confirm Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Confirm Password"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Checkbox Agree to Terms */}
          <div className="mb-4">
            <input
              type="checkbox"
              id="terms"
              required
              style={{ marginRight: "10px" }}
            />
            <label htmlFor="terms" className="text-dark" style={{ fontSize: "14px", fontWeight: 500 }}>
              I agree to the Terms and Conditions
            </label>
          </div>

          {/* Register Button */}
          <div className="d-flex gap-4 align-items-center mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: "14px", height: '50px', width: '208px', borderRadius: "50px", fontWeight: 600 }}
            >
              Register
            </button>
            <a href="#" className="text-primary" style={{ fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>
              Already have an account?  <NavLink to="/login">Sign-In</NavLink>
            </a>
          </div>
        </form>
      </div>
      <Features />
    </>
  );
};

export default RegisterForm;
