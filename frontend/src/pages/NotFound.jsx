import React from 'react';
import { Link } from 'react-router-dom';
import '../static/NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Oops! Page not found.</h2>
        <p className="notfound-text">
          The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="notfound-home-btn">
          Go Back to Shopping
        </Link>
      </div>
    </div>
  );
}
