// VerificationModal.jsx
import React, { useState } from 'react';
import '../../styles/editModal.css';
import { useNotification } from '../contexts/NotificationContext';

const VerificationModal = ({ isOpen, onClose, item, type, onVerify }) => {
    const [verificationStatus, setVerificationStatus] = useState(item?.verified ? 'verified' : 'pending');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showNotification } = useNotification();

    if (!isOpen || !item) return null;

    const handleVerify = async () => {
        setIsSubmitting(true);
        try {
            // const API_BASE = `http://10.142.158.68:5000`;
            // const API_BASE = `http://10.213.0.68:5000`;

            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
            
            // First test if admin routes are accessible
            const testResponse = await fetch(`${API_BASE}/api/admin/test`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            
            if (!testResponse.ok) {
                showNotification('Admin routes not accessible. Check backend connection.', 'error');
                setIsSubmitting(false);
                return;
            }

            const endpoint = type === 'room' 
                ? `${API_BASE}/api/admin/rooms/${item.id}/verify`
                : `${API_BASE}/api/admin/roommates/${item.id}/verify`;

            console.log('Sending verification request to:', endpoint);
            console.log('Request body:', {
                verified: verificationStatus === 'verified',
                notes: notes
            });

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    verified: verificationStatus === 'verified',
                    notes: notes
                })
            });

            const result = await response.json();
            console.log('Verification response:', result);

            if (response.ok) {
                showNotification(
                    `${type === 'room' ? 'Room' : 'Profile'} ${verificationStatus === 'verified' ? 'verified' : 'marked as pending'} successfully`,
                    'success'
                );
                onVerify(result.item);
                onClose();
            } else {
                showNotification(result.error || 'Verification failed', 'error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            showNotification('Failed to connect to server. Is the backend running?', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="simple-modal-overlay" onClick={onClose}>
            <div className="simple-modal-content" onClick={e => e.stopPropagation()}>
                <div className="simple-modal-header">
                    <h3>
                        <i className={`fas fa-${type === 'room' ? 'building' : 'user-friends'} mr-10`}></i>
                        Verify {type === 'room' ? 'Room' : 'Roommate Profile'}
                    </h3>
                    <button className="simple-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="simple-modal-form">
                    {/* Item Details Preview */}
                    <div className="verification-preview">
                        <h4>Item Details:</h4>
                        {type === 'room' ? (
                            <>
                                <div className="preview-row">
                                    <span className="label">Title:</span>
                                    <span className="value">{item.title}</span>
                                </div>
                                <div className="preview-row">
                                    <span className="label">Location:</span>
                                    <span className="value">{item.city}</span>
                                </div>
                                <div className="preview-row">
                                    <span className="label">Price:</span>
                                    <span className="value">₹{item.price}/month</span>
                                </div>
                                <div className="preview-row">
                                    <span className="label">Posted by:</span>
                                    <span className="value">User ID: {item.user_id}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="preview-row">
                                    <span className="label">Name:</span>
                                    <span className="value">{item.name}, {item.age} years</span>
                                </div>
                                <div className="preview-row">
                                    <span className="label">Occupation:</span>
                                    <span className="value">{item.occupation}</span>
                                </div>
                                <div className="preview-row">
                                    <span className="label">Location:</span>
                                    <span className="value">{item.city}</span>
                                </div>
                                <div className="preview-row">
                                    <span className="label">Budget:</span>
                                    <span className="value">₹{item.budget}/month</span>
                                </div>
                                <div className="preview-row">
                                    <span className="label">Posted by:</span>
                                    <span className="value">User ID: {item.user_id}</span>
                                </div>
                            </>
                        )}
                        <div className="preview-row">
                            <span className="label">Current Status:</span>
                            <span className={`status-badge ${item.verified ? 'status-hired' : 'status-pending'}`}>
                                {item.verified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>

                    {/* Verification Options */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-check-circle mr-5"></i>
                            Verification Status
                        </label>
                        <select 
                            value={verificationStatus} 
                            onChange={(e) => setVerificationStatus(e.target.value)}
                            className="verification-select"
                        >
                            <option value="verified">✓ Verified - Approved</option>
                            <option value="pending">✗ Mark as Pending</option>
                        </select>
                    </div>

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
                            type="button"
                            className={`btn ${verificationStatus === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={handleVerify}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-5"></i>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className={`fas fa-${verificationStatus === 'verified' ? 'check-circle' : 'clock'} mr-5`}></i>
                                    {verificationStatus === 'verified' ? 'Verify Item' : 'Mark as Pending'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Verification Guidelines */}
                <div className="simple-preview">
                    <h4>Verification Guidelines:</h4>
                    <ul className="guidelines-list">
                        <li><i className="fas fa-check-circle text-success"></i> Check if all details are accurate</li>
                        <li><i className="fas fa-check-circle text-success"></i> Verify contact information</li>
                        <li><i className="fas fa-check-circle text-success"></i> Ensure images are appropriate</li>
                        <li><i className="fas fa-check-circle text-success"></i> Confirm location details</li>
                        <li><i className="fas fa-exclamation-triangle text-warning"></i> Mark as pending if more info needed</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;