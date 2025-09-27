import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SecondaryNav.css';

const SecondaryNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const baseNavigationItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/recommendations', label: 'Recommendations', icon: '🎯' },
    { path: '/performance', label: 'Performance', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '📋' },
  ];

  const navigationItems = currentUser?.role === 'admin' 
    ? [...baseNavigationItems, { path: '/admin', label: 'Admin', icon: '⚙️' }]
    : baseNavigationItems;

  return (
    <nav className="secondary-nav">
      <div className="nav-content">
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
      </div>
    </nav>
  );
};

export default SecondaryNav;