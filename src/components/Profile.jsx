// Profile.jsx
import { React, useEffect, useState } from 'react';
import '../../styles/profile.css';
import '../../styles/utility.css';
import { useAuth } from "../contexts/AuthContext";
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import EditModal from '../components/EditModal';
// import VerificationModal from '../components/VerificationModal';
import VerificationModal from './VerificationModal';

// const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";
// const API_BASE = `http://${MYIP}:5000`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Profile = () => {
    const [profileData, setProfileData] = useState({});
    const [userRooms, setUserRooms] = useState([]);
    const [userRoommates, setUserRoommates] = useState([]);
    const [savedRooms, setSavedRooms] = useState([]);
    const [savedRoommates, setSavedRoommates] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allRecruiters, setAllRecruiters] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [allRoommates, setAllRoommates] = useState([]);
    const [savedItems, setSavedItems] = useState({ rooms: [], roommates: [] });

    // Edit Modal states
    const [editingListing, setEditingListing] = useState(null);
    const [editingType, setEditingType] = useState(null);

    // Verification Modal states
    const [verifyingItem, setVerifyingItem] = useState(null);
    const [verifyingType, setVerifyingType] = useState(null);
    const [unverifiedCount, setUnverifiedCount] = useState({ rooms: 0, roommates: 0 });

    const [siteStats, setSiteStats] = useState({
        totalVisits: 0,
        todayVisits: 0,
        totalUsers: 0,
        totalRecruiters: 0,
        totalSeekers: 0,
        totalRooms: 0,
        totalRoommates: 0,
        activeUsers: 0,
        usersByRole: {}
    });

    // Collapsible sections state for admin
    const [collapsedSections, setCollapsedSections] = useState({
        users: true,
        recruiters: true,
        rooms: true,
        roommates: true
    });

    const { showNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    useEffect(() => {
        if (user) {
            console.log("🔄 Fetching profile for user:", user);
            fetchUserProfile();
            fetchUserListings();
            fetchSavedItems();

            if (user?.user_type === 'admin') {
                fetchAllUsers();
                fetchAllRecruiters();
                fetchAllRooms();
                fetchAllRoommates();
                fetchSiteStats();
                fetchUnverifiedCounts();
            }
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/profile?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Profile data:", data);
                setProfileData(data);
            } else {
                console.error("Failed to fetch profile");
                setError("Failed to load profile");
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Network error while fetching profile");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserListings = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch rooms posted by user
            const roomsResponse = await fetch(`${API_BASE}/api/rooms?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (roomsResponse.ok) {
                const roomsData = await roomsResponse.json();
                console.log("User rooms:", roomsData);
                setUserRooms(roomsData);
            }

            // Fetch roommate profiles posted by user
            const roommatesResponse = await fetch(`${API_BASE}/api/roommates?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (roommatesResponse.ok) {
                const roommatesData = await roommatesResponse.json();
                console.log("User roommates:", roommatesData);
                setUserRoommates(roommatesData);
            }
        } catch (error) {
            console.error("Error fetching user listings:", error);
        }
    };

    const fetchSavedItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/saved/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Saved items:", data);
                setSavedItems(data);

                // Fetch full details for saved rooms
                if (data.rooms && data.rooms.length > 0) {
                    const roomsResponse = await fetch(`${API_BASE}/api/rooms`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (roomsResponse.ok) {
                        const allRooms = await roomsResponse.json();
                        const savedRoomDetails = allRooms.filter(room => data.rooms.includes(room.id));
                        setSavedRooms(savedRoomDetails);
                    }
                }

                // Fetch full details for saved roommates
                if (data.roommates && data.roommates.length > 0) {
                    const roommatesResponse = await fetch(`${API_BASE}/api/roommates`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (roommatesResponse.ok) {
                        const allRoommates = await roommatesResponse.json();
                        const savedRoommateDetails = allRoommates.filter(rm => data.roommates.includes(rm.id));
                        setSavedRoommates(savedRoommateDetails);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching saved items:", error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/users?role=seeker`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("All users:", data);
                setAllUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchAllRecruiters = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/users?role=recruiter`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("All recruiters:", data);
                setAllRecruiters(data);
            }
        } catch (error) {
            console.error("Error fetching recruiters:", error);
        }
    };

    const fetchAllRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/rooms`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAllRooms(data);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const fetchAllRoommates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/roommates`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAllRoommates(data);
            }
        } catch (error) {
            console.error("Error fetching roommates:", error);
        }
    };

    const fetchSiteStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Site stats:", data);
                setSiteStats(data);
            }
        } catch (error) {
            console.error("Error fetching site stats:", error);
        }
    };

    const fetchUnverifiedCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/admin/unverified/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUnverifiedCount({
                    rooms: data.unverifiedRooms,
                    roommates: data.unverifiedRoommates
                });
            }
        } catch (error) {
            console.error("Error fetching unverified counts:", error);
        }
    };

    // Edit handlers
    const handleEditClick = (listing, type) => {
        setEditingListing(listing);
        setEditingType(type);
    };

    const handleUpdateSuccess = (updatedListing) => {
        if (editingType === 'room') {
            setUserRooms(prev => prev.map(room =>
                room.id === updatedListing.id ? updatedListing : room
            ));
            if (user?.user_type === 'admin') {
                setAllRooms(prev => prev.map(room =>
                    room.id === updatedListing.id ? updatedListing : room
                ));
            }
        } else {
            setUserRoommates(prev => prev.map(profile =>
                profile.id === updatedListing.id ? updatedListing : profile
            ));
            if (user?.user_type === 'admin') {
                setAllRoommates(prev => prev.map(profile =>
                    profile.id === updatedListing.id ? updatedListing : profile
                ));
            }
        }
        showNotification('Listing updated successfully', 'success');
    };

    // Verification handlers
    const handleVerifyClick = (item, type) => {
        setVerifyingItem(item);
        setVerifyingType(type);
    };

    const handleVerificationSuccess = (updatedItem) => {
        if (verifyingType === 'room') {
            setAllRooms(prev => prev.map(room =>
                room.id === updatedItem.id ? updatedItem : room
            ));
            // Also update in userRooms if it belongs to current user
            setUserRooms(prev => prev.map(room =>
                room.id === updatedItem.id ? updatedItem : room
            ));
        } else {
            setAllRoommates(prev => prev.map(profile =>
                profile.id === updatedItem.id ? updatedItem : profile
            ));
            setUserRoommates(prev => prev.map(profile =>
                profile.id === updatedItem.id ? updatedItem : profile
            ));
        }
        fetchUnverifiedCounts();
        showNotification('Verification status updated', 'success');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/profile/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user.id
                })
            });

            if (response.ok) {
                showNotification('Profile deleted successfully', 'success', 4000);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setTimeout(() => {
                    logout();
                    navigate('/');
                }, 1000);
            } else {
                const result = await response.json();
                showNotification(result.error || 'Failed to delete profile', 'error', 4000);
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            showNotification('Failed to delete profile', 'error', 4000);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: user.id })
            });

            if (response.ok) {
                showNotification('Room deleted successfully', 'success');
                fetchUserListings();
                if (user?.user_type === 'admin') {
                    fetchAllRooms();
                    fetchUnverifiedCounts();
                }
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to delete room', 'error');
            }
        } catch (error) {
            showNotification('Failed to delete room', 'error');
        }
    };

    const handleDeleteRoommate = async (roommateId) => {
        if (!window.confirm("Are you sure you want to delete this roommate profile?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/roommates/${roommateId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ user_id: user.id })
            });

            if (response.ok) {
                showNotification('Roommate profile deleted successfully', 'success');
                fetchUserListings();
                if (user?.user_type === 'admin') {
                    fetchAllRoommates();
                    fetchUnverifiedCounts();
                }
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to delete roommate profile', 'error');
            }
        } catch (error) {
            showNotification('Failed to delete roommate profile', 'error');
        }
    };

    const handleAdminDeleteUser = async (userId, userType) => {
        if (!window.confirm(`Are you sure you want to delete this ${userType}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotification(`${userType} deleted successfully`, 'success');
                fetchAllUsers();
                fetchAllRecruiters();
                fetchSiteStats();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            showNotification('Failed to delete user', 'error');
        }
    };

    const handleAdminDeleteRoom = async (roomId) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/admin/rooms/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotification('Room deleted successfully', 'success');
                fetchAllRooms();
                fetchSiteStats();
                fetchUnverifiedCounts();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to delete room', 'error');
            }
        } catch (error) {
            showNotification('Failed to delete room', 'error');
        }
    };

    const handleAdminDeleteRoommate = async (roommateId) => {
        if (!window.confirm("Are you sure you want to delete this roommate profile?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/admin/roommates/${roommateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotification('Roommate profile deleted successfully', 'success');
                fetchAllRoommates();
                fetchSiteStats();
                fetchUnverifiedCounts();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to delete roommate profile', 'error');
            }
        } catch (error) {
            showNotification('Failed to delete roommate profile', 'error');
        }
    };

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(" ")
            .map((n, i, arr) => {
                if (arr.length === 1) {
                    return n.slice(0, 2).toUpperCase();
                } else {
                    return (i === 0 || i === arr.length - 1) ? n[0] : "";
                }
            })
            .join("")
            .toUpperCase();
    };

    const getUserRole = () => {
        return user?.user_type || 'seeker';
    };

    if (isLoading) {
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

    const userRole = getUserRole();

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="main-section">
                    <div>
                        {/* Left Sidebar - User Info */}
                        <div className="sidebar mb-20">
                            <div className="profile">
                                {profileData?.profile?.avatar_url ? (
                                    <img src={profileData?.profile?.avatar_url} alt="Profile" />
                                ) : (
                                    <div className="profile-fallback flex justify-center items-center">
                                        {getInitials(profileData?.user?.name)}
                                    </div>
                                )}
                                <h2 style={{ textTransform: "capitalize" }} className="primary mb-0">{profileData?.user?.name || 'User'}</h2>
                                <p className="status-badge status-applied">{userRole}</p>

                                {/* Display additional profile info if available */}
                                {profileData?.profile?.occupation && (
                                    <p className="value mt-10">{profileData.profile.occupation}</p>
                                )}
                                {profileData?.profile?.age && (
                                    <p className="value">{profileData.profile.age} years</p>
                                )}
                            </div>

                            <div className="contact">
                                <div className="contact-item flex justify-between items-center gap-10">
                                    <h3 className="label">Email</h3>
                                    <a href={`mailto:${profileData?.user?.email}`} className="value">
                                        {profileData?.user?.email || <i className="fas fa-ellipsis-h"></i>}
                                    </a>
                                </div>

                                <div className="contact-item flex justify-between items-center gap-10">
                                    <h3 className="label">Phone</h3>
                                    <a href={`tel:${profileData?.profile?.phone}`} className="value">
                                        {profileData?.profile?.phone || <i className="fas fa-ellipsis-h"></i>}
                                    </a>
                                </div>

                                <div className="contact-item flex justify-between items-center gap-10">
                                    <h3 className="label">Location</h3>
                                    <p style={{ textTransform: "capitalize" }} className="value">{profileData?.profile?.location || <i className="fas fa-ellipsis-h"></i>}</p>
                                </div>

                                <div className="contact-item flex justify-between items-center gap-10">
                                    <h3 className="label">Member Since</h3>
                                    <p className="value">{formatDate(profileData?.user?.created_at)}</p>
                                </div>

                                {/* Display lifestyle info for better matching */}
                                {profileData?.profile?.food_preference && (
                                    <div className="contact-item flex justify-between items-center gap-10">
                                        <h3 className="label">Food</h3>
                                        <p className="value">{profileData.profile.food_preference}</p>
                                    </div>
                                )}

                                {profileData?.profile?.sleep_schedule && (
                                    <div className="contact-item flex justify-between items-center gap-10">
                                        <h3 className="label">Sleep</h3>
                                        <p className="value">{profileData.profile.sleep_schedule}</p>
                                    </div>
                                )}

                                <div className="contact-item flex justify-start items-center bb-none">
                                    <h3 className="label">Actions :</h3>
                                    <div className='action value flex justify-end items-center w-80'>
                                        <Link to="/update-profile" title="Click to update your profile">
                                            <i className="fa-solid fa-pen-to-square mr-20 gray"></i>
                                        </Link>
                                        <div title='Click to delete your profile' onClick={handleDeleteProfile}>
                                            <i className="fa-solid fa-trash"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Role Based Dashboard */}
                    <div className="profile-content">
                        <h2 className="heading line mt-0 primary">
                            {userRole === "admin" ? "Admin Dashboard" :
                                userRole === "recruiter" ? "Recruiter Dashboard" :
                                    "My Dashboard"}
                        </h2>

                        {/* Overview Stats - Role Based */}
                        <div className="stats-grid">
                            {userRole === 'admin' ? (
                                <>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{siteStats?.totalUsers || 0}</h3>
                                            <p>Total Users</p>
                                        </div>
                                        <i className="fas fa-users stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{siteStats?.usersByRole?.recruiter || 0}</h3>
                                            <p>Recruiters</p>
                                        </div>
                                        <i className="fas fa-user-tie stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{siteStats?.usersByRole?.seeker || 0}</h3>
                                            <p>Seekers</p>
                                        </div>
                                        <i className="fas fa-user stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{siteStats?.totalRooms || 0}</h3>
                                            <p>Total Rooms</p>
                                        </div>
                                        <i className="fas fa-building stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{siteStats?.totalRoommates || 0}</h3>
                                            <p>Total Roommates</p>
                                        </div>
                                        <i className="fas fa-user-friends stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{siteStats?.totalVisits || 0}</h3>
                                            <p>Total Visits</p>
                                        </div>
                                        <i className="fas fa-chart-line stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{siteStats?.todayVisits || 0}</h3>
                                            <p>Today's Visits</p>
                                        </div>
                                        <i className="fas fa-calendar-day stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{unverifiedCount.rooms + unverifiedCount.roommates}</h3>
                                            <p>Pending Verification</p>
                                        </div>
                                        <i className="fas fa-shield-alt stat-icon"></i>
                                    </div>
                                </>
                            ) : userRole === 'recruiter' ? (
                                <>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{userRooms?.length || 0}</h3>
                                            <p>Rooms Posted</p>
                                        </div>
                                        <i className="fas fa-building stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{userRoommates?.length || 0}</h3>
                                            <p>Roommate Profiles</p>
                                        </div>
                                        <i className="fas fa-user-friends stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{savedRooms?.length || 0}</h3>
                                            <p>Saved Rooms</p>
                                        </div>
                                        <i className="fas fa-bookmark stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{savedRoommates?.length || 0}</h3>
                                            <p>Saved Profiles</p>
                                        </div>
                                        <i className="fas fa-bookmark stat-icon"></i>
                                    </div>
                                </>
                            ) : (
                                // Seeker stats
                                <>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{savedRooms?.length || 0}</h3>
                                            <p>Saved Rooms</p>
                                        </div>
                                        <i className="fas fa-bookmark stat-icon"></i>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info left">
                                            <h3>{savedRoommates?.length || 0}</h3>
                                            <p>Saved Roommates</p>
                                        </div>
                                        <i className="fas fa-bookmark stat-icon"></i>
                                    </div>
                                    {profileData?.profile?.interests?.length > 0 && (
                                        <div className="stat-card">
                                            <div className="stat-info left">
                                                <h3>{profileData.profile.interests.length}</h3>
                                                <p>Interests</p>
                                            </div>
                                            <i className="fas fa-heart stat-icon"></i>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Admin Section - Collapsible Management */}
                        {userRole === 'admin' && (
                            <div className="admin-sections">
                                {/* Users Section */}
                                <div className="admin-section">
                                    <div
                                        className="section-header collapsible-header"
                                        onClick={() => toggleSection('users')}
                                    >
                                        <h2 className="heading">
                                            <i className="fas fa-users mr-10"></i>
                                            All Users ({allUsers.length})
                                        </h2>
                                        <button className="collapse-btn">
                                            <i className={`fas fa-chevron-${collapsedSections.users ? 'down' : 'up'}`}></i>
                                        </button>
                                    </div>

                                    {!collapsedSections.users && (
                                        <div className="admin-list">
                                            {allUsers.length > 0 ? (
                                                allUsers.map((u) => (
                                                    <div key={u.id} className="admin-item">
                                                        <div className="admin-item-info">
                                                            <div className="admin-item-header">
                                                                <h4 style={{ textTransform: "capitalize" }}>{u.name}</h4>
                                                                <span className="badge status-badge status-interview">Seeker</span>
                                                            </div>
                                                            <p className="value">{u.email}</p>
                                                            <p className="value small">Joined: {formatDate(u.created_at)}</p>
                                                        </div>
                                                        <div className="admin-item-actions">
                                                            <Link to={`/user/${u.id}`} className="btn-view" title="View Details">
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <span
                                                                className="btn-delete-small"
                                                                onClick={() => handleAdminDeleteUser(u.id, 'user')}
                                                                title="Delete User"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-items">No users found</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Recruiters Section */}
                                <div className="admin-section">
                                    <div
                                        className="section-header collapsible-header"
                                        onClick={() => toggleSection('recruiters')}
                                    >
                                        <h2 className="heading">
                                            <i className="fas fa-user-tie mr-10"></i>
                                            All Recruiters ({allRecruiters.length})
                                        </h2>
                                        <button className="collapse-btn">
                                            <i className={`fas fa-chevron-${collapsedSections.recruiters ? 'down' : 'up'}`}></i>
                                        </button>
                                    </div>

                                    {!collapsedSections.recruiters && (
                                        <div className="admin-list">
                                            {allRecruiters.length > 0 ? (
                                                allRecruiters.map((r) => (
                                                    <div key={r.id} className="admin-item">
                                                        <div className="admin-item-info">
                                                            <div className="admin-item-header">
                                                                <h4 style={{ textTransform: "capitalize" }}>{r.name}</h4>
                                                                <span className="badge status-badge status-reviewed">Recruiter</span>
                                                            </div>
                                                            <p className="value">{r.email}</p>
                                                            <p className="value small">Joined: {formatDate(r.created_at)}</p>
                                                        </div>
                                                        <div className="admin-item-actions">
                                                            <Link to={`/recruiter/${r.id}`} className="btn-view" title="View Details">
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <span
                                                                className="btn-delete-small"
                                                                onClick={() => handleAdminDeleteUser(r.id, 'recruiter')}
                                                                title="Delete Recruiter"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-items">No recruiters found</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Rooms Section */}
                                <div className="admin-section">
                                    <div
                                        className="section-header collapsible-header"
                                        onClick={() => toggleSection('rooms')}
                                    >
                                        <h2 className="heading">
                                            <i className="fas fa-building mr-10"></i>
                                            All Rooms ({allRooms.length})
                                            {unverifiedCount.rooms > 0 && (
                                                <span className="unverified-badge">{unverifiedCount.rooms} pending</span>
                                            )}
                                        </h2>
                                        <button className="collapse-btn">
                                            <i className={`fas fa-chevron-${collapsedSections.rooms ? 'down' : 'up'}`}></i>
                                        </button>
                                    </div>

                                    {!collapsedSections.rooms && (
                                        <div className="admin-list">
                                            {allRooms.length > 0 ? (
                                                allRooms.map((room) => (
                                                    <div key={room.id} className="admin-item">
                                                        <div className="admin-item-info">
                                                            <div className="admin-item-header">
                                                                <h4 style={{ textTransform: "capitalize" }}>{room.title}</h4>
                                                                <span className={`badge status-badge ${room.verified ? 'status-hired' : 'status-pending'}`}>
                                                                    {room.verified ? 'Verified' : 'Unverified'}
                                                                </span>
                                                            </div>
                                                            <p className="value">
                                                                <i className="fas fa-map-marker-alt mr-5"></i> {room.city} •
                                                                <i className="fas fa-rupee-sign ml-5 mr-5"></i> ₹{room.price}/month
                                                            </p>
                                                            <p className="value small">
                                                                Posted: {formatDate(room.posted_date || room.postedDate)} •
                                                                <i className="fas fa-eye ml-10 mr-5"></i> {room.views || 0} views
                                                            </p>
                                                        </div>
                                                        <div className="admin-item-actions">
                                                            <span
                                                                className="btn-verify"
                                                                onClick={() => handleVerifyClick(room, 'room')}
                                                                title={room.verified ? 'Change verification status' : 'Click to verify'}
                                                            >
                                                                <i className={`fas fa-${room.verified ? 'check-circle' : 'shield-alt'}`}
                                                                    style={{ color: room.verified ? '#10b981' : '#f59e0b' }}></i>
                                                            </span>
                                                            <span
                                                                className="btn-edit"
                                                                onClick={() => handleEditClick(room, 'room')}
                                                                title="Edit Room"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </span>
                                                            <Link to={`/room/${room.id}`} className="btn-view" title="View Room">
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <span
                                                                className="btn-delete-small"
                                                                onClick={() => handleAdminDeleteRoom(room.id)}
                                                                title="Delete Room"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-items">No rooms found</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Roommates Section */}
                                <div className="admin-section">
                                    <div
                                        className="section-header collapsible-header"
                                        onClick={() => toggleSection('roommates')}
                                    >
                                        <h2 className="heading">
                                            <i className="fas fa-user-friends mr-10"></i>
                                            All Roommate Profiles ({allRoommates.length})
                                            {unverifiedCount.roommates > 0 && (
                                                <span className="unverified-badge">{unverifiedCount.roommates} pending</span>
                                            )}
                                        </h2>
                                        <button className="collapse-btn">
                                            <i className={`fas fa-chevron-${collapsedSections.roommates ? 'down' : 'up'}`}></i>
                                        </button>
                                    </div>

                                    {!collapsedSections.roommates && (
                                        <div className="admin-list">
                                            {allRoommates.length > 0 ? (
                                                allRoommates.map((profile) => (
                                                    <div key={profile.id} className="admin-item">
                                                        <div className="admin-item-info">
                                                            <div className="admin-item-header">
                                                                <h4 style={{ textTransform: "capitalize" }}>{profile.name}, {profile.age}</h4>
                                                                <span className={`badge status-badge ${profile.verified ? 'status-hired' : 'status-pending'}`}>
                                                                    {profile.verified ? 'Verified' : 'Unverified'}
                                                                </span>
                                                            </div>
                                                            <p className="value">
                                                                <i className="fas fa-briefcase mr-5"></i> {profile.occupation} •
                                                                <i className="fas fa-map-marker-alt ml-5 mr-5"></i> {profile.city}
                                                            </p>
                                                            <p className="value small">
                                                                Posted: {formatDate(profile.posted_date || profile.postedDate)} •
                                                                <i className="fas fa-eye ml-10 mr-5"></i> {profile.views || 0} views
                                                            </p>
                                                        </div>
                                                        <div className="admin-item-actions">
                                                            <span
                                                                className="btn-verify"
                                                                onClick={() => handleVerifyClick(profile, 'roommate')}
                                                                title={profile.verified ? 'Change verification status' : 'Click to verify'}
                                                            >
                                                                <i className={`fas fa-${profile.verified ? 'check-circle' : 'shield-alt'}`}
                                                                    style={{ color: profile.verified ? '#10b981' : '#f59e0b' }}></i>
                                                            </span>
                                                            <span
                                                                className="btn-edit"
                                                                onClick={() => handleEditClick(profile, 'roommate')}
                                                                title="Edit Profile"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </span>
                                                            <Link to={`/roommate/${profile.id}`} className="btn-view" title="View Profile">
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <span
                                                                className="btn-delete-small"
                                                                onClick={() => handleAdminDeleteRoommate(profile.id)}
                                                                title="Delete Profile"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-items">No roommate profiles found</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recruiter Section - My Posted Rooms and Roommates */}
                        {userRole === 'recruiter' && (
                            <>
                                {/* My Posted Rooms */}
                                <div id="rooms" className="mt-20">
                                    <div className="section-header flex justify-between recruiter-header0">
                                        <h2 className="heading">
                                            <i className="fas fa-building mr-10"></i>
                                            My Posted Rooms ({userRooms.length})
                                        </h2>
                                        <Link to="/post-room">
                                            <button className="btn btn-primary">+ Post New Room</button>
                                        </Link>
                                    </div>
                                    <div className="jobs-grid">
                                        {userRooms.length > 0 ? (
                                            userRooms.map((room) => (
                                                <div key={room.id} className="job-card2">
                                                    <div className="job-card-header">
                                                        <div>
                                                            <div className="flex items-center gap-10">
                                                                <h3 style={{ textTransform: "capitalize" }} className='m-0'>{room.title}</h3>
                                                                {/* {room.verified && (
                                                                    <span className="verified-badge" title="Verified">
                                                                        <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                                                                    </span>
                                                                )} */}

                                                                {
                                                                    room.verified ? (
                                                                        <span className="verified-badge" title="Verified">
                                                                            <i className="fas fa-check-circle" style={{ color: "#10b981" }}></i>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="not-verified-badge" title="Not Verified">
                                                                            <i className="fas fa-times-circle" style={{ color: "#ef4444" }}></i>
                                                                        </span>
                                                                    )
                                                                }
                                                            </div>
                                                            <p className='company-names value'>
                                                                <i className="fas fa-map-marker-alt mr-5"></i> {room.city} •
                                                                <i className="fas fa-rupee-sign ml-5 mr-5"></i> ₹{room.price}/month
                                                            </p>
                                                            <p className="value small">
                                                                <i className="fas fa-eye mr-5"></i> {room.views || 0} views
                                                            </p>
                                                        </div>
                                                        <div className="job-card-actions">
                                                            <span
                                                                className="btn-edit"
                                                                onClick={() => handleEditClick(room, 'room')}
                                                                title="Edit Room Details"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </span>
                                                            <Link to={`/room/${room.id}`} className="btn-view" title="View Room">
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <span
                                                                className="btn-delete-small"
                                                                onClick={() => handleDeleteRoom(room.id)}
                                                                title="Delete Room"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-items">No rooms posted yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* My Posted Roommate Profiles */}
                                <div id="roommates" className="mt-20">
                                    <div className="section-header flex justify-between">
                                        <h2 className="heading">
                                            <i className="fas fa-user-friends mr-10"></i>
                                            My Posted Roommate ({userRoommates.length})
                                        </h2>
                                        <Link to="/post-roommate">
                                            <button className="btn btn-primary">+ Post Roommate</button>
                                        </Link>
                                    </div>
                                    <div className="jobs-grid">
                                        {userRoommates.length > 0 ? (
                                            userRoommates.map((profile) => (
                                                <div key={profile.id} className="job-card2">
                                                    <div className="job-card-header">
                                                        <div>
                                                            <div className="flex items-center gap-10">
                                                                <h3 style={{ textTransform: "capitalize" }} className='m-0'>{profile.name}, {profile.age}</h3>
                                                                {/* {profile.verified && (
                                                                    <span className="verified-badge" title="Verified">
                                                                        <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                                                                    </span>
                                                                )} */}
                                                                {
                                                                    profile.verified ? (
                                                                        <span className="verified-badge" title="Verified">
                                                                            <i className="fas fa-check-circle" style={{ color: "#10b981" }}></i>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="not-verified-badge" title="Not Verified">
                                                                            <i className="fas fa-times-circle" style={{ color: "#ef4444" }}></i>
                                                                        </span>
                                                                    )
                                                                }
                                                            </div>
                                                            <p className='company-names value'>
                                                                <i className="fas fa-briefcase mr-5"></i> {profile.occupation} •
                                                                <i className="fas fa-map-marker-alt ml-5 mr-5"></i> {profile.city}
                                                            </p>
                                                            <p className="value small">
                                                                <i className="fas fa-eye mr-5"></i> {profile.views || 0} views
                                                            </p>
                                                        </div>
                                                        <div className="job-card-actions">
                                                            <span
                                                                className="btn-edit"
                                                                onClick={() => handleEditClick(profile, 'roommate')}
                                                                title="Edit Profile Details"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </span>
                                                            <Link to={`/roommate/${profile.id}`} className="btn-view" title="View Profile">
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <span
                                                                className="btn-delete-small"
                                                                onClick={() => handleDeleteRoommate(profile.id)}
                                                                title="Delete Profile"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-items">No roommate profiles created yet</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Seeker Section - Saved Items */}
                        {userRole === 'seeker' && (
                            <>
                                <div className="action-buttons flex gap-20 mt-10 justify-center">
                                    <Link className='btn btn-primary btn-block' to="/saved-items">
                                        <button>View Saved Items ({savedRooms?.length + savedRoommates?.length})</button>
                                    </Link>
                                    <Link className='btn btn-primary btn-block' to="/find-room">
                                        <button>Browse Rooms</button>
                                    </Link>
                                    <Link className='btn btn-primary btn-block' to="/find-roommate">
                                        <button>Find Roommates</button>
                                    </Link>
                                </div>

                                {/* Show matching suggestions if profile is complete */}
                                {profileData?.profile?.interests?.length > 0 && (
                                    <div className="mt-20">
                                        <h3 className="heading">Suggested Matches</h3>
                                        <p className="value">Complete your profile to see personalized matches</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditModal
                isOpen={!!editingListing}
                onClose={() => {
                    setEditingListing(null);
                    setEditingType(null);
                }}
                listing={editingListing}
                type={editingType}
                onUpdate={handleUpdateSuccess}
            />

            {/* Verification Modal */}
            <VerificationModal
                isOpen={!!verifyingItem}
                onClose={() => {
                    setVerifyingItem(null);
                    setVerifyingType(null);
                }}
                item={verifyingItem}
                type={verifyingType}
                onVerify={handleVerificationSuccess}
            />
        </>
    );
};

export default Profile;