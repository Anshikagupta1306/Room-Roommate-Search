import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import UserDropdown from "./UserDropdown";
import '../../styles/navbar.css';
import '../../styles/utility.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'unset';
    }, [location]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    // Cleanup effect
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* Logo / Brand */}
                <Link to="/" className="nav-logo m-0 text-gradient" onClick={closeMenu}>
                    <h1 className="m-0">RoomSathi</h1>
                </Link>



                <button onClick={toggleMenu} className="hamburger-btn">

                    {isMenuOpen ? (
                        <i className="fa-solid fa-xmark"></i>
                    ) : (
                        <i className="fa-solid fa-bars"></i>
                    )}

                </button>

                {/* Navigation Links - Desktop */}
                <ul className="nav-links desktop-nav">
                    <li><Link to="/" onClick={closeMenu}>Home</Link></li>

                    {!user && (
                        <>
                            <li><Link to="/find-room" onClick={closeMenu}>Find a Room</Link></li>
                            <li><Link to="/find-roommate" onClick={closeMenu}>Find Roommate</Link></li>
                            <li><Link to="/saved-items" onClick={closeMenu}>Saved Items</Link></li>
                        </>
                    )}

                    {user && user.user_type === "seeker" && (
                        <>
                            <li><Link to="/find-room" onClick={closeMenu}>Find a Room</Link></li>
                            <li><Link to="/find-roommate" onClick={closeMenu}>Find Roommate</Link></li>
                            <li><Link to="/saved-items" onClick={closeMenu}>Saved Items</Link></li>
                            <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
                        </>
                    )}

                    {user && user.user_type === "recruiter" && (
                        <>
                            <li><Link to="/post-room" onClick={closeMenu}>Post Room</Link></li>
                            <li><Link to="/post-roommate" onClick={closeMenu}>Post Roommate</Link></li>
                            <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
                        </>
                    )}

                    {user && user.user_type === "admin" && (
                        <>
                            <li><Link to="/post-room" onClick={closeMenu}>Post Room</Link></li>
                            <li><Link to="/post-roommate" onClick={closeMenu}>Post Roommate</Link></li>
                            <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
                        </>
                    )}

                    <li><Link to="/about" onClick={closeMenu}>About</Link></li>
                </ul>

                {/* Desktop action items */}
                <ul className="nav-links desktop-only gap-0">
                    <li>
                        <button
                            className="toggle-btn"
                            onClick={toggleDarkMode}
                            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? (
                                <i className="fa-solid fa-sun mr-10 white fa-xl"></i>
                            ) : (
                                <i className="fa-solid fa-moon mr-10 black fa-xl"></i>
                            )}
                        </button>
                    </li>
                    <li>
                        <UserDropdown />
                    </li>
                </ul>
            </div>

            {/* Mobile Menu - Slides from Top */}
            <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    {/* User Info */}
                    <div className="mobile-user-section">
                        {user ? (
                            <div className="mobile-user-info">
                                <div className="mobile-user-avatar">
                                    {getUserInitials()}
                                </div>
                                <div className="mobile-user-details">
                                    <span className="mobile-user-name">{user.name || 'User'}</span>
                                    <span className="mobile-user-role">{user.user_type || 'Member'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="mobile-user-info">
                                <div className="mobile-user-avatar"><span><i className="fa-solid fa-hand-peace fa-beat"></i></span></div>
                                <div className="mobile-user-details">
                                    <span className="mobile-user-name">Welcome!</span>
                                    <span className="mobile-user-role">Guest</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MAIN MENU */}
                    <div className="mobile-menu-section">
                        <h3 className="mobile-menu-title">MAIN MENU</h3>
                        <Link to="/" className="mobile-menu-item" onClick={closeMenu}>
                            <i className="fa-solid fa-home"></i>
                            <span>Home</span>
                        </Link>
                    </div>

                    {/* POSTINGS */}
                    <div className="mobile-menu-section">
                        <h3 className="mobile-menu-title">POSTINGS</h3>

                        {/* Post Room (always show if logged in as recruiter/admin) */}
                        {(user && (user.user_type === "recruiter" || user.user_type === "admin")) && (
                            <Link to="/post-room" className="mobile-menu-item" onClick={closeMenu}>
                                <i className="fa-solid fa-plus-circle"></i>
                                <span>Post Room</span>
                            </Link>
                        )}

                        {/* Post Roommate (always show if logged in as recruiter/admin) */}
                        {(user && (user.user_type === "recruiter" || user.user_type === "admin")) && (
                            <Link to="/post-roommate" className="mobile-menu-item" onClick={closeMenu}>
                                <i className="fa-solid fa-user-plus"></i>
                                <span>Post Roommate</span>
                            </Link>
                        )}

                        {/* Find Room (for seekers or non-logged in) */}
                        {(!user || user.user_type === "seeker") && (
                            <Link to="/find-room" className="mobile-menu-item" onClick={closeMenu}>
                                <i className="fa-solid fa-bed"></i>
                                <span>Find a Room</span>
                            </Link>
                        )}

                        {/* Find Roommate (for seekers or non-logged in) */}
                        {(!user || user.user_type === "seeker") && (
                            <Link to="/find-roommate" className="mobile-menu-item" onClick={closeMenu}>
                                <i className="fa-solid fa-user-group"></i>
                                <span>Find Roommate</span>
                            </Link>
                        )}

                        {/* Saved Items (for seekers or non-logged in) */}
                        {(!user || user.user_type === "seeker") && (
                            <Link to="/saved-items" className="mobile-menu-item" onClick={closeMenu}>
                                <i className="fa-regular fa-bookmark"></i>
                                <span>Saved Items</span>
                            </Link>
                        )}
                    </div>

                    {/* ACCOUNT */}
                    <div className="mobile-menu-section">
                        <h3 className="mobile-menu-title">ACCOUNT</h3>
                        {user ? (
                            <Link to="/profile" className="mobile-menu-item" onClick={closeMenu}>
                                <i className="fa-regular fa-user"></i>
                                <span>Profile</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="mobile-menu-item" onClick={closeMenu}>
                                <i className="fa-solid fa-sign-in-alt"></i>
                                <span>Login</span>
                            </Link>
                        )}
                        <Link to="/about" className="mobile-menu-item" onClick={closeMenu}>
                            <i className="fa-regular fa-circle-question"></i>
                            <span>About</span>
                        </Link>
                    </div>

                    {/* PREFERENCES */}
                    <div className="mobile-menu-section">
                        <h3 className="mobile-menu-title">PREFERENCES</h3>
                        <button
                            className="mobile-menu-item theme-toggle-btn"
                            onClick={() => {
                                toggleDarkMode();
                            }}
                        >
                            {isDarkMode ? (
                                <>
                                    <i className="fa-solid fa-sun"></i>
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-moon"></i>
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Logout for logged in users */}
                    {user && (
                        <div className="footer-btns">
                            <button onClick={() => { logout(); closeMenu(); }} className="btn btn-block btn-secondary">
                                <i className="fa-solid fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
        </nav>
    );
};

export default Navbar;