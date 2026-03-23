// FindRoommate.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/findRoommate.css";
import "../../styles/utility.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

// const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";
// const API_BASE = `http://${MYIP}:5000`;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FindRoommate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchScores, setMatchScores] = useState({});
  const [savedRoommates, setSavedRoommates] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    city: "",
    gender: "",
    maxBudget: "",
    food: "",
    sleep: "",
    workType: ""
  });

  // Fetch user profile and roommates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all roommates
        const roommatesRes = await fetch(`${API_BASE}/api/roommates`);
        if (!roommatesRes.ok) {
          throw new Error("Failed to fetch roommates");
        }
        const roommatesData = await roommatesRes.json();
        setRoommates(roommatesData);

        // If user is logged in, fetch their profile and saved items
        if (user?.id) {
          // Fetch user profile for matching
          const profileRes = await fetch(`${API_BASE}/api/profile?user_id=${user.id}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUserProfile(profileData.profile);
            
            // Calculate match scores using actual user profile
            calculateMatchScores(roommatesData, profileData.profile);
          }

          // Fetch saved status
          fetchSavedStatus(roommatesData.map(rm => rm.id));
        } else {
          // For non-logged in users, show all without scores
          setMatchScores({});
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate match scores based on user profile
  const calculateMatchScores = (roommateList, profile) => {
    if (!profile) return;

    const scores = {};

    for (const roommate of roommateList) {
      if (roommate.user_id === user?.id) continue; // Skip own listings

      let score = 0;
      const reasons = [];

      // City match (30 points)
      if (profile.location?.toLowerCase() === roommate.city?.toLowerCase()) {
        score += 30;
        reasons.push("Same city");
      }

      // Budget compatibility (25 points)
      if (profile.max_budget && roommate.budget) {
        const budgetDiff = Math.abs(profile.max_budget - roommate.budget);
        if (budgetDiff <= 2000) {
          score += 25;
          reasons.push("Budget compatible");
        } else if (budgetDiff <= 5000) {
          score += 15;
          reasons.push("Budget nearby");
        }
      }

      // Gender preference match (15 points)
      if (profile.preferred_gender === 'Any' || 
          roommate.gender?.toLowerCase() === profile.preferred_gender?.toLowerCase()) {
        score += 15;
        reasons.push("Gender preference matches");
      }

      // Food preference (10 points)
      if (profile.food_preference === roommate.food) {
        score += 10;
        reasons.push("Same food preference");
      }

      // Sleep schedule (10 points)
      if (profile.sleep_schedule === roommate.sleep) {
        score += 10;
        reasons.push("Same sleep schedule");
      }

      // Work type (5 points)
      if (profile.work_type === roommate.workType) {
        score += 5;
        reasons.push("Same work type");
      }

      // Interests match (2 points each, max 5)
      if (profile.interests?.length > 0 && roommate.interests?.length > 0) {
        const commonInterests = profile.interests.filter(interest => 
          roommate.interests.includes(interest)
        ).length;
        const interestPoints = Math.min(commonInterests * 2, 5);
        score += interestPoints;
        if (commonInterests > 0) {
          reasons.push(`${commonInterests} common interests`);
        }
      }

      // Store score and reasons
      scores[roommate.id] = {
        score: Math.min(score, 100),
        reasons: reasons
      };
    }

    setMatchScores(scores);
  };

  // Fetch saved status for roommates
  const fetchSavedStatus = async (roommateIds) => {
    if (!user?.id || roommateIds.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/saved/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          itemIds: roommateIds,
          itemType: 'roommate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedRoommates(data.savedStatus);
      }
    } catch (error) {
      console.error("Error fetching saved status:", error);
    }
  };

  // Toggle save roommate
  const toggleSaveRoommate = async (e, roommateId) => {
    e.stopPropagation();

    if (!user) {
      showNotification('Please login to save profiles', 'error', 3000);
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/saved/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: roommateId,
          itemType: 'roommate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedRoommates(prev => ({
          ...prev,
          [roommateId]: data.isSaved
        }));
        showNotification(
          data.isSaved ? 'Profile saved successfully!' : 'Profile removed from saved',
          'success',
          2000
        );
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to save profile', 'error', 3000);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      showNotification('Failed to save profile', 'error', 3000);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      city: "",
      gender: "",
      maxBudget: "",
      food: "",
      sleep: "",
      workType: ""
    });
  };

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/300x200";
    if (Array.isArray(image) && image.length > 0) return image[0];
    return image;
  };

  // Filter roommates
  const filteredRoommates = roommates.filter((r) => {
    // Don't show user's own listings
    if (r.user_id === user?.id) return false;

    const matchesCity = !filters.city || r.city === filters.city;
    const matchesGender = !filters.gender || r.gender === filters.gender;
    const matchesBudget = !filters.maxBudget || r.budget <= parseInt(filters.maxBudget);
    const matchesFood = !filters.food || r.food === filters.food;
    const matchesSleep = !filters.sleep || r.sleep === filters.sleep;
    const matchesWorkType = !filters.workType || r.workType === filters.workType;

    return matchesCity && matchesGender && matchesBudget && 
           matchesFood && matchesSleep && matchesWorkType;
  });

  // Sort by match score (highest first)
  const sortedRoommates = [...filteredRoommates].sort((a, b) => {
    const scoreA = matchScores[a.id]?.score || 0;
    const scoreB = matchScores[b.id]?.score || 0;
    return scoreB - scoreA;
  });

  // Get unique values for filters
  const cities = [...new Set(roommates.map(r => r.city).filter(Boolean))];
  const genders = [...new Set(roommates.map(r => r.gender).filter(Boolean))];
  const foodPrefs = [...new Set(roommates.map(r => r.food).filter(Boolean))];
  const sleepPrefs = [...new Set(roommates.map(r => r.sleep).filter(Boolean))];
  const workTypes = [...new Set(roommates.map(r => r.workType).filter(Boolean))];

  const getMatchColor = (score) => {
    if (score >= 80) return '#dcfce7';  // light green
    if (score >= 60) return '#fef9c3';  // light yellow
    if (score >= 40) return '#ffedd5';  // light orange
    return '#fee2e2';                   // light red
  };

  const getTextColor = (score) => {
    if (score >= 80) return '#166534';  // dark green
    if (score >= 60) return '#854d0e';  // dark yellow/brown
    if (score >= 40) return '#9a3412';  // dark orange
    return '#991b1b';                   // dark red
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading-spinner">
            <p>Finding compatible roommates...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="find-room-page">
          <h1 className="page-title">Find a Roommate</h1>

          {/* Show profile completion message if user not logged in or profile incomplete */}
          {/* {!user && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>
              <span>
                <Link to="/login" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Login</Link> to see personalized matches
              </span>
            </div>
          )} */}

          {/* {user && !userProfile && (
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <span>
                Complete your <Link to="/update-profile" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>profile</Link> for better matches
              </span>
            </div>
          )} */}

          {/* Filter Section */}
          <div className="filters-section">
            <div className="filter-row">
              <div className="results-count">
                <p className="m-0">{filteredRoommates.length}</p>
                <p className="m-0">roommates found</p>
              </div>

              <div className="filter-group">
                <label>City</label>
                <select name="city" value={filters.city} onChange={handleFilterChange}>
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Gender</label>
                <select name="gender" value={filters.gender} onChange={handleFilterChange}>
                  <option value="">Any</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Max Budget (₹)</label>
                <input
                  type="number"
                  name="maxBudget"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  placeholder="Enter max budget"
                />
              </div>

              <div className="filter-group">
                <label>Food Preference</label>
                <select name="food" value={filters.food} onChange={handleFilterChange}>
                  <option value="">Any</option>
                  {foodPrefs.map(food => (
                    <option key={food} value={food}>{food}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sleep Schedule</label>
                <select name="sleep" value={filters.sleep} onChange={handleFilterChange}>
                  <option value="">Any</option>
                  {sleepPrefs.map(sleep => (
                    <option key={sleep} value={sleep}>{sleep}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Work Type</label>
                <select name="workType" value={filters.workType} onChange={handleFilterChange}>
                  <option value="">Any</option>
                  {workTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group filter-actions">
                <button className="btn btn-primary ml-20 radius-25" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Roommates Grid */}
          {sortedRoommates.length > 0 ? (
            <div className="rooms-grid">
              {sortedRoommates.map((roommate) => {
                const matchInfo = matchScores[roommate.id] || { score: 0, reasons: [] };
                const matchScore = matchInfo.score;
                const matchColor = getMatchColor(matchScore);
                const textColor = getTextColor(matchScore);

                return (
                  <div
                    className="room-card"
                    key={roommate.id}
                    onClick={() => navigate(`/roommate/${roommate.id}`)}
                  >
                    <div className="room-image">
                      <img src={getImageUrl(roommate.images)} alt={roommate.name} />

                      {roommate.verified && (
                        <span className="verified-badge">
                          <i className="fas fa-check-circle"></i>
                          Verified
                        </span>
                      )}
                      
                      {/* Match Score Badge */}
                      {user && userProfile && matchScore > 0 && (
                        <div
                          className="match-score-badge"
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            background: matchColor,
                            color: textColor,
                            padding: '6px 14px',
                            borderRadius: '25px',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                            zIndex: 2,
                            cursor: 'default'
                          }}
                          title={matchInfo.reasons.join(', ')}
                        >
                          {matchScore}% Match
                        </div>
                      )}
                      
                      {/* Save/Bookmark button */}
                      <div
                        className="bookmark"
                        title={savedRoommates[roommate.id] ? "Remove from saved" : "Save profile"}
                        onClick={(e) => toggleSaveRoommate(e, roommate.id)}
                      >
                        <i className={`${savedRoommates[roommate.id] ? 'fas fa-solid' : 'fa-regular'} fa-heart glass-bookmark ${savedRoommates[roommate.id] ? 'saved' : ''}`}></i>
                      </div>
                    </div>

                    <div className="room-info">
                      <h3>{roommate.name}, {roommate.age}</h3>

                      <p className="location">
                        <i className="fas fa-map-marker-alt"></i> {roommate.city}
                      </p>

                      <p className="occupation">
                        <i className="fas fa-briefcase"></i> {roommate.occupation}
                      </p>

                      <div className="room-tags">
                        <span className="tag">{roommate.food}</span>
                        <span className="tag">{roommate.sleep}</span>
                        <span className="tag">{roommate.workType}</span>
                      </div>

                      <p className="budget mb-0">
                        <i className="fas fa-rupee-sign mr-10"></i> {roommate.budget}/month
                      </p>

                      {/* Show match reasons on hover or click */}
                      {/* {user && matchInfo.reasons.length > 0 && (
                        <div className="match-reasons">
                          <small>
                            <i className="fas fa-check-circle" style={{ color: '#2667cc' }}></i>
                            {' '}{matchInfo.reasons[0]}
                            {matchInfo.reasons.length > 1 && ' +' + (matchInfo.reasons.length - 1) + ' more'}
                          </small>
                        </div>
                      )} */}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <i className="fas fa-users"></i>
              <h3>No roommates found</h3>
              <p>Try adjusting your filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FindRoommate;