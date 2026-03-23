
import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/footer.css'
import '../../styles/utility.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className='helpSection flex items-center justify-between'>
        <div>
          <h1>Need Help Finding a Home?</h1>
          <p>Our support team is here to help you find the perfect room or roommate. Reach out to us anytime!</p>
        </div>
        <div>
          <button className='btn btn-primary'>Get Support</button>
        </div>
      </div>
      <div className="footer-container">
        {/* Left Section - Logo + About */}
        <div className="footer-brand">
          <div className="footer-logo">
            <i className="fa-solid fa-house-chimney logo-icon"></i>
            <h2>RoomSathi</h2>
          </div>
          <p>
            India's trusted platform for finding verified rooms, PGs, and compatible roommates.
            Making shared living safe and easy since 2024.
          </p>
        </div>

        <div className='flex justify-between items-center'>
          {/* For Room Seekers */}
          <div className="footer-links">
            <h4>For Room Seekers</h4>
            <ul>
              <li><Link to="/find-room">Browse Rooms</Link></li>
              <li><Link to="/find-roommate">Find Roommates</Link></li>
              <li><Link to="/">Search by City</Link></li>
              {/* <li>Search by City</li> */}
              {/* <li>Budget Calculator</li> */}
              <li>Safety Tips</li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div className="footer-links">
            <h4>For Owners</h4>
            <ul>
              <li><Link to="/post-room">Post Room</Link></li>
              <li><Link to="/post-roommate">Post Roommate</Link></li>
              <li><Link to="/profile">Owner Dashboard</Link></li>
              <li><Link to="/about">Success Stories</Link></li>
              {/* <li>Post Property</li> */}
              {/* <li>Owner Dashboard</li> */}
              {/* <li>Success Stories</li> */}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <h4>Get Room Updates</h4>
          <p>
            Get the latest room listings and roommate matching tips in your inbox.
          </p>
          <div className="footer-input">
            <input type="email" placeholder="Your email address" />
            <button className='btn btn-primary btn-block radius-0'>Subscribe</button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>{new Date().getFullYear()} © RoomSathi. All rights reserved. </p>
        <p>Made with <i className="fa-solid fa-heart" style={{ color: '#ef476f'}}></i> by CodeLockers </p>
        <div className="footer-socials">
          <i className="fab fa-facebook-f"></i>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-whatsapp"></i>
          <i className="fab fa-linkedin-in"></i>
          <i className="fab fa-twitter"></i>
        </div>
      </div>
    </footer>
  );
};

export default Footer;