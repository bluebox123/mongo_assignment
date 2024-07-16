import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomePage = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/homepage');
                console.log(response.data);
                setContent(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center mt-5 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto p-5">
            {content && (
                <>
                    <div className="mb-5">
                        <a href={content.banner.link}>
                            <img src={content.banner.imageUrl} alt="Banner" className="w-full rounded" />
                        </a>
                    </div>
                    <h2 className="text-2xl font-bold mb-5">Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {content.products.map(product => (
                            <div key={product.id} className="bg-white p-5 rounded shadow">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />
                                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                <p className="text-gray-700 mb-4">{product.description}</p>
                                <p className="text-lg font-bold">${product.price}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default HomePage;
