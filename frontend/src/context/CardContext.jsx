import { createContext, useState, useContext, useEffect } from "react";
import { authFetch, getAccessToken, isAuthenticated } from "../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL
    const [cartItems, setCartItems] = useState([])
    const [total, setTotal] = useState(0)

    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            alert("Please login or register first.");
            navigate('/login');
            return true;
        }
        return false;
    }

    const updateCartState = (data) => {
        setCartItems(data.item || [])
        setTotal(parseFloat(data.total) || 0)
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

    const addToCart = async (product, quantity = 1) => {
        try {
            const res = await authFetch(`${BASEURL}/api/cart/add/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: product, quantity: quantity })
            })
            if (!res.ok) throw new Error(`Failed to add to cart: ${res.status}`)
            const data = await res.json()
            updateCartState(data)
        }
        catch (error) {
            console.error('Error adding to cart:', error)
        }
    }

    const removeFromCart = async (itemId) => {
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
        }
    }

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(itemId)
            return
        }
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
        }
    }

    const clearCart = () => {
        setCartItems([])
        setTotal(0)
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