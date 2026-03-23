import React, { useState } from "react";
import "../../styles/auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from '../contexts/NotificationContext';


export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { showNotification } = useNotification();


    const [formData, setFormData] = useState({
        email: "seeker@example.com",
        password: "1234",
        loginType: "seeker"
    });

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("Attempting login with:", formData.email, formData.loginType);

            // Call login from AuthContext
            // console.log("888888888888888")
            const result = await login(formData.email, formData.password, formData.loginType);

            if (result.success) {
                showNotification("Login successful !", 'success', 3000);
                console.log("Login successful, navigating...");
                navigate("/", { replace: true });
            } else {
                showNotification(`${result.message} || "Invalid credentials"`, 'error', 3000);
                setError(result.message || "Invalid credentials");
            }

        } catch (err) {
            showNotification(`${err.message} || "Invalid credentials"`, 'error', 3000);
            setError(err.message || "Invalid credentials");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };
    const handleLoginTypeChange = (e) => {
        const loginType = e.target.value;
        const demoEmails = {
            seeker: "seeker@example.com",
            recruiter: "recruiter@example.com",
            admin: "admin@example.com"
        };

        setFormData({
            ...formData,
            loginType,
            email: demoEmails[loginType],
            password: "1234"
        });
    };

    return (
        <div className="auth-containers">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-form">
                        <h2 className="login-title">Login</h2>

                        {error && (
                            <div className="error-message" style={{
                                color: 'red',
                                textAlign: 'center',
                                marginBottom: '25px',
                                padding: '10px',
                                backgroundColor: '#ffe6e6',
                                borderRadius: '0px'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    // autoFocus
                                    disabled={loading}
                                />
                                <label className={formData.email ? "label-up" : ""}>Email</label>
                                {/* <i className="fas fa-envelope"></i> */}
                                <span className="toggle-password">
                                    <i className="fas fa-envelope"></i>
                                </span>
                            </div>

                            <div className="input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                                <label className={formData.password ? "label-up" : ""}>Password</label>
                                {/* <i className="fas fa-lock"></i> */}

                                <span onClick={togglePasswordVisibility} className="toggle-password">
                                    {showPassword ? <i class="fa-solid fa-eye"></i> : <i class="fa-solid fa-eye-slash"></i>}
                                </span>
                            </div>

                            <div className="login-type-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="loginType"
                                        value="seeker"
                                        checked={formData.loginType === "seeker"}
                                        onChange={handleLoginTypeChange}
                                        disabled={loading}
                                    />
                                    <span className="radio-custom"></span>
                                    Seeker
                                </label>

                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="loginType"
                                        value="recruiter"
                                        checked={formData.loginType === "recruiter"}
                                        onChange={handleLoginTypeChange}
                                        disabled={loading}
                                    />
                                    <span className="radio-custom"></span>
                                    Recruiter
                                </label>

                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="loginType"
                                        value="admin"
                                        checked={formData.loginType === "admin"}
                                        onChange={handleLoginTypeChange}
                                        disabled={loading}
                                    />
                                    <span className="radio-custom"></span>
                                    Admin
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-secondary btn-block font-11 radius-25 "
                                // disabled={loading}
                                disabled
                            >
                                Login with Google
                                {/* {loading ? "Logging in..." : "Login with Google"} */}

                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block font-11 radius-25 mt-10"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>


                            <div className="form-links">
                                <Link to="/forgot">Forgot Password?</Link>
                                <p className="flex justify-center items-center gap-10 text-light">
                                    {/* Don't have an account? */}
                                    New to our platform?
                                    {/* <Link to="/register">Sign Up</Link> */}
                                    <Link to="/register">Create account</Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    <div className="welcome-text">
                        <h2>
                            {/* WELCOME <br /> BACK! */}
                            GLAD TO SEE YOU AGAIN!
                        </h2>
                        <p>
                            Sign in to continue your journey with us. Access your account to manage listings, connect with matches, and explore new opportunities.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}