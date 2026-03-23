// UpdateProfile.jsx - Fixed version
import { useState, useEffect } from "react";
import "../../styles/update-profile.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from '../contexts/NotificationContext';

const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";
// const API_BASE = `http://${MYIP}:5000`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function UpdateProfile() {
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Basic Info (required for all)
        first_name: "",
        last_name: "",
        phone: "",
        location: "",

        // For Roommate Matching (essential)
        gender: "",
        age: "",
        occupation: "",
        bio: "",

        // Lifestyle (for compatibility)
        food_preference: "Vegetarian",
        sleep_schedule: "Flexible",
        work_type: "Office",
        smoking: "No",
        drinking: "No",

        // Room Preferences (for seekers)
        preferred_gender: "Any",
        max_budget: "",
        preferred_cities: [],
        move_in_date: "",

        // Interests (simple array)
        interests: []
    });

    // New input states
    const [newCity, setNewCity] = useState("");
    const [newInterest, setNewInterest] = useState("");

    // Suggested options
    const suggestedInterests = [
        "Music", "Movies", "Reading", "Gaming", "Cooking", "Travel",
        "Sports", "Fitness", "Photography", "Art", "Yoga"
    ];

    useEffect(() => {
        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/profile?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Split name
                const fullName = data.user?.name || '';
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                setFormData({
                    first_name: firstName,
                    last_name: lastName,
                    phone: data.profile?.phone || "",
                    location: data.profile?.location || "",
                    gender: data.profile?.gender || "",
                    age: data.profile?.age || "",
                    occupation: data.profile?.occupation || "",
                    bio: data.profile?.bio || "",
                    food_preference: data.profile?.food_preference || "Vegetarian",
                    sleep_schedule: data.profile?.sleep_schedule || "Flexible",
                    work_type: data.profile?.work_type || "Office",
                    smoking: data.profile?.smoking || "No",
                    drinking: data.profile?.drinking || "No",
                    preferred_gender: data.profile?.preferred_gender || "Any",
                    max_budget: data.profile?.max_budget || "",
                    preferred_cities: data.profile?.preferred_cities || [],
                    move_in_date: data.profile?.move_in_date || "",
                    interests: data.profile?.interests || []
                });
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayToggle = (field, item) => {
        setFormData(prev => {
            const currentArray = prev[field] || [];
            const newArray = currentArray.includes(item)
                ? currentArray.filter(i => i !== item)
                : [...currentArray, item];
            return { ...prev, [field]: newArray };
        });
    };

    const handleAddCustomItem = (field, value, setter) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...(prev[field] || []), value.trim()]
            }));
            setter("");
        }
    };

    const handleRemoveItem = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(i => i !== item)
        }));
    };

    // UpdateProfile.jsx - Fix the handleSubmit function

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            showNotification("Please log in again", 'error', 4000);
            return;
        }

        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.location) {
            showNotification("Please fill all required fields", 'error', 4000);
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Prepare data in the format expected by the backend
            const profileData = {
                user_id: user.id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                location: formData.location,
                gender: formData.gender,
                age: formData.age ? parseInt(formData.age) : null,
                occupation: formData.occupation,
                bio: formData.bio,
                food_preference: formData.food_preference,
                sleep_schedule: formData.sleep_schedule,
                work_type: formData.work_type,
                smoking: formData.smoking,
                drinking: formData.drinking,
                preferred_gender: formData.preferred_gender,
                max_budget: formData.max_budget ? parseInt(formData.max_budget) : null,
                move_in_date: formData.move_in_date,
                preferred_cities: formData.preferred_cities,
                interests: formData.interests
            };

            console.log("Sending profile data:", profileData);

            const profileResponse = await fetch(`${API_BASE}/api/profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData),
            });

            const responseData = await profileResponse.json();
            console.log("Profile update response:", responseData);

            if (profileResponse.ok) {
                showNotification('Profile updated successfully!', 'success', 4000);
                setTimeout(() => navigate('/profile'), 2000);
            } else {
                showNotification(responseData.error || 'Failed to update profile', 'error', 4000);
            }
        } catch (err) {
            console.error("Update error:", err);
            showNotification("Failed to update profile", 'error', 4000);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="container">
                    <p>Please log in to update your profile</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="update-profile-view">
                        <div className="form-header">
                            <h1 className="page-title mt-0">Complete Your Profile</h1>
                            <p className="form-subtitle">Help us find the perfect roommate match for you</p>
                        </div>

                        {/* Basic Information */}
                        <div className="form-section">
                            <h3>Basic Information</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location *</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g., Mumbai"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        min="18"
                                        max="100"
                                        placeholder="18"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Occupation</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    placeholder="e.g., Software Engineer, Student"
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio / About Me</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself and what you're looking for in a roommate..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        {/* Lifestyle & Preferences */}
                        <div className="form-sections">
                            <h3>Lifestyle & Preferences</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Food Preference</label>
                                    <select name="food_preference" value={formData.food_preference} onChange={handleChange}>
                                        <option value="Vegetarian">Vegetarian</option>
                                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                                        <option value="Eggetarian">Eggetarian</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Sleep Schedule</label>
                                    <select name="sleep_schedule" value={formData.sleep_schedule} onChange={handleChange}>
                                        <option value="Early Bird">Early Bird</option>
                                        <option value="Night Owl">Night Owl</option>
                                        <option value="Flexible">Flexible</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Work Type</label>
                                    <select name="work_type" value={formData.work_type} onChange={handleChange}>
                                        <option value="Office">Office</option>
                                        <option value="WFH">Work from Home</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Student">Student</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Smoking</label>
                                    <select name="smoking" value={formData.smoking} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Occasional">Occasional</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Drinking</label>
                                    <select name="drinking" value={formData.drinking} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Social">Social</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Preferred Roommate Gender</label>
                                    <select name="preferred_gender" value={formData.preferred_gender} onChange={handleChange}>
                                        <option value="Any">Any</option>
                                        <option value="Male">Male only</option>
                                        <option value="Female">Female only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Maximum Budget (₹/month)</label>
                                    <input
                                        type="number"
                                        name="max_budget"
                                        value={formData.max_budget}
                                        onChange={handleChange}
                                        placeholder="e.g., 15000"
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Move-in Date</label>
                                    <input
                                        type="date"
                                        name="move_in_date"
                                        value={formData.move_in_date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Preferred Cities</label>
                                <div className="custom-input-group">
                                    <input
                                        type="text"
                                        value={newCity}
                                        onChange={(e) => setNewCity(e.target.value)}
                                        placeholder="e.g., Mumbai, Delhi"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary radius-0"
                                        onClick={() => handleAddCustomItem('preferred_cities', newCity, setNewCity)}
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.preferred_cities?.length > 0 && (
                                    <div className="tags-container">
                                        {formData.preferred_cities.map(city => (
                                            <span key={city} className="tag">
                                                {city}
                                                <i className="fas fa-times" onClick={() => handleRemoveItem('preferred_cities', city)}></i>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interests */}
                        <div className="form-sections">
                            <h3>Interests & Hobbies</h3>

                            <div className="amenities-suggestions">
                                {suggestedInterests.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        className={`amenity-suggestion ${formData.interests?.includes(interest) ? 'selected' : ''}`}
                                        onClick={() => handleArrayToggle('interests', interest)}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>

                            <div className="custom-input-group">
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    placeholder="Add custom interest"
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary radius-0"
                                    onClick={() => handleAddCustomItem('interests', newInterest, setNewInterest)}
                                >
                                    Add
                                </button>
                            </div>

                            {formData.interests?.length > 0 && (
                                <div className="tags-container">
                                    {formData.interests.map(interest => (
                                        <span key={interest} className="tag">
                                            {interest}
                                            <i className="fas fa-times" onClick={() => handleRemoveItem('interests', interest)}></i>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary btn-block" onClick={() => navigate('/profile')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-10"></i>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save mr-10"></i>
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default UpdateProfile;