import React from 'react';
import Header from './Header';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 DJH Portfolio Manager. Built with React & Firebase.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;