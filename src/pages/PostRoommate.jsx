import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/postRoom.css";      // Reuse the existing CSS
import "../../styles/utility.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from '../contexts/NotificationContext';



// 10.142.158.68
// const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PostRoommate = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showCoordinates, setShowCoordinates] = useState(false);
    const { showNotification } = useNotification();


    const { user, logout } = useAuth();

    // Form data state
    const [formData, setFormData] = useState({
        // Basic Info
        name: "",
        age: "",
        gender: "Male",
        occupation: "",
        city: "",
        budget: "",
        food: "Vegetarian",
        sleep: "Flexible",
        workType: "Office",

        // About
        about: "",

        // Interests & Preferences
        interests: [],
        preferences: [],

        // Contact
        phone: "",
        email: "",
        whatsapp: "",

        // Images
        images: []
    });

    // New input states
    const [newInterest, setNewInterest] = useState("");
    const [newPreference, setNewPreference] = useState("");

    // Suggested interests (using amenities-suggestions class)
    const suggestedInterests = [
        "Music", "Movies", "Reading", "Gaming", "Cooking",
        "Travel", "Sports", "Fitness", "Photography", "Art",
        "Yoga", "Dancing", "Writing", "Tech", "Nature"
    ];

    // Suggested preferences
    const suggestedPreferences = [
        "Non-smoker", "No pets", "Clean", "Organized", "Quiet",
        "Social", "Working Professional", "Student", "Weekend Parties",
        "Early Riser", "Night Owl", "Vegetarian Friendly"
    ];

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);

        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024;

            if (!isValidType) {
                showNotification(`${file.name} is not an image file`, 'error')
                // setError(`${file.name} is not an image file`);
                return false;
            }
            if (!isValidSize) {
                showNotification(`${file.name} exceeds 5MB limit`, 'error');
                // setError(`${file.name} exceeds 5MB limit`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size
        }));

        setFormData({
            ...formData,
            images: [...formData.images, ...newImages]
        });

        setError("");
    };

    // Remove image
    const removeImage = (indexToRemove) => {
        if (formData.images[indexToRemove].preview) {
            URL.revokeObjectURL(formData.images[indexToRemove].preview);
        }

        setFormData({
            ...formData,
            images: formData.images.filter((_, index) => index !== indexToRemove)
        });
    };

    // Handle interest toggle (using same pattern as amenities)
    const toggleInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    // Add custom interest
    const addCustomInterest = () => {
        if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
            setFormData({
                ...formData,
                interests: [...formData.interests, newInterest.trim()]
            });
            setNewInterest("");
        }
    };

    // Remove interest
    const removeInterest = (interest) => {
        setFormData({
            ...formData,
            interests: formData.interests.filter(i => i !== interest)
        });
    };

    // Handle preference toggle
    const togglePreference = (pref) => {
        setFormData(prev => ({
            ...prev,
            preferences: prev.preferences.includes(pref)
                ? prev.preferences.filter(p => p !== pref)
                : [...prev.preferences, pref]
        }));
    };

    // Add custom preference
    const addCustomPreference = () => {
        if (newPreference.trim() && !formData.preferences.includes(newPreference.trim())) {
            setFormData({
                ...formData,
                preferences: [...formData.preferences, newPreference.trim()]
            });
            setNewPreference("");
        }
    };

    // Remove preference
    const removePreference = (pref) => {
        setFormData({
            ...formData,
            preferences: formData.preferences.filter(p => p !== pref)
        });
    };

    // Convert images to base64
    const imagesToBase64 = async (images) => {
        const base64Images = [];

        for (const image of images) {
            if (image.file) {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(image.file);
                });
                base64Images.push(base64);
            } else if (image.preview) {
                base64Images.push(image.preview);
            }
        }

        return base64Images;
    };

    // Validate form
    const validateForm = () => {
        if (!formData.name.trim()) return "Name is required";
        if (!formData.age) return "Age is required";
        if (formData.age < 18 || formData.age > 100) return "Age must be between 18 and 100";
        if (!formData.occupation.trim()) return "Occupation is required";
        if (!formData.city.trim()) return "City is required";
        if (!formData.budget) return "Budget is required";
        if (!formData.about.trim()) return "About section is required";
        if (!formData.phone.trim()) return "Phone number is required";
        if (!formData.phone.match(/^[0-9]{10}$/)) return "Phone must be 10 digits";
        if (!formData.email.trim()) return "Email is required";
        if (!formData.email.match(/^\S+@\S+\.\S+$/)) return "Invalid email format";
        if (formData.images.length === 0) return "At least one image is required";
        return null;
    };

    // Handle form submission
   // PostRoommate.jsx - Fixed handleSubmit function

