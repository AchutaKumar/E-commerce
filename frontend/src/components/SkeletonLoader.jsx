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
        <div className="skeleton-profile-wrap">
            <aside className="skeleton-box skeleton-profile-sidebar"></aside>
            <main className="skeleton-profile-main">
                <div className="skeleton-box skeleton-profile-title"></div>
                <div className="skeleton-profile-stats">
                    <div className="skeleton-box skeleton-profile-stat-box"></div>
                    <div className="skeleton-box skeleton-profile-stat-box"></div>
                    <div className="skeleton-box skeleton-profile-stat-box"></div>
                </div>
                <div className="skeleton-box skeleton-profile-content"></div>
            </main>
        </div>
    );
};

