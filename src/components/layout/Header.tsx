import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/', label: 'Portfolio', icon: '💼' },
    { path: '/transactions', label: 'Transactions', icon: '📈' },
    { path: '/admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <div className="logo-content">
            <span className="logo-icon">💰</span>
            <h1>MODA Portfolio Manager</h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav desktop-nav">
          {navigationItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={isActive(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Mobile Navigation */}
        <nav className={`nav mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={isActive(item.path)}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            {/* Additional Menu Items */}
            <div className="menu-divider"></div>
            <div className="menu-section">
              <h3 className="menu-section-title">Quick Actions</h3>
              <button className="menu-action-btn">
                <span className="nav-icon">➕</span>
                Add Stock
              </button>
              <button className="menu-action-btn">
                <span className="nav-icon">💱</span>
                New Transaction
              </button>
            </div>
            
            <div className="menu-section">
              <h3 className="menu-section-title">Settings</h3>
              <button className="menu-action-btn">
                <span className="nav-icon">⚙️</span>
                Preferences
              </button>
              <button className="menu-action-btn">
                <span className="nav-icon">👤</span>
                Profile
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </header>
  );
};

export default Header;