import { createContext, useState, useContext, useEffect, useRef } from "react";
import { authFetch, getAccessToken, isAuthenticated } from "../utils/auth";
import { apiUrl } from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const requestCounter = useRef(0);
    const cartItemsRef = useRef(null);
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cartItems');
            const items = saved ? JSON.parse(saved) : [];
            cartItemsRef.current = items;
            return items;
        } catch {
            cartItemsRef.current = [];
            return [];
        }
    });
    const cartLoadedRef = useRef(false);
    const [total, setTotal] = useState(() => {
        try {
            const saved = localStorage.getItem('cartTotal');
            return saved ? parseFloat(saved) : 0;
        } catch {
            return 0;
        }
    });

    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            alert("Please login or register first.");
            navigate('/login');
            return true;
        }
        return false;
    }

    const updateCartState = (data) => {
        const items = data.item || [];
        const t = parseFloat(data.total) || 0;
        cartItemsRef.current = items;
        setCartItems(items);
        setTotal(t);
        localStorage.setItem('cartItems', JSON.stringify(items));
        localStorage.setItem('cartTotal', t.toString());
    }
    
    const fetchCart = async () => {
        try {
            const res = await authFetch(apiUrl('/api/cart/'))
            const data = await res.json()
            updateCartState(data)
            return true;
        } catch (error) {
            console.error('Error fetching cart:', error)
            return false;
        } finally {
            cartLoadedRef.current = true;
        }
    }

    const token = getAccessToken();
    useEffect(() => { 
        if (isAuthenticated()) {
            cartLoadedRef.current = false;
            fetchCart()
        } else {
            clearCart()
            cartLoadedRef.current = true;
        }
    }, [token])

    const addToCart = async (product, quantity = 1) => {
        if (!cartLoadedRef.current) {
            await fetchCart();
        }

        const product_id = typeof product === 'object' ? product.id : product;
        const currentCartItems = cartItemsRef.current || cartItems;
        const existingItem = currentCartItems.find(
            item => String(item.product) === String(product_id)
        );
        if (existingItem) {
            alert("The item was already in Cart");
            return false;
        }

        if (typeof product === 'object') {
            const newItem = {
                id: `temp-${Date.now()}`,
                product: product.id,
                quantity: quantity,
                product_name: product.name,
                product_price: product.price,
                product_image: product.image
            };
            const newCartItems = [...currentCartItems, newItem];
            const newTotal = newCartItems.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);
            cartItemsRef.current = newCartItems;
            setCartItems(newCartItems);
            setTotal(newTotal);
        }

        const currentReq = ++requestCounter.current;
        try {
            const res = await authFetch(apiUrl('/api/cart/add/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: product_id, quantity: quantity })
            })
            if (!res.ok) throw new Error(`Failed to add to cart: ${res.status}`)
            const data = await res.json()
            if (currentReq === requestCounter.current) {
                updateCartState(data)
            }
            return true;
        }
        catch (error) {
            console.error('Error adding to cart:', error)
            if (currentReq === requestCounter.current) {
                await fetchCart();
            }
            return false;
        }
    }

    const removeFromCart = async (itemId) => {
        const newCartItems = cartItems.filter(item => item.id !== itemId);
        const newTotal = newCartItems.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);
        
        cartItemsRef.current = newCartItems;
        setCartItems(newCartItems);
        setTotal(newTotal);

        if (typeof itemId === 'string' && itemId.startsWith('temp-')) {
            // It's a temporary item, just remove it locally and wait for the real add request to finish
            // Actually, we can't easily cancel the add request. Best to just refresh cart later.
            return;
        }

        const currentReq = ++requestCounter.current;
        try {
            const res = await authFetch(apiUrl('/api/cart/remove/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId })
            })
            if (!res.ok) throw new Error(`Failed to remove from cart: ${res.status}`)
            const data = await res.json()
            if (currentReq === requestCounter.current) {
                updateCartState(data)
            }
        } catch (error) {
            console.error('Error removing from cart:', error)
            if (currentReq === requestCounter.current) {
                await fetchCart();
            }
        }
    }

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(itemId)
            return
        }

        const newCartItems = cartItems.map(item => 
            item.id === itemId ? { ...item, quantity } : item
        );
        const newTotal = newCartItems.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);
        
        cartItemsRef.current = newCartItems;
        setCartItems(newCartItems);
        setTotal(newTotal);

        if (typeof itemId === 'string' && itemId.startsWith('temp-')) {
            return;
        }

        const currentReq = ++requestCounter.current;
        try {
            const res = await authFetch(apiUrl('/api/cart/update/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId, quantity })
            })
            if (!res.ok) throw new Error(`Failed to update quantity: ${res.status}`)
            const data = await res.json()
            if (currentReq === requestCounter.current) {
                updateCartState(data)
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error)
            if (currentReq === requestCounter.current) {
                await fetchCart();
            }
        }
    }

    const clearCart = () => {
        cartItemsRef.current = [];
        setCartItems([])
        setTotal(0)
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartTotal');
    }

    return (
        <CartContext.Provider
            value={{ cartItems, total, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    return useContext(CartContext)
}