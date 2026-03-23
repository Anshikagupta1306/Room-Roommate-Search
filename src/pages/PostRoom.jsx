import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/postRoom.css";
import "../../styles/utility.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from '../contexts/NotificationContext';



// const MYIP = "10.142.158.68";
// const MYIP = "10.213.0.68";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PostRoom = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showCoordinates, setShowCoordinates] = useState(false);
    const { showNotification } = useNotification();


    const { user, logout } = useAuth();
    // console.log(user)

    // Form data state
    const [formData, setFormData] = useState({
        // Basic Info
        title: "",
        description: "",
        type: "Private Room",
        occupancy: "Single",
        price: "",
        preferredGender: "Any",

        // Availability
        availableFrom: '',

        // Location
        city: "",
        address: "",

        // Amenities
        amenities: [],

        // House Rules
        rules: [],

        // Images (will store File objects and preview URLs)
        images: [],

        // Owner Info
        owner: {
            name: "",
            phone: "",
            email: "",
            whatsapp: ""
        }
    });

    // New input states
    const [newAmenity, setNewAmenity] = useState("");
    const [newRule, setNewRule] = useState("");

    // Available amenities suggestions
    const suggestedAmenities = [
        "WiFi", "AC", "Geyser", "Kitchen", "Parking", "Gym",
        "Pool", "Security", "Power Backup", "Laundry", "Housekeeping",
        "Balcony", "Garden", "Lift", "Furnished", "Semi-Furnished"
    ];

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle nested owner object
        if (name.startsWith('owner.')) {
            const ownerField = name.split('.')[1];
            setFormData({
                ...formData,
                owner: {
                    ...formData.owner,
                    [ownerField]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types and size
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

            if (!isValidType) {
                setError(`${file.name} is not an image file`);
                return false;
            }
            if (!isValidSize) {
                setError(`${file.name} exceeds 5MB limit`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Create preview URLs for each file
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

        // Clear error if any
        setError("");
    };

    // Remove image
    const removeImage = (indexToRemove) => {
        // Revoke object URL to free memory
        if (formData.images[indexToRemove].preview) {
            URL.revokeObjectURL(formData.images[indexToRemove].preview);
        }

        setFormData({
            ...formData,
            images: formData.images.filter((_, index) => index !== indexToRemove)
        });
    };

    // Reorder images (drag and drop)
    // const moveImage = (dragIndex, dropIndex) => {
    //     const newImages = [...formData.images];
    //     const [draggedImage] = newImages.splice(dragIndex, 1);
    //     newImages.splice(dropIndex, 0, draggedImage);
    //     setFormData({ ...formData, images: newImages });
    // };

    // Handle amenity toggle
    const toggleAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    // Add custom amenity
    const addCustomAmenity = () => {
        if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
            setFormData({
                ...formData,
                amenities: [...formData.amenities, newAmenity.trim()]
            });
            setNewAmenity("");
        }
    };

    // Remove amenity
    const removeAmenity = (amenity) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.filter(a => a !== amenity)
        });
    };

    // Add rule
    const addRule = () => {
        if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
            setFormData({
                ...formData,
                rules: [...formData.rules, newRule.trim()]
            });
            setNewRule("");
        }
    };

    // Remove rule
    const removeRule = (rule) => {
        setFormData({
            ...formData,
            rules: formData.rules.filter(r => r !== rule)
        });
    };

    // Convert images to base64 for storage
    const imagesToBase64 = async (images) => {
        const base64Images = [];

        for (const image of images) {
            if (image.file) {
                // Convert File to base64
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(image.file);
                });
                base64Images.push(base64);
            } else if (image.preview) {
                // If it's already a base64 string or URL
                base64Images.push(image.preview);
            }
        }

        return base64Images;
    };

    // Validate form
    const validateForm = () => {
        if (!formData.title.trim()) return "Title is required";
        if (!formData.description.trim()) return "Description is required";
        if (!formData.price) return "Price is required";
        if (!formData.availableFrom) return "Available from date is required";
        if (!formData.city.trim()) return "City is required";
        if (!formData.address.trim()) return "Address is required";
        if (!formData.owner.name.trim()) return "Owner name is required";
        if (!formData.owner.phone.trim()) return "Owner phone is required";
        if (!formData.owner.email.trim()) return "Owner email is required";
        if (formData.images.length === 0) return "At least one image is required";
        return null;
    };

    // In PostRoom.jsx - Replace the handleSubmit function
    // In PostRoom.jsx - Updated handleSubmit with file upload

    // In PostRoom.jsx - Updated handleSubmit with file upload

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
            // Step 1: Upload images first if there are any
            let imageUrls = [];
            if (formData.images.length > 0) {
                const imageFormData = new FormData();

                // Append each image file to FormData
                formData.images.forEach((image, index) => {
                    if (image.file) {
                        imageFormData.append('images', image.file);
                    }
                });

                // Upload images
                const uploadResponse = await fetch(`${API_BASE}/api/upload/room-images`, {
                    method: 'POST',
                    body: imageFormData
                    // Don't set Content-Type header - browser will set it with boundary
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || 'Failed to upload images');
                }

                const uploadData = await uploadResponse.json();
                imageUrls = uploadData.urls;
                console.log("Uploaded image URLs:", imageUrls);

                // Update progress after upload
                setUploadProgress(30);
            }

            // Step 2: Prepare room data with image URLs
            const roomData = {
                user_id: user?.id,
                title: formData.title,
                description: formData.description || '',
                type: formData.type,
                occupancy: formData.occupancy,
                price: parseInt(formData.price),
                preferred_gender: formData.preferredGender,
                city: formData.city,
                address: formData.address,
                latitude: location.latitude ? parseFloat(location.latitude) : null,
                longitude: location.longitude ? parseFloat(location.longitude) : null,
                available_from: formData.availableFrom,
                status: "active",
                verified: false,
                images: imageUrls, // Now storing URLs instead of base64
                amenities: formData.amenities,
                rules: formData.rules,
                owner: formData.owner
            };

            console.log("Sending room data:", roomData);

            // Simulate progress
            setUploadProgress(60);

            // Step 3: Post room data
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/rooms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(roomData)
            });

            setUploadProgress(90);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Failed to post room");
            }

            setUploadProgress(100);
            showNotification("Room posted successfully!", 'success', 3000);

            // Clean up object URLs to prevent memory leaks
            formData.images.forEach(img => {
                if (img.preview) URL.revokeObjectURL(img.preview);
            });

            // Redirect after success
            setTimeout(() => {
                navigate("/find-room");
            }, 2000);

        } catch (err) {
            console.error("Error posting room:", err);
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
                    showNotification(`Unable to detect location: " ${error.message}`, 'error', 5000)
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

    // Simplified handleLocationChange for both files
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setLocation({
            ...location,
            [name]: value
        });
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="post-room-page">
                    <h1 className="page-title mt-0">Post a Room</h1>

                    {/* Alerts */}
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

                    {/* Upload Progress Bar */}
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
                        {/* Main Content Grid */}
                        <div className="post-room-container">
                            {/* LEFT COLUMN - Basic Info, Availability, Location */}
                            <div className="left-column">
                                {/* Basic Information Section */}
                                <div className="form-section">
                                    <h2>Basic Information</h2>
                                    <div className="section-content">
                                        <div className="form-group">
                                            <label>Title <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="e.g., ABC 1BHK in New Delhi"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Description <span className="required">*</span></label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="4"
                                                placeholder="Describe your room, building, neighborhood, etc."
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Room Type</label>
                                                <select name="type" value={formData.type} onChange={handleChange}>
                                                    <option value="Private Room">Private Room</option>
                                                    <option value="Shared Room">Shared Room</option>
                                                    <option value="Full Apartment">Full Apartment</option>
                                                    <option value="PG/Hostel">PG/Hostel</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Occupancy</label>
                                                <select name="occupancy" value={formData.occupancy} onChange={handleChange}>
                                                    <option value="Single">Single</option>
                                                    <option value="Double">Double</option>
                                                    <option value="Triple">Triple</option>
                                                    <option value="Dormitory">Dormitory</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Price (₹/month) <span className="required">*</span></label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 15000"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Preferred Gender</label>
                                                <select name="preferredGender" value={formData.preferredGender} onChange={handleChange}>
                                                    <option value="Any">Any</option>
                                                    <option value="Male">Male Only</option>
                                                    <option value="Female">Female Only</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Section */}
                                <div className="form-section">
                                    <h2>Availability</h2>
                                    <div className="section-content">
                                        <div className="form-group">
                                            <label>Available From <span className="required">*</span></label>
                                            <input
                                                type="date"
                                                name="availableFrom"
                                                value={formData.availableFrom}
                                                onChange={handleChange}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* House Rules Section */}
                                <div className="form-section">
                                    <h2>House Rules</h2>
                                    <div className="section-content">
                                        <div className="custom-input-group">
                                            <input
                                                type="text"
                                                value={newRule}
                                                onChange={(e) => setNewRule(e.target.value)}
                                                placeholder="e.g., No smoking, No pets, etc."
                                            />
                                            <button type="button" className="btn btn-primary radius-0" onClick={addRule}>
                                                Add Rule
                                            </button>
                                        </div>

                                        {formData.rules.length > 0 && (
                                            <div className="selected-items">
                                                <div className="tags-container">
                                                    {formData.rules.map(rule => (
                                                        <span key={rule} className="tag">
                                                            {rule}
                                                            <i
                                                                className="fas fa-times"
                                                                onClick={() => removeRule(rule)}
                                                            ></i>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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

                            {/* RIGHT COLUMN - Images, Amenities & House Rules */}
                            <div className="right-column">
                                {/* Images Section - Updated with File Upload */}
                                <div className="form-section">
                                    <h2>Room Images <span className="required">*</span></h2>
                                    <div className="section-content">
                                        <div className="image-upload-area">
                                            {/* File Upload Button */}
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
                                                    Choose Images
                                                </button>

                                                <span className="upload-hint">
                                                    Supports: JPG, PNG, GIF (Max 5MB each)
                                                </span>
                                            </div>

                                            {/* Image Preview Grid with Drag & Drop */}
                                            {formData.images.length > 0 && (
                                                <div className="image-preview-grid">
                                                    {formData.images.map((image, index) => (
                                                        <div className="flex flex-col w-100">
                                                            <div
                                                                key={index}
                                                                className="image-preview-item"
                                                            >
                                                                <img src={image.preview} alt={`Room ${index + 1}`} />
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
                                                                <span className="image-size0">
                                                                    {(image.size / 1024).toFixed(1)} KB
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Amenities Section */}
                                <div className="form-section">
                                    <h2>Amenities</h2>
                                    <div className="section-content">
                                        <div className="suggested-amenities">
                                            <p className="section-subtitle">Suggested Amenities:</p>
                                            <div className="amenities-suggestions">
                                                {suggestedAmenities.map(amenity => (
                                                    <button
                                                        key={amenity}
                                                        type="button"
                                                        className={`amenity-suggestion ${formData.amenities.includes(amenity) ? 'selected' : ''}`}
                                                        onClick={() => toggleAmenity(amenity)}
                                                    >
                                                        {amenity}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="custom-input-group">
                                            <input
                                                type="text"
                                                value={newAmenity}
                                                onChange={(e) => setNewAmenity(e.target.value)}
                                                placeholder="Add custom amenity"
                                            />
                                            <button type="button" className="btn btn-primary radius-0" onClick={addCustomAmenity}>
                                                Add
                                            </button>
                                        </div>

                                        {formData.amenities.length > 0 && (
                                            <div className="selected-items">
                                                <p className="section-subtitle">Selected Amenities:</p>
                                                <div className="tags-container">
                                                    {formData.amenities.map(amenity => (
                                                        <span key={amenity} className="tag">
                                                            {amenity}
                                                            <i
                                                                className="fas fa-times"
                                                                onClick={() => removeAmenity(amenity)}
                                                            ></i>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>


                                {/* Owner Information */}
                                <div className="form-section">
                                    <h2>Owner Information</h2>
                                    <div className="section-content">
                                        <div className="form-group">
                                            <label>Owner Name <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="owner.name"
                                                value={formData.owner.name}
                                                onChange={handleChange}
                                                placeholder="Enter owner name"
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Phone <span className="required">*</span></label>
                                                <input
                                                    type="tel"
                                                    name="owner.phone"
                                                    value={formData.owner.phone}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 9876543210"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>WhatsApp</label>
                                                <input
                                                    type="tel"
                                                    name="owner.whatsapp"
                                                    value={formData.owner.whatsapp}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 9876543210"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Email <span className="required">*</span></label>
                                            <input
                                                type="email"
                                                name="owner.email"
                                                value={formData.owner.email}
                                                onChange={handleChange}
                                                placeholder="owner@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* BOTTOM - Action Buttons */}
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
                                        Post Room
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

export default PostRoom;