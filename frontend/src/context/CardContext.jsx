import { createContext, useState, useContext, useEffect } from "react";
import { authFetch, getAccessToken, isAuthenticated } from "../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cartItems');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
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
        setCartItems(items);
        setTotal(t);
        localStorage.setItem('cartItems', JSON.stringify(items));
        localStorage.setItem('cartTotal', t.toString());
    }
    
    const fetchCart = async () => {
        try {
            const res = await authFetch(`${BASEURL}/api/cart/`)
            const data = await res.json()
            updateCartState(data)
        } catch (error) {
            console.error('Error fetching cart:', error)
        }
    }

    const token = getAccessToken();
    useEffect(() => { 
        if (isAuthenticated()) {
            fetchCart()
        } else {
            clearCart()
        }
    }, [token])

    const addToCart = async (product_id, quantity = 1) => {
        const previousCartItems = [...cartItems];
        const previousTotal = total;

        const existingItem = cartItems.find(item => item.product === product_id);
        if (existingItem) {
            const newCartItems = cartItems.map(item =>
                item.product === product_id ? { ...item, quantity: item.quantity + quantity } : item
            );
            const newTotal = newCartItems.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);
            setCartItems(newCartItems);
            setTotal(newTotal);
        }

        try {
            const res = await authFetch(`${BASEURL}/api/cart/add/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: product_id, quantity: quantity })
            })
            if (!res.ok) throw new Error(`Failed to add to cart: ${res.status}`)
            const data = await res.json()
            updateCartState(data)
        }
        catch (error) {
            console.error('Error adding to cart:', error)
            setCartItems(previousCartItems);
            setTotal(previousTotal);
        }
    }

    const removeFromCart = async (itemId) => {
        const previousCartItems = [...cartItems];
        const previousTotal = total;

        const newCartItems = cartItems.filter(item => item.id !== itemId);
        const newTotal = newCartItems.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);
        
        setCartItems(newCartItems);
        setTotal(newTotal);

        try {
            const res = await authFetch(`${BASEURL}/api/cart/remove/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId })
            })
            if (!res.ok) throw new Error(`Failed to remove from cart: ${res.status}`)
            const data = await res.json()
            updateCartState(data)
        } catch (error) {
            console.error('Error removing from cart:', error)
            setCartItems(previousCartItems);
            setTotal(previousTotal);
        }
    }

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(itemId)
            return
        }

        const previousCartItems = [...cartItems];
        const previousTotal = total;

        const newCartItems = cartItems.map(item => 
            item.id === itemId ? { ...item, quantity } : item
        );
        const newTotal = newCartItems.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);
        
        setCartItems(newCartItems);
        setTotal(newTotal);

        try {
            const res = await authFetch(`${BASEURL}/api/cart/update/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId, quantity })
            })
            if (!res.ok) throw new Error(`Failed to update quantity: ${res.status}`)
            const data = await res.json()
            updateCartState(data)
        } catch (error) {
            console.error('Error updating cart quantity:', error)
            setCartItems(previousCartItems);
            setTotal(previousTotal);
        }
    }

    const clearCart = () => {
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