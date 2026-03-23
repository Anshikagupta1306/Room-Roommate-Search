import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css"; // Using the same CSS as login page

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally, you would call an API to send the reset email
    console.log("Sending password reset to:", email);
    setSubmitted(true);

    // Simulate redirect after 2 seconds
    setTimeout(() => {
      navigate(`/reset-password/${email}`);
    }, 5000);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left: Forgot Password Form */}
        <div className="login-form">
          <h2 className="login-title">Forgot Password</h2>

          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <p style={{ marginBottom: '30px', color: 'var(--text-light)', textAlign: 'center' }}>
                Enter your email address and we will send you a link to reset your password.
              </p>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <label className={email ? "label-up" : ""}>Email</label>
                <i className="fas fa-envelope"></i>
              </div>

              <button type="submit" className="btn btn-primary btn-block font-11 radius-25">
                Send Reset Link
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
                <p className="text-light">
                  A password reset OTP has been sent to <strong>{email}</strong>.
                  <br />
                  Redirecting to reset page...
                </p>
                <div className="form-links">
                  <p className="text-light">
                    Didn't receive the email? <a href="#!" onClick={() => setSubmitted(false)}>Try again</a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Welcome Text */}
        <div className="welcome-text">
          <h2>
            SECURE<br /> & <br /> FAST
          </h2>
          <p>
            {/* Reset your password instantly and safely. Stay connected to your career opportunities. */}
            Don't worry! Reset your password in a few simple steps and get back to managing your account
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;