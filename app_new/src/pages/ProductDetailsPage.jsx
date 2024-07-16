import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(`/api/products/${id}`);
                setProduct(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    const addToCart = async () => {
        try {
            const response = await axios.post('/api/cart', { productId: id, quantity: 1 });
            setMessage('Product added to cart successfully');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center mt-5 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto p-5">
            {product && (
                <>
                    <div className="mb-5">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover rounded" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                    <p className="text-gray-700 mb-4">{product.description}</p>
                    <p className="text-lg font-bold mb-5">${product.price}</p>
                    <button
                        onClick={addToCart}
                        className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
                    >
                        Add to Cart
                    </button>
                    {message && <p className="text-green-500 mt-3">{message}</p>}
                </>
            )}
        </div>
    );
};

export default ProductDetailsPage;
