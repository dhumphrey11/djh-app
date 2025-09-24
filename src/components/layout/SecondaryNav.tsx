import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SecondaryNav.css';

const SecondaryNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '📈' },
    { path: '/recommendations', label: 'Recommendations', icon: '🎯' },
    { path: '/admin', label: 'Admin', icon: '⚙️' },
  ];

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