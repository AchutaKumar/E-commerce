import React from 'react';
import '../static/SkeletonLoader.css';

export const ProductCardSkeleton = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-box skeleton-image"></div>
            <div className="skeleton-box skeleton-text"></div>
            <div className="skeleton-box skeleton-text short"></div>
            <div className="skeleton-box skeleton-text medium"></div>
            <div className="skeleton-box skeleton-button"></div>
        </div>
    );
};

export const ProductListSkeleton = ({ count = 8 }) => {
    return (
        <div className="skeleton-products-grid">
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
};

export const ProductDetailSkeleton = () => {
    return (
        <div className="skeleton-detail-container">
            <div className="skeleton-box skeleton-detail-image-wrapper"></div>
            <div className="skeleton-detail-info">
                <div className="skeleton-box skeleton-detail-title"></div>
                <div className="skeleton-box skeleton-detail-category"></div>
                
                <div className="skeleton-box skeleton-detail-price"></div>
                
                <div className="skeleton-box skeleton-detail-desc"></div>
                
                <div className="skeleton-box skeleton-detail-specs"></div>
                
                <div className="skeleton-detail-actions">
                    <div className="skeleton-box skeleton-detail-btn"></div>
                    <div className="skeleton-box skeleton-detail-btn"></div>
                </div>
            </div>
        </div>
    );
};

export const ProfileSkeleton = () => {
    return (
        <div className="profile-dashboard-wrap">
            <aside className="profile-sidebar" style={{ border: 'none', padding: 0 }}>
                <div className="skeleton-box" style={{ width: '100%', height: '100vh', borderRadius: 0 }}></div>
            </aside>
            
            <main className="profile-main-content">
                <header className="profile-top-bar">
                    <div className="skeleton-box" style={{ height: '40px', width: '250px', borderRadius: '8px' }}></div>
                </header>

                <div className="profile-stats-grid">
                    <div className="skeleton-box" style={{ height: '100px', borderRadius: '16px' }}></div>
                    <div className="skeleton-box" style={{ height: '100px', borderRadius: '16px' }}></div>
                    <div className="skeleton-box" style={{ height: '100px', borderRadius: '16px' }}></div>
                </div>

                <div className="profile-content-grid">
                    <div className="skeleton-box" style={{ height: '350px', borderRadius: '16px' }}></div>
                    <div className="skeleton-box" style={{ height: '350px', borderRadius: '16px' }}></div>
                </div>
            </main>
        </div>
    );
};