const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
        showNotification(validationError, 'error');
        return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
        // Step 1: Upload images first (if any)
        let imageUrls = [];
        if (formData.images.length > 0) {
            const imageFormData = new FormData();
            
            formData.images.forEach((image, index) => {
                if (image.file) {
                    imageFormData.append('images', image.file);
                }
            });

            const uploadResponse = await fetch(`${API_BASE}/api/upload/roommate-images`, {
                method: 'POST',
                body: imageFormData
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Failed to upload images');
            }

            const uploadData = await uploadResponse.json();
            imageUrls = uploadData.urls;
            console.log("Uploaded image URLs:", imageUrls);
            
            setUploadProgress(30);
        }

        // Step 2: Prepare roommate data with image URLs
        const roommateData = {
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            occupation: formData.occupation,
            city: formData.city,
            budget: parseInt(formData.budget),
            food: formData.food,
            sleep: formData.sleep,
            workType: formData.workType,
            about: formData.about,
            interests: formData.interests,
            preferences: formData.preferences,
            phone: formData.phone,
            email: formData.email,
            whatsapp: formData.whatsapp || formData.phone,
            images: imageUrls, // Use uploaded image URLs instead of base64
            user_id: user?.id,
            status: "active",
            verified: false,
            latitude: location.latitude ? parseFloat(location.latitude) : null,
            longitude: location.longitude ? parseFloat(location.longitude) : null
        };

        console.log("Sending roommate data:", roommateData);
        setUploadProgress(60);

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/roommates`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(roommateData)
        });

        setUploadProgress(90);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Failed to post profile");
        }

        setUploadProgress(100);
        showNotification("Profile posted successfully!", 'success', 3000);

        // Clean up object URLs
        formData.images.forEach(img => {
            if (img.preview) URL.revokeObjectURL(img.preview);
        });

        setTimeout(() => {
            navigate("/find-roommate");
        }, 2000);
        
    } catch (err) {
        console.error("Error posting profile:", err);
        showNotification(err.message, 'error', 5000);
    } finally {
        setLoading(false);
    }
};


    // Replace the location state (around line 320 in PostRoom.jsx, around line 290 in PostRoommate.jsx)
    const [location, setLocation] = useState({
        latitude: "",
        longitude: ""
    });
    const [isLocating, setIsLocating] = useState(false);
    // Simplified getCurrentLocation function for both files
    const getCurrentLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setIsLocating(false);
                    setSuccess("Location detected successfully!");
                    setTimeout(() => setSuccess(""), 3000);
                },
                (error) => {
                    showNotification(`Unable to detect location: " + ${error.message}`, 'error');
                    // setError("Unable to detect location: " + error.message);
                    setIsLocating(false);
                }
            );
        } else {
            showNotification("Geolocation is not supported by your browser", 'error');
            // setError("Geolocation is not supported by your browser");
            setIsLocating(false);
        }
    };

    // Function to fetch address from coordinates (using OpenStreetMap Nominatim - free)
    const fetchAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.display_name) {
                setLocation(prev => ({
                    ...prev,
                    address: data.display_name,
                    city: data.address?.city || data.address?.town || data.address?.village || ""
                }));
            }
        } catch (err) {
            console.error("Error fetching address:", err);
        }
    };

    // Simplified handleLocationChange for both files
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setLocation({
            ...location,
            [name]: value
        });
    };

    // Function to open in Google Maps (preview)
    const openInGoogleMaps = () => {
        if (location.latitude && location.longitude) {
            window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
        } else if (location.address) {
            const encodedAddress = encodeURIComponent(location.address);
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="post-room-page"> {/* Using same class as PostRoom */}
                    <h1 className="page-title mt-0">Create Roommate Profile</h1>

                    {/* Alerts - same structure as PostRoom */}
                    {error && (
                        <div className="alert alert-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <i className="fas fa-check-circle"></i>
                            {success}
                        </div>
                    )}

                    {/* Upload Progress Bar - same as PostRoom */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <span>{uploadProgress}% Uploaded</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="post-room-container"> {/* Using same class as PostRoom */}
                            {/* LEFT COLUMN */}
                            <div className="left-column">
                                {/* Basic Information Section */}
                                <div className="form-section">
                                    <h2>Basic Information</h2>
                                    <div className="section-content">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Full Name <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="e.g., User"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Age <span className="required">*</span></label>
                                                <input
                                                    type="number"
                                                    name="age"
                                                    value={formData.age}
                                                    onChange={handleChange}
                                                    placeholder="25"
                                                    min="18"
                                                    max="100"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Gender</label>
                                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Occupation <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="occupation"
                                                    value={formData.occupation}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Software Engineer"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>City <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="e.g., New Delhi"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Budget (₹/month) <span className="required">*</span></label>
                                                <input
                                                    type="number"
                                                    name="budget"
                                                    value={formData.budget}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 15000"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Food Preference</label>
                                                <select name="food" value={formData.food} onChange={handleChange}>
                                                    <option value="Vegetarian">Veg</option>
                                                    <option value="Non-Vegetarian">Non-Veg</option>
                                                    <option value="Eggetarian">Eggetarian</option>
                                                     <option value="Vegan">Vegan</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Sleep Schedule</label>
                                                <select name="sleep" value={formData.sleep} onChange={handleChange}>
                                                    <option value="Early Bird">Early Bird</option>
                                                    <option value="Night Owl">Night Owl</option>
                                                    <option value="Flexible">Flexible</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Work Type</label>
                                            <select name="workType" value={formData.workType} onChange={handleChange}>
                                                <option value="WFH">Work from Home</option>
                                                <option value="Office">Office</option>
                                                <option value="Hybrid">Hybrid</option>
                                                <option value="Student">Student</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="form-section">
                                    <h2>About You</h2>
                                    <div className="section-content">
                                        <div className="form-group">
                                            <label>Tell us about yourself <span className="required">*</span></label>
                                            <textarea
                                                name="about"
                                                value={formData.about}
                                                onChange={handleChange}
                                                rows="4"
                                                placeholder="Describe your personality, lifestyle, habits, what you're looking for in a roommate, etc."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="form-section">
                                    <h2>Contact Information</h2>
                                    <div className="section-content">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Phone <span className="required">*</span></label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 9876543210"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>WhatsApp</label>
                                                <input
                                                    type="tel"
                                                    name="whatsapp"
                                                    value={formData.whatsapp}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 9876543210"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Email <span className="required">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="owner@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Location Section */}
                                <div className="form-section">
                                    <h2>Location <span className="required">*</span></h2>
                                    <div className="section-content">
                                        <div className="form-group">
                                            <label>City <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="e.g., New Delhi"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Full Address <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Street, area, landmark, etc."
                                            />
                                        </div>

                                        {/* Toggle button for coordinates */}
                                        <div className="flex justify-center mt-10">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowCoordinates(!showCoordinates)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 20px'
                                                }}
                                            >
                                                <i className={`fas fa-chevron-${showCoordinates ? 'up' : 'down'}`}></i>
                                                {showCoordinates ? 'Hide Coordinates' : 'Add Coordinates (Optional)'}
                                            </button>
                                        </div>

                                        {/* Coordinates Section - Hidden by default */}
                                        {showCoordinates && (
                                            <div className="coordinates-section" style={{
                                                marginTop: '20px',
                                                padding: '20px',
                                                background: 'rgba(38, 103, 204, 0.03)',
                                                borderRadius: '15px',
                                                border: '1px dashed var(--primary-dark)',
                                                animation: 'fadeIn 0.3s ease'
                                            }}>
                                                <p className="section-subtitle" style={{ marginBottom: '15px' }}>
                                                    <i className="fas fa-map-pin"></i> Enter Coordinates
                                                </p>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Latitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            name="latitude"
                                                            value={location.latitude}
                                                            onChange={handleLocationChange}
                                                            placeholder="e.g., 12.9716"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Longitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            name="longitude"
                                                            value={location.longitude}
                                                            onChange={handleLocationChange}
                                                            placeholder="e.g., 77.5946"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-10">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={getCurrentLocation}
                                                        disabled={isLocating}
                                                        style={{ padding: '8px 15px' }}
                                                    >
                                                        <i className="fas fa-location-dot"></i>
                                                        {isLocating ? "Detecting..." : "Detect My Location"}
                                                    </button>

                                                    {location.latitude && location.longitude && (
                                                        <span className="tag" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                                                            <i className="fas fa-check-circle"></i> Coordinates Set
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="upload-hint mt-10" style={{ marginBottom: '0' }}>
                                                    <i className="fas fa-info-circle"></i>
                                                    Coordinates help show exact location on map
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="right-column">
                                {/* Images Section - using same structure as PostRoom */}
                                <div className="form-section">
                                    <h2>Your Photos <span className="required">*</span></h2>
                                    <div className="section-content">
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                accept="image/*"
                                                multiple
                                                style={{ display: 'none' }}
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-primary file-upload-btn"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <i className="fas fa-cloud-upload-alt"></i>
                                                Upload Photos
                                            </button>

                                            <span className="upload-hint">
                                                Supports: JPG, PNG (Max 5MB each)
                                            </span>
                                        </div>

                                        {formData.images.length > 0 && (
                                            <div className="image-preview-grid">
                                                {formData.images.map((image, index) => (
                                                    <div key={index} className="flex flex-col w-100">
                                                        <div className="image-preview-item">
                                                            <img src={image.preview} alt={`Profile ${index + 1}`} />
                                                            <span className="image-index">{index + 1}</span>
                                                            <button
                                                                type="button"
                                                                className="remove-image"
                                                                onClick={() => removeImage(index)}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                        <div className="image-info">
                                                            <span>{(image.size / 1024).toFixed(1)} KB</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Interests Section - using amenities-suggestions class */}
                                <div className="form-section">
                                    <h2>Interests & Hobbies</h2>
                                    <div className="section-content">
                                        <p className="section-subtitle">Suggested Interests:</p>
                                        <div className="amenities-suggestions"> {/* Using same class as PostRoom */}
                                            {suggestedInterests.map(interest => (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    className={`amenity-suggestion ${formData.interests.includes(interest) ? 'selected' : ''}`}
                                                    onClick={() => toggleInterest(interest)}
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
                                            <button type="button" className="btn btn-primary radius-0" onClick={addCustomInterest}>
                                                Add
                                            </button>
                                        </div>

                                        {formData.interests.length > 0 && (
                                            <div className="selected-items">
                                                <p className="section-subtitle">Selected Interests:</p>
                                                <div className="tags-container">
                                                    {formData.interests.map(interest => (
                                                        <span key={interest} className="tag">
                                                            {interest}
                                                            <i
                                                                className="fas fa-times"
                                                                onClick={() => removeInterest(interest)}
                                                            ></i>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preferences Section */}
                                <div className="form-section">
                                    <h2>Roommate Preferences</h2>
                                    <div className="section-content">
                                        <p className="section-subtitle">What are you looking for?</p>
                                        <div className="amenities-suggestions"> {/* Using same class as PostRoom */}
                                            {suggestedPreferences.map(pref => (
                                                <button
                                                    key={pref}
                                                    type="button"
                                                    className={`amenity-suggestion ${formData.preferences.includes(pref) ? 'selected' : ''}`}
                                                    onClick={() => togglePreference(pref)}
                                                >
                                                    {pref}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="custom-input-group">
                                            <input
                                                type="text"
                                                value={newPreference}
                                                onChange={(e) => setNewPreference(e.target.value)}
                                                placeholder="Add custom preference"
                                            />
                                            <button type="button" className="btn btn-primary radius-0" onClick={addCustomPreference}>
                                                Add
                                            </button>
                                        </div>

                                        {formData.preferences.length > 0 && (
                                            <div className="selected-items">
                                                <p className="section-subtitle">Your Preferences:</p>
                                                <div className="tags-container">
                                                    {formData.preferences.map(pref => (
                                                        <span key={pref} className="tag">
                                                            {pref}
                                                            <i
                                                                className="fas fa-times"
                                                                onClick={() => removePreference(pref)}
                                                            ></i>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Action Buttons - same as PostRoom */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary btn-block"
                                onClick={() => navigate(-1)}
                            >
                                <i className="fas fa-times"></i>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-plus-circle"></i>
                                        Create Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PostRoommate;