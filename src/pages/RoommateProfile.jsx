// RoommateProfile.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/roomDetails.css";
import "../../styles/utility.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

// const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";
// const API_BASE = `http://${MYIP}:5000`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const RoommateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Get passed data from navigation state
  const passedData = location.state;

  const [roommate, setRoommate] = useState(passedData?.roommate || null);
  const [matchInfo, setMatchInfo] = useState(passedData?.matchScore || { score: 0, reasons: [] });
  const [loading, setLoading] = useState(!passedData?.roommate);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isSavedLoading, setIsSavedLoading] = useState(false);

  useEffect(() => {
    // Always fetch fresh data in background to ensure accuracy
    const fetchFreshData = async () => {
      try {
        // Fetch roommate details
        const roommateRes = await fetch(`${API_BASE}/api/roommates/${id}`);
        if (!roommateRes.ok) {
          throw new Error("Roommate not found");
        }
        const freshData = await roommateRes.json();
        console.log(freshData)
        setRoommate(freshData);

        // Set main image
        if (freshData.images && Array.isArray(freshData.images) && freshData.images.length > 0) {
          setMainImage(freshData.images[0]);
        } else if (freshData.image && Array.isArray(freshData.image) && freshData.image.length > 0) {
          setMainImage(freshData.image[0]);
        } else if (freshData.image) {
          setMainImage(freshData.image);
        }

        // If user is logged in, fetch their profile and calculate fresh match score
        if (user?.id) {
          const profileRes = await fetch(`${API_BASE}/api/profile?user_id=${user.id}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUserProfile(profileData.profile);

            // Calculate fresh match score
            const freshMatch = calculateMatchScore(freshData, profileData.profile);
            setMatchInfo(freshMatch);
          }
        }

        // Check if saved
        await checkSavedStatus(freshData.id);

      } catch (err) {
        setError(err.message);
        console.error("Error fetching roommate:", err);
        showNotification('Failed to load profile', 'error', 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshData();
  }, [id, user]);

  // Calculate match score based on user profile
  const calculateMatchScore = (target, profile) => {
    if (!profile) return { score: 0, reasons: [] };

    let score = 0;
    const reasons = [];

    // City match (30 points)
    if (profile.location?.toLowerCase() === target.city?.toLowerCase()) {
      score += 30;
      reasons.push("Same city");
    }

    // Budget compatibility (25 points)
    if (profile.max_budget && target.budget) {
      const budgetDiff = Math.abs(profile.max_budget - target.budget);
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
      target.gender?.toLowerCase() === profile.preferred_gender?.toLowerCase()) {
      score += 15;
      reasons.push("Gender preference matches");
    }

    // Food preference (10 points)
    if (profile.food_preference === target.food) {
      score += 10;
      reasons.push("Same food preference");
    }

    // Sleep schedule (10 points)
    if (profile.sleep_schedule === target.sleep) {
      score += 10;
      reasons.push("Same sleep schedule");
    }

    // Work type (5 points)
    if (profile.work_type === target.workType) {
      score += 5;
      reasons.push("Same work type");
    }

    // Interests match (2 points each, max 5)
    if (profile.interests?.length > 0 && target.interests?.length > 0) {
      const commonInterests = profile.interests.filter(interest =>
        target.interests.includes(interest)
      ).length;
      const interestPoints = Math.min(commonInterests * 2, 5);
      score += interestPoints;
      if (commonInterests > 0) {
        reasons.push(`${commonInterests} common ${commonInterests === 1 ? 'interest' : 'interests'}`);
      }
    }

    return {
      score: Math.min(score, 100),
      reasons: reasons
    };
  };

  const checkSavedStatus = async (roommateId) => {
    if (!user?.id) {
      // Fallback to localStorage for non-logged in users
      const savedRoommates = JSON.parse(localStorage.getItem("savedRoommates")) || [];
      setSaved(savedRoommates.some(r => r.id === roommateId));
      return;
    }

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
          itemIds: [roommateId],
          itemType: 'roommate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSaved(data.savedStatus[roommateId] || false);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      showNotification('Please login to save profiles', 'error');
      navigate('/login');
      return;
    }

    setIsSavedLoading(true);

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
          itemId: roommate.id,
          itemType: 'roommate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSaved(data.isSaved);
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
      console.error("Error saving profile:", error);
      showNotification('Failed to save profile', 'error', 3000);
    } finally {
      setIsSavedLoading(false);
    }
  };

  const downloadImage = async (imageUrl, imageName = "profile-image") => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageName}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      showNotification("Failed to download image", 'error', 3000);
    }
  };

  const openFullscreen = (imageSrc) => {
    setFullscreenImage(imageSrc);
    setShowFullscreen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
    setFullscreenImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateFullscreen = (direction) => {
    const allImages = getAllImages();
    if (allImages.length === 0) return;

    const currentIndex = allImages.indexOf(fullscreenImage);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % allImages.length;
    } else {
      newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    }

    setFullscreenImage(allImages[newIndex]);
  };

  const openInGoogleMaps = () => {
    if (roommate.latitude && roommate.longitude) {
      window.open(`https://www.google.com/maps?q=${roommate.latitude},${roommate.longitude}`, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(roommate.city || '');
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const getDirections = () => {
    if (roommate.latitude && roommate.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${roommate.latitude},${roommate.longitude}`, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(roommate.city || '');
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
  };

  const getAllImages = () => {
    if (roommate?.images && Array.isArray(roommate.images) && roommate.images.length > 0) {
      return roommate.images;
    } else if (roommate?.image && Array.isArray(roommate.image) && roommate.image.length > 0) {
      return roommate.image;
    } else if (roommate?.image) {
      return [roommate.image];
    }
    return [];
  };

  const getMatchColor = (score) => {
    if (score >= 80) return '#dcfce7';
    if (score >= 60) return '#fef9c3';
    if (score >= 40) return '#ffedd5';
    return '#fee2e2';
  };

  const getTextColor = (score) => {
    if (score >= 80) return '#166534';
    if (score >= 60) return '#854d0e';
    if (score >= 40) return '#9a3412';
    return '#991b1b';
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('Link copied to clipboard!', 'success', 2000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading-spinner">
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !roommate) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="not-found">
            <i className="fas fa-user-slash"></i>
            <h2>Profile Not Found</h2>
            <p>The roommate profile you're looking for doesn't exist.</p>
            <button className="btn btn-primary" onClick={() => navigate("/find-roommate")}>
              Browse Roommates
            </button>
          </div>
        </div>
      </>
    );
  }

  const allImages = getAllImages();

  return (
    <>
      <Navbar />

      {/* Fullscreen Image Modal */}
      {showFullscreen && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-close" onClick={closeFullscreen}>
              <i className="fas fa-times"></i>
            </button>

            {allImages.length > 1 && (
              <>
                <button
                  className="fullscreen-nav fullscreen-prev"
                  onClick={(e) => { e.stopPropagation(); navigateFullscreen('prev'); }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="fullscreen-nav fullscreen-next"
                  onClick={(e) => { e.stopPropagation(); navigateFullscreen('next'); }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}

            <img
              src={fullscreenImage}
              alt={`${roommate.name} fullscreen`}
              className="fullscreen-image"
            />

            <button
              className="fullscreen-download"
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(fullscreenImage, `${roommate.name}-${id}`);
              }}
            >
              <i className="fas fa-download"></i> Download
            </button>

            <div className="fullscreen-counter">
              {allImages.indexOf(fullscreenImage) + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="room-details-page">
          <p className="status-applied status-badge flex items-center justify-center radius-0 p-10 w-100">
            Get to know <span style={{ padding: '0 10px', "text-transform": "uppercase" }} className="font-11 font-700">{roommate.name}</span> and see if you'd be a great match for living together
          </p>

          <div className="room-details-container">
            {/* LEFT COLUMN */}
            <div className="left-column flex gap-10 flex-col">
              {/* IMAGE GALLERY */}
              <div className="gallery">
                <div className="main-image-container">
                  <img
                    src={mainImage || "https://via.placeholder.com/600x400"}
                    className="main-image"
                    alt={roommate.name}
                    onClick={() => mainImage && openFullscreen(mainImage)}
                    style={{ cursor: mainImage ? 'pointer' : 'default' }}
                  />

                  {mainImage && (
                    <button
                      className="download-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(mainImage, `${roommate.name}-main`);
                      }}
                      title="Download image"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  )}

                  {/* Verified Badge */}
                  {/* {roommate.verified && (
                    <span className="verified-badge-large">
                      <i className="fas fa-check-circle"></i> Verified
                    </span>
                  )} */}
                </div>

                {/* THUMBNAIL ROW */}
                {allImages.length > 1 && (
                  <div className="thumbnail-row">
                    {allImages.map((img, i) => (
                      <div key={i} className="thumbnail-wrapper">
                        <img
                          src={img}
                          alt={`${roommate.name} ${i + 1}`}
                          className={mainImage === img ? "active" : ""}
                          onClick={() => setMainImage(img)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MAP */}
              {(roommate.latitude || roommate.longitude || roommate.city) && (
                <>
                  <div
                    className="map-container"
                    onClick={openInGoogleMaps}
                    style={{ cursor: 'pointer', height: '250px' }}
                  >
                    <iframe
                      title="map"
                      src={
                        roommate.latitude && roommate.longitude
                          ? `https://www.google.com/maps?q=${roommate.latitude},${roommate.longitude}&z=12&output=embed`
                          : `https://www.google.com/maps?q=${encodeURIComponent(roommate.city || '')}&z=12&output=embed`
                      }
                      loading="lazy"
                      style={{ pointerEvents: 'none', width: '100%', height: '100%', border: 'none' }}
                    ></iframe>
                    <div className="map-overlay">
                      <i className="fas fa-external-link-alt"></i> Click to open in Google Maps
                    </div>
                  </div>

                  {/* Directions Button */}
                  <div className="map-buttons">
                    <button className="btn btn-secondary btn-block radius-0" onClick={getDirections}>
                      <i className="fas fa-directions"></i> Get Directions
                    </button>
                  </div>
                </>
              )}
              {/* Match Reasons Card */}
              {matchInfo.reasons.length > 0 && (
                <div className="owner-card">
                  <h3>
                    <i className="fas fa-heart" style={{ color: '#ef476f', marginRight: '8px' }}></i>
                    Why You Match ({matchInfo.score}%)
                  </h3>
                  <div className="match-reasons-list">
                    {matchInfo.reasons.map((reason, index) => (
                      <div key={index} className="match-reason-item">
                        <i className="fas fa-check-circle"></i>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="right">
              {/* DETAILS SECTION */}
              <div className="details-section">
                <div className="flex justify-between items-start">
                  <h1 style={{ "text-transform": "uppercase" }} className="mt-0">{roommate.name}, {roommate.age || 'N/A'}</h1>

                  {/* Save Button - Always Visible */}
                  <button
                    className={`save-button ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                    disabled={isSavedLoading}
                    title={saved ? "Remove from saved" : "Save profile"}
                  >
                    <i className={`${saved ? 'fas fa-solid' : 'fa-regular'} fa-heart glass-bookmark glass-bookmark1`}></i>
                    {/* <span>{saved ? 'Saved' : 'Save'}</span> */}
                  </button>
                </div>

                {/* Meta Row */}
                <div className="meta-row">
                  <p className="status-badge status-applied m-0">{roommate.occupation || 'Not specified'}</p>

                  {/* {roommate?.verified && (
                    <span className="status-badge status-applied">
                      <i className="fas fa-check-circle"></i> {roommate?.verified}
                    </span>
                  )} */}


                  <span className={`status-badge ${roommate?.verified ? "status-applied" : "status-interview"}`}>
                    <i className={`fas ${roommate?.verified ? "fa-check-circle" : "fa-times-circle"} mr-5`}></i>
                    {roommate?.verified ? "Verified" : "Not Verified"}
                  </span>

                  {roommate.status && (
                    <span className="status-badge status-applied">
                      <i className="fas fa-check-circle mr-5"></i>{roommate.status}
                    </span>
                  )}

                  {/* Match Score Badge with Reasons Tooltip */}
                  {matchInfo.score > 0 && (
                    <span
                      className="status-badge match-score-badge"
                      style={{
                        background: getMatchColor(matchInfo.score),
                        color: getTextColor(matchInfo.score)
                      }}
                      title={matchInfo.reasons.join('\n')}
                    >
                      {matchInfo.score}% Match
                      {matchInfo.reasons.length > 0 && (
                        <i className="fas fa-info-circle" style={{ marginLeft: '5px', fontSize: '0.7rem' }}></i>
                      )}
                    </span>
                  )}
                </div>

                {/* Location */}
                <p className="address" onClick={openInGoogleMaps} style={{ cursor: 'pointer' }}>
                  <i className="fas fa-map-marker-alt"></i> {roommate.city || 'Location not specified'}
                  <i className="fas fa-external-link-alt" style={{ marginLeft: '8px', fontSize: '0.8rem' }}></i>
                </p>

                {/* Budget */}
                <h2 className="address">₹{roommate.budget || 0} / month</h2>

                {/* Tags Row */}
                <div className="tag-row flex flex-wrap">
                  <span className="status-badge status-applied">{roommate.food || 'N/A'}</span>
                  <span className="status-badge status-applied">{roommate.sleep || 'N/A'}</span>
                  <span className="status-badge status-applied">{roommate.workType || 'N/A'}</span>
                </div>

                {/* About Section */}
                <h3 style={{ "text-transform": "capitalize" }}>About {roommate.name}:</h3>
                <p className="description">{roommate.about || 'No description provided.'}</p>
              </div>



              {/* Interests Section */}
              {roommate.interests && roommate.interests.length > 0 && (
                <div className="owner-card">
                  <h3>Interests :</h3>
                  <div className="amenities">
                    {roommate.interests.map((interest, i) => (
                      <span key={i}>
                        <i className="fas fa-heart"></i> {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences */}
              {roommate.preferences && roommate.preferences.length > 0 && (
                <div className="owner-card">
                  <h3>Looking for :</h3>
                  <div className="amenities">
                    {roommate.preferences.map((pref, i) => (
                      <span key={i}>
                        <i className="fas fa-check-circle"></i> {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Card */}
              <div className="owner-card">
                <h3>Contact Details</h3>
                <p style={{ "text-transform": "capitalize" }}><i className="fas fa-user"></i> {roommate.name || 'N/A'}</p>
                <p><i className="fas fa-phone"></i> {roommate.phone || 'N/A'}</p>
                <p><i className="fas fa-envelope"></i> {roommate.email || 'N/A'}</p>
                {roommate.whatsapp && roommate.whatsapp !== roommate.phone && (
                  <p><i className="fa-brands fa-whatsapp"></i> {roommate.whatsapp}</p>
                )}
              </div>
              {/* ACTION BUTTONS */}
              <div className="action-buttons">
                {roommate.phone && (
                  <a href={`tel:${roommate.phone}`} className="btn btn-primary btn-block">
                    <i className="fas fa-phone fa-lg mr-5"></i> Call
                  </a>
                )}

                {roommate.email && (
                  <a href={`mailto:${roommate.email}`} className="btn btn-primary btn-block">
                    <i className="fas fa-envelope fa-lg mr-5"></i> Email
                  </a>
                )}

                {roommate.phone && (
                  <a
                    href={`https://wa.me/91${roommate.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-block"
                  >
                    <i className="fa-brands fa-whatsapp fa-lg mr-5"></i> WhatsApp
                  </a>
                )}

                <button className="btn btn-primary btn-block radius-0" onClick={handleShare}>
                  <i className="fas fa-share-alt fa-lg mr-5"></i> Share
                </button>
              </div>
            </div>

          </div>


        </div>
      </div>
    </>
  );
};

export default RoommateProfile;