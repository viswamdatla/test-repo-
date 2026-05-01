import React, { useContext } from 'react';
import { ThemeContext } from '../../theme/AppThemeProvider';
import './Navbar.scss';

export const Navbar = ({ title }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="menu-btn">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="nav-title">{title}</h2>
      </div>
      
      <div className="nav-right">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          <span className="status-text">System Online</span>
        </div>
        
        <button className="icon-btn" onClick={toggleTheme}>
          <span className="material-symbols-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        
        <button className="icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="profile-section">
          <div className="profile-info">
            <p className="profile-name">Admin User</p>
            <p className="profile-role">Principal Office</p>
          </div>
          <div className="profile-avatar">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};
