import React, { createContext, useContext, useState } from 'react';
import NotificationModal from '../components/NotificationModal';

// Create a context for notifications
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};

// NotificationProvider to wrap the app and provide the context
export const NotificationProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false); // Visibility state
  const [message, setMessage] = useState(''); // Message content
  const [type, setType] = useState('success'); // Type: success or error

  // Function to show notifications
  const showNotification = (msg, notificationType = 'success', duration = 3000) => {
    setMessage(msg);
    setType(notificationType);
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false); // Hide after the given duration
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Render Notification Modal globally */}
      <NotificationModal message={message} type={type} isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </NotificationContext.Provider>
  );
};
