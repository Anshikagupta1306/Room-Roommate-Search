import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth.css";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Register Data:", formData);

      // Use register from AuthContext
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      if (result.success) {
        console.log("Registration successful:", result.user);
        navigate("/login");
      } else {
        throw new Error(result.message || "Registration failed");
      }

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     console.log("Register Data:", formData);

  //     // Map frontend roles to backend user types
  //     const roleMapping = {
  //       jobseeker: "seeker",
  //       employer: "recruiter",
  //       admin: "admin"
  //     };

  //     const backendUserType = roleMapping[formData.role];

  //     // Step 1: Create user in database
  //     const userResponse = await fetch("http://localhost:5000/api/users", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: formData.email,
  //         password: formData.password,
  //         user_type: backendUserType,
  //         name: formData.name
  //       }),
  //     });

  //     const userData = await userResponse.json();

  //     if (!userResponse.ok) {
  //       throw new Error(userData.error || "Registration failed");
  //     }

  //     console.log("User created:", userData);
  //     navigate("/login");

  //   } catch (err) {
  //     setError(err.message || "Registration failed. Please try again.");
  //     console.error("Registration error:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="auth-containers">
      <div className="login-container">
        <div className="login-box">
          {/* Left: Register Form */}
          <div className="login-form">
            <h2 className="login-title">Create Account</h2>

            {error && (
              <div className="error-message" style={{
                color: 'red',
                textAlign: 'center',
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#ffe6e6',
                borderRadius: '5px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                  disabled={loading}
                />
                <label className={formData.name ? "label-up" : ""}>Full Name</label>
                <i className="fas fa-user"></i>
              </div>

              {/* Email */}
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <label className={formData.email ? "label-up" : ""}>Email</label>
                <i className="fas fa-envelope"></i>
              </div>

              {/* Password */}
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
                    name="role"
                    value="jobseeker"
                    checked={formData.role === "jobseeker"}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span className="radio-custom"></span>
                  Seeker
                  {/* Looking for Room */}
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={formData.role === "employer"}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span className="radio-custom"></span>
                  Employer
                  {/* Listing Property */}
                </label>

                <label className="radio-label disable" title="You don't have access for admin register. This feature is currently disable by system administration">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                    disabled
                  />
                  <span className="radio-custom"></span>
                  Admin
                  {/* Administrator */}
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block font-11 radius-25"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Register"}
              </button>

              <div className="form-links">
                <p className="flex justify-center items-center gap-10 text-light">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </form>
          </div>

          {/* Right: Welcome Text */}
          <div className="welcome-text">
            <h2>
              {/* JOIN<br />US TODAY! */}
              START YOUR JOURNEY!
            </h2>
            <p>
              Join our community today. Whether you're looking for a roommate or listing a property, we've got you covered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;