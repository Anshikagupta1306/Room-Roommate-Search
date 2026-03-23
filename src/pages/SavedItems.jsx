// SavedItems.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/findRoom.css";
import "../../styles/utility.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";
// const API_BASE = `http://${MYIP}:5000`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SavedItems = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { showNotification } = useNotification();
    const [savedRooms, setSavedRooms] = useState([]);
    const [savedRoommates, setSavedRoommates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rooms');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchSavedItems();
    }, [isAuthenticated, user]);

    const fetchSavedItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token || !user) {
                console.log("No token or user found");
                showNotification('Please login again', 'error', 3000);
                navigate('/login');
                return;
            }

            console.log("Fetching saved items for user:", user.id);
            
            const response = await fetch(`${API_BASE}/api/saved/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log("Saved items response status:", response.status);

            if (response.status === 401 || response.status === 403) {
                showNotification('Session expired. Please login again.', 'error', 3000);
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch saved items: ${response.status}`);
            }

            const data = await response.json();
            console.log("Saved items data:", data);

            // Fetch full details for saved rooms
            if (data.rooms && data.rooms.length > 0) {
                const roomsResponse = await fetch(`${API_BASE}/api/rooms`);
                if (roomsResponse.ok) {
                    const allRooms = await roomsResponse.json();
                    const savedRoomDetails = allRooms.filter(room => data.rooms.includes(room.id));
                    setSavedRooms(savedRoomDetails);
                }
            } else {
                setSavedRooms([]);
            }

            // Fetch full details for saved roommates
            if (data.roommates && data.roommates.length > 0) {
                const roommatesResponse = await fetch(`${API_BASE}/api/roommates`);
                if (roommatesResponse.ok) {
                    const allRoommates = await roommatesResponse.json();
                    const savedRoommateDetails = allRoommates.filter(rm => data.roommates.includes(rm.id));
                    setSavedRoommates(savedRoommateDetails);
                }
            } else {
                setSavedRoommates([]);
            }
        } catch (error) {
            console.error("Error fetching saved items:", error);
            showNotification('Failed to load saved items', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSaved = async (itemId, type) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token || !user) {
                showNotification('Please login again', 'error', 3000);
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE}/api/saved/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    itemId: itemId,
                    itemType: type
                })
            });

            if (response.status === 401 || response.status === 403) {
                showNotification('Session expired. Please login again.', 'error', 3000);
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                
                if (type === 'room') {
                    setSavedRooms(savedRooms.filter(room => room.id !== itemId));
                } else {
                    setSavedRoommates(savedRoommates.filter(rm => rm.id !== itemId));
                }
                showNotification('Item removed from saved', 'success', 2000);
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to remove item', 'error', 3000);
            }
        } catch (error) {
            console.error("Error removing saved item:", error);
            showNotification('Failed to remove item', 'error', 3000);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "https://via.placeholder.com/300x200";
        if (Array.isArray(image) && image.length > 0) return image[0];
        return image;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container">
                    <div className="loading-spinner">
                        <p>Loading saved items...</p>
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
                    <h1 className="page-title">My Saved Items</h1>

                    <div className="saved-tabs flex items-center justify-center gap-10 mb-10">
                        <button
                            className={`btn btn-primary radius-0 ${activeTab === 'rooms' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rooms')}
                        >
                            Saved Rooms ({savedRooms.length})
                        </button>
                        <button
                            className={`btn btn-primary radius-0 ${activeTab === 'roommates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('roommates')}
                        >
                            Saved Roommates ({savedRoommates.length})
                        </button>
                    </div>

                    {activeTab === 'rooms' && (
                        <>
                            {savedRooms.length > 0 ? (
                                <div className="rooms-grid">
                                    {savedRooms.map((room) => (
                                        <div
                                            className="room-card"
                                            key={room.id}
                                            onClick={() => navigate(`/room/${room.id}`)}
                                        >
                                            <div className="room-image">
                                                <img src={getImageUrl(room.images || room.image)} alt={room.title} />
                                                <div
                                                    className="bookmark"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSaved(room.id, 'room');
                                                    }}
                                                >
                                                    <i className="fa-solid fa-heart glass-bookmark saved"></i>
                                                </div>
                                            </div>
                                            <div className="room-info">
                                                <h3>{room.title}</h3>
                                                <p className="location">
                                                    <i className="fas fa-map-marker-alt"></i> {room.address || room.city}
                                                </p>
                                                <p className="available-date">
                                                    <span className="price-badge">₹{room.price}/mo</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-results">
                                    <i className="fas fa-heart"></i>
                                    <h3>No saved rooms</h3>
                                    <p>Start saving rooms you're interested in!</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/find-room')}
                                    >
                                        Browse Rooms
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'roommates' && (
                        <>
                            {savedRoommates.length > 0 ? (
                                <div className="rooms-grid">
                                    {savedRoommates.map((profile) => (
                                        <div
                                            className="room-card"
                                            key={profile.id}
                                            onClick={() => navigate(`/roommate/${profile.id}`)}
                                        >
                                            <div className="room-image">
                                                <img src={getImageUrl(profile.images)} alt={profile.name} />
                                                <div
                                                    className="bookmark"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSaved(profile.id, 'roommate');
                                                    }}
                                                >
                                                    <i className="fa-solid fa-heart glass-bookmark saved"></i>
                                                </div>
                                            </div>
                                            <div className="room-info">
                                                <h3>{profile.name}, {profile.age}</h3>
                                                <p className="location">
                                                    <i className="fas fa-map-marker-alt"></i> {profile.city}
                                                </p>
                                                <p className="location">
                                                    <i className="fas fa-briefcase"></i> {profile.occupation}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-results">
                                    <i className="fas fa-heart"></i>
                                    <h3>No saved roommates</h3>
                                    <p>Start saving roommate profiles you're interested in!</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/find-roommate')}
                                    >
                                        Browse Roommates
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default SavedItems;