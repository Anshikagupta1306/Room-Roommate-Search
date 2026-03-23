import React, { useEffect, useState } from "react";
import "../../styles/modal.css";

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "success", 
  autoClose = 2000 // default 3s
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setVisible(true); // slide in
      if (autoClose) {
        timer = setTimeout(() => {
          setVisible(false); // slide out
          setTimeout(onClose, 400); // wait for animation
        }, autoClose);
      }
    } else {
      setVisible(false); // slide out
    }
    return () => clearTimeout(timer);
  }, [isOpen, autoClose, onClose]);

  if (!isOpen && !visible) return null;

  return (
    <div className="modal-overlay">
      <div className={`flex items-center justify-between modal-box ${type} ${visible ? "show" : "hide"}`}>
        {/* <h2>{title}</h2> */}
        <h3>{message}</h3>
        <button
          className={`btn btn-secondary ${type}`}
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 400);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
