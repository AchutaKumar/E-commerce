import { Link, useNavigate } from "react-router-dom";
import { clearToken, getAccessToken } from '../utils/auth.js';
import { useCart } from '../context/CardContext.jsx';
import '../static/Profile.css';
import { useState, useEffect } from "react";
import React from "react";
import * as Icon from '../components/Icons.jsx';

const Profile = () => {
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '', phone_number: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [watchlistCount, setWatchlistCount] = useState(0);
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const handleLogout = () => {
        clearToken();
        clearCart();
        navigate('/login');
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${BASEURL}/api/profile/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                });
                const data = await res.json();
                setProfileData(data);
                setEditForm({ username: data.username, email: data.email, phone_number: data.phone_number || '' });
                if (data && data.is_staff !== undefined) {
                    localStorage.setItem('is_staff', data.is_staff ? 'true' : 'false');
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
        
        // Load watchlist count from localStorage
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setWatchlistCount(watchlist.length);
    }, [BASEURL]);

    const initials = profileData?.username?.slice(0, 2).toUpperCase() ?? "?";

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSaveProfile = async () => {
        setErrorMsg('');
        
        if (!editForm.username.trim()) {
            setErrorMsg('Username cannot be empty.');
            return;
        }
        
        if (!validateEmail(editForm.email)) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        try {
            const res = await fetch(`${BASEURL}/api/profile/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAccessToken()}`,
                },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (res.ok) {
                setProfileData(data);
                setIsEditing(false);
            } else {
                setErrorMsg(data.error || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMsg("A network error occurred. Please try again.");
        }
    };

    if (!profileData) {
        return (
            <div className="profile-loading-wrap">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-dashboard-wrap">
            <aside className="profile-sidebar">
                <div className="profile-sidebar-header">
                    <div className="profile-avatar-large">{initials}</div>
                    <h2 className="profile-name">{profileData.username}</h2>
                    <p className="profile-email">{profileData.email}</p>
                    <span className="tier-badge">Silver Member</span>
                </div>

                <nav className="profile-nav">
                    <button className="nav-btn active">
                        <span className="nav-icon"><Icon.UserIcon /></span> Overview
                    </button>
                    <button className="nav-btn" onClick={() => alert("Orders coming soon!")}>
                        <span className="nav-icon"><Icon.PackageIcon /></span> My Orders
                    </button>
                    <button className="nav-btn" onClick={() => navigate('/saved-items')}>
                        <span className="nav-icon"><Icon.HeartIcon /></span> Watchlist ({watchlistCount})
                    </button>
                    <button className="nav-btn" onClick={() => alert("Settings coming soon!")}>
                        <span className="nav-icon"><Icon.SettingsIcon /></span> Settings
                    </button>
                    <div className="nav-divider"></div>
                    <button className="nav-btn logout" onClick={handleLogout}>
                        <span className="nav-icon"><Icon.LogOutIcon /></span> Sign Out
                    </button>
                </nav>
            </aside>

            <main className="profile-main-content">
                <header className="profile-top-bar">
                    <h1>My Account</h1>
                    <button onClick={() => navigate('/')} className="back-to-shop-btn">
                        ← Back to Shopping
                    </button>
                </header>

                <div className="profile-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><Icon.ShoppingBagIcon /></div>
                        <div className="stat-info">
                            <h3>Total Orders</h3>
                            <p>0</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Icon.StarIcon /></div>
                        <div className="stat-info">
                            <h3>Reward Points</h3>
                            <p>150</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Icon.HeartIcon /></div>
                        <div className="stat-info">
                            <h3>Saved Items</h3>
                            <p>{watchlistCount}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-content-grid">
                    <section className="profile-section">
                        <div className="section-header">
                            <h2>Personal Information</h2>
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="edit-btn" style={{color: '#9ca3af'}} onClick={() => { setIsEditing(false); setErrorMsg(''); setEditForm({username: profileData.username, email: profileData.email, phone_number: profileData.phone_number || ''}); }}>Cancel</button>
                                    <button className="edit-btn" onClick={handleSaveProfile}>Save</button>
                                </div>
                            ) : (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                            )}
                        </div>
                        
                        {errorMsg && (
                            <div className="profile-error-msg">
                                <Icon.AlertIcon /> <span style={{marginLeft: '8px'}}>{errorMsg}</span>
                            </div>
                        )}

                        <div className="info-grid">
                            <div className="info-item">
                                <label>Username</label>
                                {isEditing ? (
                                    <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="profile-edit-input" />
                                ) : (
                                    <span>{profileData.username}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Email Address</label>
                                {isEditing ? (
                                    <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="profile-edit-input" />
                                ) : (
                                    <span>{profileData.email}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Phone Number</label>
                                {isEditing ? (
                                    <input type="tel" value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} className="profile-edit-input" />
                                ) : (
                                    <span className={profileData.phone_number ? "" : "empty-state"}>{profileData.phone_number || "Not provided"}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Shipping Address</label>
                                <span className="empty-state">Not set</span>
                            </div>
                        </div>
                    </section>

                    <section className="profile-section">
                        <h2>Quick Actions</h2>
                        <div className="quick-action-grid-modern">
                            <button className="modern-action-card" onClick={() => alert("Track Order coming soon!")}>
                                <div className="card-icon blue"><Icon.TruckIcon /></div>
                                <span>Track Order</span>
                            </button>
                            <button className="modern-action-card" onClick={() => alert("Payment Methods coming soon!")}>
                                <div className="card-icon green"><Icon.CreditCardIcon /></div>
                                <span>Payments</span>
                            </button>
                            <button className="modern-action-card" onClick={() => alert("Returns coming soon!")}>
                                <div className="card-icon orange"><Icon.RefreshIcon /></div>
                                <span>Returns</span>
                            </button>
                            <button className="modern-action-card" onClick={() => alert("Support coming soon!")}>
                                <div className="card-icon purple"><Icon.MessageIcon /></div>
                                <span>Support</span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Profile;