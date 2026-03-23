import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/findRoom.css";
import "../../styles/utility.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";



// const MYIP = "10.213.0.68";
// const MYIP = "10.142.158.68";
// const API_BASE = `http://${MYIP}:5000`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FindRoom = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savedRooms, setSavedRooms] = useState({}); // Object with roomId as key and boolean as value

    // Filter states
    const [filters, setFilters] = useState({
        city: "",
        type: "",
        maxPrice: "",
        gender: ""
    });

    // Helper function to get image URL (handles both string and array)
    const getImageUrl = (image) => {
        if (!image) return "https://via.placeholder.com/300x200";
        if (Array.isArray(image) && image.length > 0) return image[0];
        return image;
    };

    // Fetch rooms from backend
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/rooms`);
                if (!response.ok) {
                    throw new Error("Failed to fetch rooms");
                }
                const data = await response.json();
                console.log("Rooms fetched:", data);
                setRooms(data);

                // If user is logged in, fetch their saved rooms
                if (user?.id) {
                    fetchSavedStatus(data.map(room => room.id));
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching rooms:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [user]);

    // Fetch saved status for rooms
    const fetchSavedStatus = async (roomIds) => {
        if (!user?.id || roomIds.length === 0) return;

        try {
            // const token = localStorage.getItem('token');
            console.log(localStorage.getItem('token'))
            const response = await fetch(`${API_BASE}/api/saved/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    itemIds: roomIds,
                    itemType: 'room'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSavedRooms(data.savedStatus);
            }
        } catch (error) {
            console.error("Error fetching saved status:", error);
        }
    };

    // Toggle save room
    const toggleSaveRoom = async (e, roomId) => {
        e.stopPropagation(); // Prevent card click

        if (!user) {
            showNotification('Please login to save rooms', 'warning', 3000);
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            console.log(token)
            const response = await fetch(`${API_BASE}/api/saved/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    itemId: roomId,
                    itemType: 'room'
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Update local state
                setSavedRooms(prev => ({
                    ...prev,
                    [roomId]: data.isSaved
                }));

                // Show notification
                showNotification(
                    data.isSaved ? 'Room saved successfully!' : 'Room removed from saved',
                    'success',
                    2000
                );
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to save room', 'error', 3000);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            showNotification('Failed to save room', 'error', 3000);
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
            type: "",
            maxPrice: "",
            gender: ""
        });
    };

    // Filter rooms based on selected filters
    const filteredRooms = rooms.filter((room) => {
        const matchesCity = filters.city === "" || room.city === filters.city;
        const matchesType = filters.type === "" || room.type === filters.type;
        const matchesGender = filters.gender === "" || room.gender === filters.gender;
        const matchesPrice = filters.maxPrice === "" || room.price <= parseInt(filters.maxPrice);

        return matchesCity && matchesType && matchesPrice && matchesGender;
    });

    // Get unique cities and types for filter dropdowns
    const cities = [...new Set(rooms.map(room => room.city).filter(Boolean))];
    const types = [...new Set(rooms.map(room => room.type).filter(Boolean))];

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container">
                    <div className="loading-spinner">
                        <p>Loading rooms...</p>
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
                    <h1 className="page-title">Find Available Rooms</h1>

                    {/* Filter Section */}
                    <div className="filters-section">
                        <div className="filter-row">
                            <div className="results-count">
                                <p className="m-0">{filteredRooms.length}</p>
                                <p className="m-0">rooms found</p>
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
                                <label>Room Type</label>
                                <select name="type" value={filters.type} onChange={handleFilterChange}>
                                    <option value="">All Types</option>
                                    {types.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Max Price (₹)</label>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Enter max price"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Gender</label>
                                <select name="gender" value={filters.gender} onChange={handleFilterChange}>
                                    <option value="">Any</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="both">Both (Male & Female)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="filter-group filter-actions">
                                <button className="btn btn-primary ml-20 radius-25" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rooms Grid */}
                    {filteredRooms.length > 0 ? (
                        <div className="rooms-grid">
                            {filteredRooms.map((room) => (
                                <div
                                    className="room-card"
                                    key={room.id}
                                    onClick={() => navigate(`/room/${room.id}`)}
                                >
                                    <div className="room-image">
                                        <img src={getImageUrl(room.images || room.image)} alt={room.title} />

                                        <div
                                            className="bookmark"
                                            title={savedRooms[room.id] ? "Remove from saved" : "Save room"}
                                            onClick={(e) => toggleSaveRoom(e, room.id)}
                                        >
                                            <i className={`${savedRooms[room.id] ? 'fas  fa-solid' : 'fa-regular'} fa-heart glass-bookmark ${savedRooms[room.id] ? 'saved' : ''}`}></i>
                                        </div>
                                    </div>
                                    <div className="room-info">
                                        <h3 style={{ "textTransform": "uppercase" }}>{room.title}</h3>

                                        <p className="location">
                                            <i className="fas fa-map-marker-alt"></i> {room.address || room.city}
                                        </p>

                                        <div className="room-tags">
                                            <span className="tag">{room.type}</span>
                                            <span className="tag">{room.occupancy || 'Private'}</span>
                                        </div>

                                        <div className="amenities">
                                            {room.amenities && room.amenities.slice(0, 3).map((item, index) => (
                                                <span key={index} className="amenity">
                                                    <i className="fas fa-check-circle"></i> {item}
                                                </span>
                                            ))}
                                            {room.amenities && room.amenities.length > 3 && (
                                                <span className="amenity more">+{room.amenities.length - 3}</span>
                                            )}
                                        </div>

                                        <p className="available-date">
                                            Available: {room.availableFrom ? new Date(room.availableFrom).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short'
                                            }) : 'Flexible'}
                                            <span className="price-badge">₹{room.price}/mo</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <i className="fas fa-search"></i>
                            <h3>No rooms found</h3>
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

export default FindRoom;