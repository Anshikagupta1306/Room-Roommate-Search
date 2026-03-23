import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/roomDetails.css";
import "../../styles/utility.css";
import Navbar from "../components/Navbar";

// const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";
// const API_BASE = `http://${MYIP}:5000`;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [saved, setSaved] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null); // For fullscreen view
  const [showFullscreen, setShowFullscreen] = useState(false); // Toggle fullscreen modal

  // Fetch room from backend
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/rooms/${id}`);
        if (!response.ok) {
          throw new Error("Room not found");
        }
        const data = await response.json();
        setRoom(data);

        // Set main image to first image if available
        if (data.images) {
          if (Array.isArray(data.images) && data.images.length > 0) {
            setMainImage(data.images[0]);
          } else if (typeof data.images === 'string') {
            setMainImage(data.images);
          }
        } else if (data.image) {
          // Fallback to single image field
          setMainImage(data.image);
        }

        // Check if saved
        const savedRooms = JSON.parse(localStorage.getItem("savedRooms")) || [];
        setSaved(savedRooms.some(r => r.id === data.id));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching room:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleSave = () => {

    if (!user) {
      showNotification('Please login to save profiles', 'error');
      navigate('/login');
      return;
    }

    const savedRooms = JSON.parse(localStorage.getItem("savedRooms")) || [];
    const exists = savedRooms.find((r) => r.id === room.id);

    const updated = exists
      ? savedRooms.filter((r) => r.id !== room.id)
      : [...savedRooms, room];

    localStorage.setItem("savedRooms", JSON.stringify(updated));
    setSaved(!exists);
  };

  // Function to download image
  const downloadImage = async (imageUrl, imageName = "room-image") => {
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
      alert("Failed to download image");
    }
  };

  // Function to open image in fullscreen
  const openFullscreen = (imageSrc) => {
    setFullscreenImage(imageSrc);
    setShowFullscreen(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Function to close fullscreen
  const closeFullscreen = () => {
    setShowFullscreen(false);
    setFullscreenImage(null);
    document.body.style.overflow = 'unset';
  };

  // Navigate through images in fullscreen
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

  // Function to open in Google Maps
  const openInGoogleMaps = () => {
    if (room.latitude && room.longitude) {
      window.open(`https://www.google.com/maps?q=${room.latitude},${room.longitude}`, '_blank');
    } else if (room.location?.coordinates) {
      // Handle nested coordinates object if that structure was used
      const { lat, lng } = room.location.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else if (room.address) {
      const encodedAddress = encodeURIComponent(room.address + ', ' + (room.city || ''));
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  // Function to get directions
  const getDirections = () => {
    if (room.latitude && room.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${room.latitude},${room.longitude}`, '_blank');
    } else if (room.location?.coordinates) {
      const { lat, lng } = room.location.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(room.address + ', ' + (room.city || ''));
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
  };

  // Helper function to get all images for gallery
  const getAllImages = () => {
    if (room.images && Array.isArray(room.images) && room.images.length > 0) {
      return room.images;
    } else if (room.image && Array.isArray(room.image)) {
      return room.image;
    } else if (room.image) {
      return [room.image];
    } else if (room.images && typeof room.images === 'string') {
      return [room.images];
    }
    return [];
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading-spinner">
            <p>Loading room details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !room) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="not-found mt-20">
            <i className="fas fa-home"></i>
            <h2>Room Not Found</h2>
            <p>The room you're looking for doesn't exist.</p>
            <button className="btn btn-primary" onClick={() => navigate("/find-room")}>
              Browse Rooms
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
              alt="Fullscreen view"
              className="fullscreen-image"
            />

            <button
              className="fullscreen-download"
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(fullscreenImage, `room-${id}`);
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
            Take a closer look at this room and imagine yourself living here
          </p>
          <div className="room-details-container">
            {/* LEFT COLUMN */}
            <div className="left-column flex gap-30 flex-col">
              {/* IMAGE GALLERY */}
              <div className="gallery">
                <div className="main-image-container">
                  <img
                    src={mainImage || "https://via.placeholder.com/600x400"}
                    className="main-image"
                    alt={room.title || "Room"}
                    onClick={() => mainImage && openFullscreen(mainImage)}
                    style={{ cursor: mainImage ? 'pointer' : 'default' }}
                  />
                  {mainImage && (
                    <button
                      className="download-btn btn0"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(mainImage, `room-${id}-main`);
                      }}
                      title="Download image"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  )}
                </div>

                {allImages.length > 1 && (
                  <div className="thumbnail-row">
                    {allImages.map((img, i) => (
                      <div key={i} className="thumbnail-wrapper">
                        <img
                          src={img}
                          alt={`thumbnail ${i + 1}`}
                          className={mainImage === img ? "active" : ""}
                          onClick={() => setMainImage(img)}
                        />
                        {/* <button 
                          className="thumbnail-download-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(img, `room-${id}-thumb-${i+1}`);
                          }}
                          title="Download thumbnail"
                        >
                          <i className="fas fa-download"></i>
                        </button> */}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MAP with click to open in Google Maps */}
              {(room.latitude || room.longitude || room.address) && (
                <>
                  <div
                    className="map-container"
                    onClick={openInGoogleMaps}
                    style={{ cursor: 'pointer' }}
                  >
                    <iframe
                      title="map"
                      src={
                        room.latitude && room.longitude
                          ? `https://www.google.com/maps?q=${room.latitude},${room.longitude}&z=15&output=embed`
                          : `https://www.google.com/maps?q=${encodeURIComponent(room.address + ', ' + (room.city || ''))}&z=15&output=embed`
                      }
                      loading="lazy"
                      style={{ pointerEvents: 'none' }}
                    ></iframe>
                    <div className="map-overlay">
                      <i className="fas fa-external-link-alt"></i> Click to open in Google Maps
                    </div>
                  </div>
                  <div className="map-buttons">
                    <button className="btn btn-secondary btn-block radius-0" onClick={getDirections}>
                      <i className="fas fa-directions"></i> Get Directions
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="right ">
              <div className="details-section">
                <h1 style={{ "text-transform": "uppercase" }} className="mt-0">{room.title || "Untitled Room"}</h1>

                <div className="meta-row">
                  {room.verifiedOwner || room.verified ? (
                    <span className="verified-badge1 status-badge status-applied m-0">
                      <i className="fas fa-check-circle"></i> Verified Owner
                    </span>
                  ) : (
                    <span className="status-badge status-reviewed">
                      <i className="fas fa-clock"></i> Unverified
                    </span>
                  )}

                  {/* <span className="status-badge status-applied">
                    {room?.status === "active" || room?.available_from >=
                      ? "Available Now"
                      : room?.status === "rented" || room?.availability === "Occupied"
                        ? "Occupied"
                        : `Available from ${room.availableFrom || 'TBA'}`}
                  </span> */}

                  {/* <span className="status-badge status-applied">
                    {room?.status === "rented" && room?.availability === "Occupied"
                      ? "Occupied"
                      : room?.available_from && new Date(room.available_from) <= new Date()
                        ? "Available Now"
                        : `Available from ${room?.available_from
                          ? new Date(room.available_from).toLocaleDateString()
                          : "TBA"
                        }`}
                  </span> */}

                  <span className="status-badge status-applied">
                    {room?.status === "rented"
                      ? "Occupied"
                      : room?.status === "inactive"
                        ? "Unavailable"
                        : room?.status === "active"
                          ? room?.available_from && new Date(room.available_from) > new Date()
                            ? `Available from ${new Date(room.available_from).toLocaleDateString()}`
                            : "Available Now"
                          : "TBA"}
                  </span>
                </div>

                <p className="address" onClick={openInGoogleMaps} style={{ cursor: 'pointer' }}>
                  <i className="fas fa-map-marker-alt"></i> {room.address || 'Address not specified'}
                  {room.city && `, ${room.city}`}
                  <i className="fas fa-external-link-alt" style={{ marginLeft: '8px', fontSize: '0.8rem' }}></i>
                </p>

                <h2 className="address">₹{room.price || 0} / month</h2>

                <div className="tag-row flex flex-wrap">
                  <span className="status-badge status-applied">{room.type || 'N/A'}</span>
                  <span className="status-badge status-applied">{room.occupancy || 'N/A'}</span>
                  <span className="status-badge status-applied">{room.preferredGender || 'Any'}</span>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <>
                    <h3>Amenities :</h3>
                    <div className="amenities">
                      {room.amenities.map((a, i) => (
                        <span key={i}>
                          <i className="fas fa-check-circle"></i> {a}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {room.rules && room.rules.length > 0 && (
                  <>
                    <h3>House Rules :</h3>
                    <div className="amenities">
                      {room.rules.map((rule, i) => (
                        <span key={i}>
                          <i className="fas fa-exclamation-circle"></i> {rule}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <p className="description">{room.description || 'No description provided.'}</p>
              </div>

              <div>
                {/* OWNER */}
                {room.owner && (
                  <div className="owner-card">
                    <h3>Owner Details</h3>
                    <p style={{ "text-transform": "capitalize" }}><i className="fas fa-user"></i> {room.owner.name || 'N/A'}</p>
                    <p><i className="fas fa-phone"></i> {room.owner.phone || 'N/A'}</p>
                    <p><i className="fas fa-envelope"></i> {room.owner.email || 'N/A'}</p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="action-buttons ">
                  {room.owner?.phone && (
                    <a href={`tel:${room.owner.phone}`} className="btn btn-primary btn-block">
                      <i className="fas fa-phone fa-lg mr-5"></i> Call
                    </a>
                  )}

                  {room.owner?.email && (
                    <a href={`mailto:${room.owner.email}`} className="btn btn-primary btn-block">
                      <i className="fas fa-envelope fa-lg mr-5"></i> Email
                    </a>
                  )}

                  {room.owner?.phone && (
                    <a
                      href={`https://wa.me/91${room.owner.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-block"
                    >
                      <i className="fa-brands fa-whatsapp fa-lg mr-5"></i> WhatsApp
                    </a>
                  )}

                  <button className="btn btn-primary btn-block" onClick={handleSave}>
                    <i className={`fas fa-bookmark fa-lg mr-5 ${saved ? 'saved' : ''}`}></i>
                    {saved ? " Saved" : " Save"}
                  </button>

                  <button
                    className="btn btn-primary btn-block"
                    title="Share"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied!');
                    }}
                  >
                    <i className="fas fa-share-alt mr-5"></i>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomDetails;