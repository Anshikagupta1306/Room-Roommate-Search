import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../../styles/home.css";
import { AuthContext } from "../contexts/AuthContext";
import Typewriter from "./Typewriter";
import FindRoom from './../pages/FindRoom'
import FindRoommate from './../pages/FindRoommate'
import PostRoom from './../pages/PostRoom'
import PostRoommate from './../pages/PostRoommate'
import About from './../pages/About'

const cities = [
  "Select city",
  "Mumbai", "Delhi", "Bengaluru", "Kolkata", "Chennai",
  "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Surat",
  "Lucknow", "Patna", "Indore", "Chandigarh", "Bhopal",
  "Vadodara", "Coimbatore", "Visakhapatnam", "Madurai",
  "Nagpur", "Nashik", "Kanpur", "Vijayawada", "Rajkot",
  "Agra", "Mysuru", "Ludhiana", "Guwahati", "Noida",
  "Faridabad", "Kochi", "Dehradun", "Aurangabad", "Thane"
];

const Main = () => {
  const texts = [
    "Find Rooms Near You",
    "Discover Verified Roommates",
    "PGs, Flats & Shared Rooms",
    "Move In With Confidence"
  ];

  const { user, data } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCitySelect = (city) => setSelectedCity(city);
  const handleSearch = () =>
    console.log("Searching:", searchTerm, "in", selectedCity);

  return (
    <>
      <section className="main-container flex flex-col items-center justify-center text-center">
        {/* Floating Icons – unchanged */}
        <i className="fas fa-home floating-icon"></i>
        <i className="fas fa-users floating-icon"></i>
        <i className="fas fa-building floating-icon"></i>
        <i className="fas fa-bed floating-icon"></i>


        <div className="gradient-orb orb1"></div>
        <div className="gradient-orb orb2"></div>
        <div className="gradient-orb orb3"></div>

        <motion.div
          className="main-contents"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="headline m-0 text-gradient">
            {/* Discover more than <span className="accent">5000+ Rooms</span> */}
            Find Your Perfect <span className="highlight">Room</span> or <span className="highlight">Roommate</span>
          </h1>
          <p className="subtext">The safest and easiest way to share a home with people you'll actually like.</p>

          {/* Search bar – structure unchanged */}
          <motion.div
            className="search-bar"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="input-group1 noAnimation">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Room type or roommate preference"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="input-group1 noAnimation">
              <i className="fas fa-map-marker-alt"></i>
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-primary radius-25 w-10" onClick={handleSearch}>
              Search
            </button>
          </motion.div>

          <header className="hero-text">
            <Typewriter texts={texts} speed={130} delay={2000} />
            <p className="subtext">
              Find comfortable rooms and compatible roommates with{" "}
              <span className="text-gradient accent">RoomSathi</span>
            </p>
          </header>

          {/* <p className="popular">
          Popular: <span className="accent00">PG</span>, Flatmate, Shared Room, Hostel
        </p> */}


          <motion.p
            className="popular"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Popular: <span className="popular-tag">PG</span>
            <span className="popular-tag">Flatmate</span>
            <span className="popular-tag">Shared Room</span>
            <span className="popular-tag">Hostel</span>
          </motion.p>
          <motion.div
            className="popular"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="popular-tag font-11 hide">{data?.total_rooms || 5000}+ Rooms</div>
            <div className="popular-tag font-11 hide">{data?.cities || 50}+ Cities</div>
            <div className="popular-tag font-11 hide">Verified Listings</div>
          </motion.div>

          {!user && (
            <div className="action-buttons0 flex items-center justify-evenly mt-20 gap-10">
              {/* <button className="btn btn-primary radius-50 w-20">Find Room</button> */}
              <Link className="btn btn-primary radius-50 w-20" to="/find-room">Find a Room</Link>
              <Link className="btn btn-primary radius-50 w-20" to="/post-room">Post Room</Link>
            </div>
          )}
        </motion.div>
      </section>
      {/* {user && user.user_type === "seeker" && (
        <>
          <FindRoom></FindRoom>
          <FindRoommate></FindRoommate>
        </>
      )}
      {user && user.user_type == "recruiter" && (
        <>
          <PostRoom></PostRoom>
          <PostRoommate></PostRoommate>
        </>
      )} */}
      <About></About>
    </>
  );
};

export default Main;
