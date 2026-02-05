import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <span className="brand-name">Front-OPS</span>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                            <span className="icon">📊</span> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/search" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                            <span className="icon">🔍</span> Search
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/upload" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                            <span className="icon">☁️</span> Upload
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                            <span className="icon">⚙️</span> Settings
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">U</div>
                    <div className="user-details">
                        <span className="user-name">User Account</span>
                        <span className="user-role">Admin</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
