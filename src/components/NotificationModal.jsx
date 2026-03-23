import React, { useEffect } from 'react';
import '../../styles/notificationModal.css';

const NotificationModal = ({ message, type, isVisible, onClose }) => {
  // Automatically hide notification after 3 seconds (this can be adjusted in context)
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Adjust duration if needed
      return () => clearTimeout(timer); // Clean up timeout
    }
  }, [isVisible, onClose]);

  // return (
  //   <div className={`notification-modal-container ${isVisible ? 'visible' : ''}`}>
  //     <div className={`flex justify-space items-center notification-modal ${type}`}>
  //       {type === "success" ? (
  //         <>
  //           <span><i className="fas fa-check-circle fa-lg mr-10"></i></span> {message}
  //         </>
  //       ) : (
  //         <>
  //           <i className="fas fa-times-circle fa-lg mr-10"></i> {message}
  //         </>
  //       )}

  //       <button className="notification-close" onClick={onClose}>{type == "success" ? (
  //         <>
  //           <i className="fa-solid fa-xmark fa-lg success"></i>
  //         </>
  //       )
  //         :
  //         (<>
  //           <i className="fa-solid fa-xmark fa-lg error"></i>
  //         </>
  //       )}</button>
  //     </div>
  //   </div>
  // );



  return (
    <div className={`notification-modal-container ${isVisible ? 'visible' : ''}`}>
      <div className={`flex justify-space items-center notification-modal ${type}`}>

        {type === "success" ? (
          <>
            <span>
              <i className="fas fa-check-circle fa-lg mr-10"></i>
            </span>
            {message}
          </>
        ) : (
          <>
            <i className="fas fa-times-circle fa-lg mr-10"></i>
            {message}
          </>
        )}

        <button className="notification-close" onClick={onClose}>
          <i className={`fa-solid fa-xmark fa-lg ${type}`}></i>
        </button>

      </div>
    </div>
  );
};

export default NotificationModal;
