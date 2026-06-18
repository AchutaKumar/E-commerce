import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/auth";
import "../static/AdminAddProduct.css";

const AdminAddProduct = () => {
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: "",
        price: "",
        description: "",
        category: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    // Fetch categories on load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${BASEURL}/api/category/`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, [BASEURL]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });

        if (!form.category) {
            setMsg({ text: "Please select a category", type: "error" });
            setLoading(false);
            return;
        }

        if (parseFloat(form.price) <= 0) {
            setMsg({ text: "Price must be a positive number", type: "error" });
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("description", form.description);
            formData.append("category", form.category);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await authFetch(`${BASEURL}/api/products/create/`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                setMsg({ text: "Product created successfully!", type: "success" });
                setForm({ name: "", price: "", description: "", category: "" });
                setImageFile(null);
                setImagePreview(null);
            } else {
                const data = await res.json();
                setMsg({ text: data.error || "Failed to create product", type: "error" });
            }
        } catch (err) {
            console.error("Error creating product:", err);
            setMsg({ text: "A network error occurred. Please try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pg-wrap admin-page-wrap">
            <div className="admin-back-bar">
                <button onClick={() => navigate(-1)} className="admin-back-btn" title="Go back">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    <span>Back</span>
                </button>
            </div>

            <div className="pg-card admin-card">
                <div className="pg-banner admin-banner">
                    <div className="admin-icon-bubble">📦</div>
                </div>

                <div className="pg-body">
                    <div className="pg-top">
                        <div>
                            <h2 className="pg-name">Add New Product</h2>
                            <p className="pg-email">Create and publish a product on LoyalKart</p>
                            <span className="pg-badge"><span className="pg-dot" />Admin Mode</span>
                        </div>
                    </div>
                    <hr className="pg-divider" />

                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="name">Product Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Premium Leather Jacket"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    required
                                    className="admin-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">Price ($)</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    value={form.price}
                                    onChange={handleInputChange}
                                    required
                                    className="admin-input"
                                />
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleInputChange}
                                    required
                                    className="admin-select"
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Write detailed description about features, sizing, materials..."
                                value={form.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="admin-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label>Product Image</label>
                            <div className="image-upload-container">
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="image-file-input"
                                />
                                <label htmlFor="image" className="image-upload-label">
                                    <div className="upload-prompt">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        <span>Click to upload image file</span>
                                    </div>
                                </label>
                                {imagePreview && (
                                    <div className="image-preview-wrapper">
                                        <img src={imagePreview} alt="Preview" className="image-preview-img" />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="remove-preview-btn"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {msg.text && (
                            <div className={`admin-msg ${msg.type}`}>
                                {msg.text}
                            </div>
                        )}

                        <div className="admin-actions">
                            <button type="submit" className="admin-btn pg-btn pg-btn-primary" disabled={loading}>
                                {loading ? "Creating..." : "Publish Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddProduct;
