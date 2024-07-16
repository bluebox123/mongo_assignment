import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HiPencil, HiTrash } from "react-icons/hi";

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await axios.get('/api/cart');
                setCart(response.data.cartItems);
                setTotalItems(response.data.totalItems);
                setTotalPrice(response.data.totalPrice);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleUpdateQuantity = async (productId, quantity) => {
        try {
            await axios.put(`/api/cart/${productId}`, { quantity });
            const updatedCart = cart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            );
            setCart(updatedCart);
            updateTotals(updatedCart);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveProduct = async (productId) => {
        try {
            await axios.delete(`/api/cart/${productId}`);
            const updatedCart = cart.filter(item => item.productId !== productId);
            setCart(updatedCart);
            updateTotals(updatedCart);
        } catch (err) {
            setError(err.message);
        }
    };

    const updateTotals = (updatedCart) => {
        let items = 0;
        let price = 0;
        updatedCart.forEach(item => {
            items += item.quantity;
            price += item.quantity * item.product.price;
        });
        setTotalItems(items);
        setTotalPrice(price);
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center mt-5 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-2xl font-bold mb-5">Your Cart</h1>
            {cart.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-5">
                        {cart.map(item => (
                            <div key={item.productId} className="flex items-center bg-white p-5 rounded shadow">
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded mr-5" />
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold">{item.product.name}</h2>
                                    <p className="text-gray-700 mb-2">{item.product.description}</p>
                                    <p className="text-lg font-bold">${item.product.price}</p>
                                    <div className="flex items-center mt-2">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                            className="bg-gray-300 text-gray-700 px-2 py-1 rounded mr-2"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                            className="bg-gray-300 text-gray-700 px-2 py-1 rounded ml-2"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveProduct(item.productId)}
                                    className="text-red-500 ml-5"
                                >
                                    <HiTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5">
                        <h2 className="text-xl font-bold">Total Items: {totalItems}</h2>
                        <h2 className="text-xl font-bold">Total Price: ${totalPrice.toFixed(2)}</h2>
                    </div>
                </>
            ) : (
                <p>Your cart is empty</p>
            )}
        </div>
    );
};

export default CartPage;
