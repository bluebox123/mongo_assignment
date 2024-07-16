import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailsPage = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Product Details for Product ID: {id}</h1>
        </div>
    );
};

export default ProductDetailsPage;
