import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from '../components/ProductCard';
import '../static/ProductList.css';
import { ProductListSkeleton } from '../components/SkeletonLoader';

function ProductList() {
    const [products, setProducts] = useState(() => {
        const cached = sessionStorage.getItem('cachedProducts');
        return cached ? JSON.parse(cached) : [];
    });
    const [categories, setCategories] = useState(() => {
        const cached = sessionStorage.getItem('cachedCategories');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(!products.length);
    const [error, setError] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || 'All';

    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    // Fetch Products and Categories in parallel
    useEffect(() => {
        Promise.all([
            fetch(`${BASEURL}/api/products/`).then((res) => {
                if (!res.ok) throw new Error("Failed to fetch products");
                return res.json();
            }),
            fetch(`${BASEURL}/api/category/`).then((res) => {
                if (!res.ok) throw new Error("Failed to fetch categories");
                return res.json();
            })
        ])
        .then(([productsData, categoriesData]) => {
            const sortedProducts = productsData.sort(() => 0.5 - Math.random());
            setProducts(sortedProducts);
            setCategories(categoriesData);
            sessionStorage.setItem('cachedProducts', JSON.stringify(sortedProducts));
            sessionStorage.setItem('cachedCategories', JSON.stringify(categoriesData));
            setLoading(false);
        })
        .catch((err) => {
            setError(err);
            setLoading(false);
        });
    }, [BASEURL]);

    const handleCategorySelect = (catId) => {
        const params = {};
        if (catId !== 'All') params.category = catId;
        setSearchParams(params);
    };

    // Filter products locally
    const filteredProducts = products.filter((product) => {
        const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()));

        const matchesCategory = selectedCategory === 'All' ||
            (product.category && (
                product.category.id.toString() === selectedCategory ||
                product.category.name === selectedCategory
            ));

        return matchesQuery && matchesCategory;
    });

    if (loading) {
        return (
            <div className="products-container">
                <div className="products-catalog-header" style={{ marginBottom: '20px' }}>
                    {query ? (
                        <h1 className="products-title">Search results for "{query}"</h1>
                    ) : (
                        <div className="hero-banner">
                            <div className="hero-content">
                                <h1>New Arrivals</h1>
                                <p>Discover premium quality products curated just for you.</p>
                            </div>
                        </div>
                    )}
                </div>
                <ProductListSkeleton count={8} />
            </div>
        );
    }

    if (error) {
        return <div className="products-error">Error: {error.message}</div>;
    }

    return (
        <div className="products-container">
            <div className="products-catalog-header">
                {query ? (
                    <h1 className="products-title">Search results for "{query}"</h1>
                ) : (
                    <div className="hero-banner">
                        <div className="hero-content">
                            <h1>New Arrivals</h1>
                            <p>Discover premium quality products curated just for you.</p>
                        </div>
                    </div>
                )}

                {/* Category Filtering pills row */}
                <div className="category-filter-bar">
                    <button
                        className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                        onClick={() => handleCategorySelect('All')}
                    >
                        All Items
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id.toString() || selectedCategory === cat.name ? 'active' : ''}`}
                            onClick={() => handleCategorySelect(cat.id.toString())}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="products-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="no-products">
                        <h3>No products found</h3>
                        <p>We couldn't find matches. Try adjusting your query or category filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductList;