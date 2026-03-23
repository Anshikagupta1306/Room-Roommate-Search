import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../../styles/auth.css"; // Using the same CSS as login page

const ResetPassword = () => {
    const { token } = useParams(); // Extract token from URL
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
        otp: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Normally, call API to reset password using token
        console.log("Resetting password for token:", token);
        setSubmitted(true);

        // Simulate redirect to login after 2 seconds
        setTimeout(() => {
            navigate("/login");
        }, 2000);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                {/* Left: Reset Password Form */}
                <div className="login-form">
                    <h2 className="login-title">Reset Password</h2>

                    {!submitted ? (
                        <form onSubmit={handleSubmit}>
                            <p className="welcome-text">
                                Enter a new password for your account.
                            </p>

                            {/* OTP */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                                <label className={formData.otp ? "label-up" : ""}>OTP</label>
                                <i className="fas fa-key"></i>
                            </div>

                            {/* New Password */}
                            <div className="input-group">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <label className={formData.password ? "label-up" : ""}>New Password</label>
                                <i className="fas fa-lock"></i>
                            </div>

                            {/* Confirm Password */}
                            <div className="input-group">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <label className={formData.confirmPassword ? "label-up" : ""}>Confirm Password</label>
                                <i className="fas fa-lock"></i>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block font-11 radius-25">
                                Reset Password
                            </button>

                            <div className="form-links">
                                <p className="flex justify-center items-center gap-10 text-light">
                                    Remembered your password? <Link to="/login">Sign in</Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="success-message">
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <i className="fas fa-check-circle" style={{ fontSize: '48px', color: '#10b981', marginBottom: '20px' }}></i>
                                <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                                    Your password has been successfully reset.
                                    <br />
                                    Redirecting to login page...
                                </p>
                                <div className="form-links">
                                    <p>
                                        <Link to="/login">Go to Login</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Welcome Text */}
                <div className="welcome-text">
                    <h2>
                        SECURE <br /> & <br /> MODERN
                    </h2>
                    <p>
                        Your account security is our priority. Choose a strong password and stay protected.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;