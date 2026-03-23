// pages/Unauthorized.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/unauthorized.css'

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="">
      <div className="unauthorized-card">
        <div className="lock-icon-container">
          <i className="fas fa-lock lock-icon"></i>
          <i className="fas fa-ban ban-icon noAnimation"></i>
        </div>
        
        <h1 className="unauthorized-title">403</h1>
        <h2 className="unauthorized-subtitle">Access Denied</h2>
        
        <p className="unauthorized-message">
          Oops! It seems you don't have permission to view this page.
          <br />
          Please contact your administrator if you believe this is a mistake.
        </p>

        <div className="unauthorized-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left mr-5"></i>
            Go Back
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-home mr-5"></i>
            Home
          </button>
        </div>

        <div className="help-links">
          <a href="/contact-support" className="help-link">
            <i className="fas fa-headset mr-5"></i>
            Contact Support
          </a>
          <span className="separator">•</span>
          <a href="/login" className="help-link">
            <i className="fas fa-sign-in-alt mr-5"></i>
            Try Login Again
          </a>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;