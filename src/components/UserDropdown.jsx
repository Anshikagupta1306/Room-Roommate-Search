import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext, useAuth } from "../contexts/AuthContext";
import "../../styles/userDropdown.css";
import { useDarkMode } from '../contexts/DarkModeContext';

const UserDropdown = () => {
    const { user, logout } = useContext(AuthContext);
    const { isUpdated } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef(null);
    const hoverTimeout = useRef(null);

    const { isDarkMode, toggleDarkMode } = useDarkMode();


    // console.log(isUpdated);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    const handleMouseEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => {
            setIsOpen(true);
        }, 200); // delay before opening (ms)
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => {
            setIsOpen(false);
        }, 200); // delay before closing (ms)
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    if (!user) {
        return (
            <div className="auth-btn flex">
                <Link to="/login" className="btn btn-secondary login">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
        );
    }

    return (
        <div
            className="user-dropdown"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button className="user-menu-toggle flex justify-center items-center" onClick={toggleDropdown}>
                <div className="user-avatar">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                    ) : (
                        <span>{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                {/* <span className="user-name">{user.name}</span> */}
                {/* {!isUpdated && (
                    <span className="dot" title="Update profile"></span>
                )} */}
                {/* <i className={`dropdown-arrow ${isOpen ? "open" : ""}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </i> */}
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="users-info flex flex-col">
                        {/* <div className="user-role">{user.user_type}</div> */}
                        {/* <span className="user-name">{user.name}</span> */}

                        <div className="user-email"><span><i class="fa-solid fa-user  mr-5"></i></span> {user.name}</div>
                        <div className="user-email"><span><i class="fa-solid fa-reply-all fa-flip-both mr-5"></i></span> {user.email}</div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
                        <i class="fa-solid fa-user"></i>
                        <span>Profile</span>
                        {/* {!isUpdated && (
                            <span className="dot" title="Click to update profile"></span>
                        )} */}
                    </Link>

                    {user?.user_type === "seeker" && (
                        <>
                            <Link to="/find-room" className="dropdown-item" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-briefcase"></i>
                                <span>Find Room</span>
                            </Link>
                            <Link to="/find-roommate" className="dropdown-item" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-briefcase"></i>
                                <span>Find Roommate</span>
                            </Link>
                        </>
                    )}

                    {user?.user_type === "recruiter" && (
                        <>
                            <Link to="/post-room" className="dropdown-item" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-plus icon"></i>
                                <span>Post Room</span>
                            </Link>
                            <Link to="/post-roommate" className="dropdown-item" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-plus icon"></i>
                                <span>Post Roommate</span>
                            </Link>
                        </>
                    )}

                    {user?.user_type === "admin" && (
                        <>
                            {/* <Link to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-chart-pie"></i>
                                <span>Dashboard</span>
                            </Link> */}
                            <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-gear"></i>
                                <span>Manage Users</span>
                            </Link>
                        </>
                    )}

                    <div className="dropdown-divider"></div>

                    <Link>
                        <div className="dropdown-item" onClick={toggleDarkMode}>
                            {isDarkMode ? (
                                <>
                                    <i className="fa-solid fa-sun fa-xl"></i>
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-moon fa-xl"></i>
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </div>
                    </Link>

                    <button className="dropdown-item btn btn-secondary btn-block radius-50 mt-10" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
