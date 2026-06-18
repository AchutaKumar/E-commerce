import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import '../static/SavedItems.css';
import * as Icon from '../components/Icons.jsx';

const SavedItems = () => {
    const [savedProducts, setSavedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchSavedItems = async () => {
            const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
            if (watchlist.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${BASEURL}/api/products/`);
                if (res.ok) {
                    const allProducts = await res.json();
                    const filtered = allProducts.filter(p => watchlist.includes(p.id));
                    setSavedProducts(filtered);
                }
            } catch (error) {
                console.error("Failed to fetch saved items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedItems();
    }, [BASEURL]);

    return (
        <div className="saved-items-container">
            <div className="saved-items-header">
                <button className="back-btn" onClick={() => navigate('/profile')}>
                    ← Back to Profile
                </button>
                <h1>My Saved Items</h1>
            </div>
            
            {loading ? (
                <div className="saved-items-message">Loading your saved items...</div>
            ) : savedProducts.length > 0 ? (
                <div className="saved-items-grid">
                    {savedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="saved-items-empty">
                    <div className="empty-icon" style={{color: '#ef4444', display: 'flex', justifyContent: 'center', marginBottom: '16px'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </div>
                    <h2>No saved items yet</h2>
                    <p>When you save items you like, they will appear here.</p>
                    <button className="continue-shopping-btn" onClick={() => navigate('/')}>
                        Browse Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default SavedItems;
