import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { currentUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <div className="logo-content">
            <span className="logo-icon">💰</span>
            <h1>MODA Portfolio Manager</h1>
          </div>
        </Link>

        <div className="user-info">
          {currentUser ? (
            <>
              <div className="user-details">
                <span className="user-email">{currentUser.email}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
              <button onClick={handleSignOut} className="sign-out-button">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="sign-in-button">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;