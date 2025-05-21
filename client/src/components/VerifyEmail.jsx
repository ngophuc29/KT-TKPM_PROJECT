import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyEmail = ({ email, onVerified }) => {
    const [code, setCode] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/api/auth/verify-email", { email, code });
            toast.success("Xác thực email thành công! Bạn có thể đăng nhập.");
            onVerified();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xác thực thất bại!");
        }
    };

    const handleResend = async () => {
        try {
            await axios.post("http://localhost:3000/api/auth/resend-verify-email", { email });
            toast.success("Đã gửi lại mã xác thực!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Gửi lại mã thất bại!");
        }
    };

    return (
        <form onSubmit={handleVerify} className="p-4">
            <h3>Nhập mã xác thực đã gửi về email</h3>
            <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Nhập mã xác thực"
                className="form-control my-2"
                required
            />
            <button type="submit" className="btn btn-success">Xác thực</button>
            <button type="button" className="btn btn-link" onClick={handleResend}>
                Gửi lại mã
            </button>
        </form>
    );
};

export default VerifyEmail;