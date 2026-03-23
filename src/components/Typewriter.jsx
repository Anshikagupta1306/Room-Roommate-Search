// Typewriter.js
import React, { useState, useEffect } from 'react';

const Typewriter = ({ texts, speed = 120, delay = 2000 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // console.log(texts)
    const currentText = texts[currentTextIndex];
    let timer;
    
    if (!isDeleting && displayedText.length < currentText.length) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev + currentText[displayedText.length]);
      }, speed);
    } else if (isDeleting && displayedText.length > 0) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, prev.length - 1));
      }, speed);
    }

    // Switch to next text when the current one is fully typed or deleted
    if (displayedText === currentText && !isDeleting) {
      setTimeout(() => setIsDeleting(true), delay);  // Start deleting after a pause
    } else if (displayedText === '' && isDeleting) {
      setIsDeleting(false);
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);  // Loop through texts
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentTextIndex, texts, speed, delay]);

  return <div className="typewriter-text">{displayedText}</div>;
};

export default Typewriter;
