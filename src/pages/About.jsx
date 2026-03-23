import { Link } from "react-router-dom";
import "../../styles/about.css";
import "../../styles/utility.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  // Platform statistics
  const stats = [
    { value: "1,000+", label: "Rooms Listed" },
    { value: "500+", label: "Roommates Registered" },
    { value: "50+", label: "Cities Covered" },
    { value: "95%", label: "Happy Users" }
  ];

  // Features list
  const features = [
    {
      icon: "fa-solid fa-house-chimney",
      title: "Find Perfect Rooms",
      description: "Browse through thousands of verified rooms with detailed amenities, photos, and location maps."
    },
    {
      icon: "fa-solid fa-user-group",
      title: "Roommate Matching",
      description: "Our smart algorithm matches you with compatible roommates based on lifestyle, budget, and preferences."
    },
    {
      icon: "fa-solid fa-shield-heart",
      title: "Verified Listings",
      description: "All rooms and profiles are verified to ensure safe and trustworthy connections."
    },
    {
      icon: "fa-solid fa-map",
      title: "Location Intelligence",
      description: "Interactive maps help you find rooms near IT parks, colleges, hospitals, and metro stations."
    },
    {
      icon: "fa-solid fa-hand-holding-heart",
      title: "Safe & Secure",
      description: "Your privacy and security are our top priorities with secure messaging and verified contacts."
    },
    {
      icon: "fa-solid fa-clock",
      title: "Real-time Availability",
      description: "Instant updates on room availability and new roommate listings."
    }
  ];

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="about-page">

          {/* Hero Section */}
          <section className="about-hero">
            <h1 className="hero-title">
              <i className="fas fa-house-chimney"></i> Welcome to <strong className="font-3 text-gradient">RoomSathi</strong>
            </h1>
            <p className="hero-subtitle">
              Your trusted platform for finding the perfect room and compatible roommates
            </p>
            <div className="hero-buttons">
              <Link to="/find-room" className="btn btn-secondary btns">
                <i className="fas fa-magnifying-glass"></i> Find Rooms
              </Link>
              <Link to="/find-roommate" className="btn btn-secondary btns">
                <i className="fas fa-user-group"></i> Find Roommates
              </Link>
            </div>
          </section>

          {/* Stats Section */}
          <section className="stats-section">
            <h2 className="section-title text-center">
              <i className="fas fa-chart-simple"></i> Our Impact
            </h2>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div className="stat-card" key={index}>
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <h2 className="section-title text-center">
              <i className="fas fa-star"></i> Why Choose Us
            </h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div className="feature-card stat-card flex flex-col" key={index}>
                  <div className="feature-icon">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Story Section */}
          <section className="story-section">
            <div className="story-content">
              <h2 className="section-title">
                <i className="fas fa-quote-left"></i> Our Story
              </h2>
              <p className="story-text">
                RoomSathi  was born from a simple observation: finding a place to live and the right
                people to live with is one of life's biggest challenges. Whether you're a student
                moving to a new city, a professional starting a new job, or someone looking for a
                fresh start, we're here to make your journey easier.
              </p>
              <p className="story-text">
                What started as a small idea has grown into a community of thousands of users who
                trust us to help them find their perfect living situation. We combine smart technology
                with human understanding to create matches that work - not just for your budget, but
                for your lifestyle too.
              </p>
            </div>
            <div className="story-image">
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600"
                alt="Happy roommates"
              />
            </div>
          </section>

          {/* How It Works */}
          <section className="how-it-works stat-card">
            <h2 className="section-title text-center">
              <i className="fas fa-gear"></i> How It Works
            </h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <h3>Create Account</h3>
                <p>Sign up in seconds and set your preferences</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-icon">
                  <i className="fas fa-magnifying-glass"></i>
                </div>
                <h3>Browse Listings</h3>
                <p>Search through rooms or roommate profiles</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3>Connect</h3>
                <p>Contact owners or potential roommates directly</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-icon">
                  <i className="fas fa-house-chimney"></i>
                </div>
                <h3>Move In</h3>
                <p>Find your perfect living arrangement</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="testimonials-section">
            <h2 className="section-title text-center">
              <i className="fas fa-comments"></i> What Our Users Say
            </h2>
            <div className="testimonials-grid ">
              <div className="testimonial-card stat-card">
                <div className="testimonial-content">
                  <i className="fas fa-quote-left quote-icon"></i>
                  <p>"Found my perfect roommate in just 3 days! The match score helped me find someone compatible."</p>
                </div>
                <div className="testimonial-author flex flex-col">
                  <img src="https://images.unsplash.com/photo-1494790108755-27193f48fb72?w=100" alt="User" />
                  <div>
                    <h4>Priya Sharma</h4>
                    <p>Bengaluru</p>
                  </div>
                </div>
              </div>

              <div className="testimonial-card stat-card">
                <div className="testimonial-content">
                  <i className="fas fa-quote-left quote-icon"></i>
                  <p>"The map feature is amazing! Found a room close to my office with all amenities I wanted."</p>
                </div>
                <div className="testimonial-author  flex flex-col">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="User" />
                  <div>
                    <h4>Rahul Verma</h4>
                    <p>Mumbai</p>
                  </div>
                </div>
              </div>

              <div className="testimonial-card stat-card">
                <div className="testimonial-content">
                  <i className="fas fa-quote-left quote-icon"></i>
                  <p>"Verified listings gave me peace of mind. No scams, just genuine owners and rooms."</p>
                </div>
                <div className="testimonial-author  flex flex-col">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" alt="User" />
                  <div>
                    <h4>Neha Gupta</h4>
                    <p>Delhi</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2>Ready to find your perfect match?</h2>
            <p>Join thousands of happy users who found their ideal living situation</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-secondary btns">
                <i className="fas fa-user-plus"></i> Get Started
              </Link>
              <Link to="/find-room" className="btn btn-secondary btns">
                <i className="fas fa-magnifying-glass"></i> Browse Listings
              </Link>
            </div>
          </section>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default About;