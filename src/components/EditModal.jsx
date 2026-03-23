// EditModal.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/editModal.css';
import { useNotification } from '../contexts/NotificationContext';

const EditModal = ({ isOpen, onClose, listing, type, onUpdate }) => {
    const [formData, setFormData] = useState({
        price: '',
        budget: '',
        status: '',
        availableFrom: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (listing) {
            // Set the correct price field based on type
            const priceValue = type === 'room' ? listing.price || '' : listing.budget || '';

            // Format date properly for input field (YYYY-MM-DD)
            let availableFromValue = '';
            if (listing.available_from) {
                availableFromValue = listing.available_from.split('T')[0];
            } else if (listing.availableFrom) {
                availableFromValue = listing.availableFrom.split('T')[0];
            }

            setFormData({
                price: priceValue,
                budget: priceValue,
                status: listing.status || 'active',
                availableFrom: availableFromValue
            });
        }
    }, [listing, type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // const API_BASE = `http://10.142.158.68:5000`;
            // const API_BASE = `http://10.213.0.68:5000`;
            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
            // Prepare update data based on type
            const updateData = {};

            if (type === 'room') {
                // Room updates - status enum: active, rented, inactive
                updateData.status = formData.status;
                updateData.price = parseInt(formData.price) || 0;
                
                // Handle date properly
                if (formData.availableFrom) {
                    updateData.available_from = formData.availableFrom.split('T')[0];
                }
            } else {
                // Roommate updates - status enum: active, inactive, found
                // Map the display values to database values
                let statusValue = formData.status;
                
                // Convert 'rented' to appropriate roommate status if needed
                if (statusValue === 'rented') {
                    statusValue = 'inactive'; // Map rented to inactive for roommates
                } else if (statusValue === 'found') {
                    statusValue = 'found';
                } else if (statusValue === 'pending') {
                    statusValue = 'active'; // Map pending to active for roommates
                }
                
                updateData.status = statusValue;
                updateData.budget = parseInt(formData.budget) || 0;
                
                // Note: roommates table doesn't have available_from column
            }

            console.log('Sending update data:', updateData);

            const endpoint = type === 'room'
                ? `${API_BASE}/api/rooms/${listing.id}`
                : `${API_BASE}/api/roommates/${listing.id}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();

            if (response.ok) {
                showNotification(
                    `${type === 'room' ? 'Room' : 'Profile'} updated successfully`,
                    'success'
                );
                
                if (onUpdate) {
                    onUpdate(result.room || result.roommate || result.data);
                }
                
                onClose();
            } else {
                showNotification(result.error || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showNotification('Failed to update listing', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !listing) return null;

    return (
        <div className="simple-modal-overlay" onClick={onClose}>
            <div className="simple-modal-content" onClick={e => e.stopPropagation()}>
                <div className="simple-modal-header">
                    <h3>
                        <i className={`fas fa-${type === 'room' ? 'building' : 'user-friends'} mr-10`}></i>
                        Edit {type === 'room' ? 'Room' : 'Roommate'} Details
                    </h3>
                    <button className="simple-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="simple-modal-form">
                    {/* Price Field - Dynamic based on type */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-rupee-sign mr-5"></i>
                            {type === 'room' ? 'Monthly Rent (₹)' : 'Monthly Budget (₹)'}
                        </label>
                        <input
                            type="number"
                            name={type === 'room' ? 'price' : 'budget'}
                            value={type === 'room' ? formData.price : formData.budget}
                            onChange={handleChange}
                            placeholder={type === 'room' ? 'Enter monthly rent' : 'Enter monthly budget'}
                            min="0"
                            step="100"
                            required
                        />
                    </div>

                    {/* Availability Status - Different options for room vs roommate */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-toggle-on mr-5"></i>
                            Availability Status
                        </label>
                        {type === 'room' ? (
                            // Room status options - matching room schema: active, rented, inactive
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="active">✓ Available</option>
                                <option value="rented">✗ Rented</option>
                                <option value="inactive">⏸ Inactive</option>
                            </select>
                        ) : (
                            // Roommate status options - matching roommate schema: active, inactive, found
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="active">✓ Available</option>
                                <option value="inactive">✗ Not Available</option>
                                <option value="found">✓ Found Roommate</option>
                            </select>
                        )}
                    </div>

                    {/* Available From Date - Only for rooms */}
                    {type === 'room' && (
                        <div className="form-group">
                            <label>
                                <i className="fas fa-calendar-alt mr-5"></i>
                                Available From
                            </label>
                            <input
                                type="date"
                                name="availableFrom"
                                value={formData.availableFrom}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <small className="date-hint">Select the date when this becomes available</small>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="simple-modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-5"></i>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save mr-5"></i>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Preview Section */}
                <div className="simple-preview">
                    <h4>Preview Changes:</h4>
                    <div className="simple-preview-item">
                        <span className="preview-label">
                            {type === 'room' ? 'Monthly Rent:' : 'Monthly Budget:'}
                        </span>
                        <span className="preview-value">
                            ₹{type === 'room' ? formData.price || '0' : formData.budget || '0'}/month
                        </span>
                    </div>
                    <div className="simple-preview-item">
                        <span className="preview-label">Status:</span>
                        <span className={`status-badge ${
                            formData.status === 'active' ? 'status-applied' :
                            formData.status === 'rented' ? 'status-rejected' : 
                            formData.status === 'inactive' ? 'status-rejected' :
                            formData.status === 'found' ? 'status-hired' : 'status-shortlisted'
                        }`}>
                            {formData.status === 'active' ? 'Available' :
                             formData.status === 'rented' ? 'Rented' :
                             formData.status === 'inactive' ? 'Inactive' :
                             formData.status === 'found' ? 'Found Roommate' : 
                             'Unknown'}
                        </span>
                    </div>
                    {type === 'room' && (
                        <div className="simple-preview-item">
                            <span className="preview-label">Available From:</span>
                            <span className="preview-value">
                                {formData.availableFrom ? new Date(formData.availableFrom).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }) : 'Not set'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditModal;