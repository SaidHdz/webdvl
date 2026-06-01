import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import { products } from '../data/products';

/**
 * Wrapper for ProductDetail to handle ID from URL and data fetching.
 */
const ProductDetailWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Find the product by ID
    const product = products.find(p => p.id === id);

    if (!product) {
        // If product not found, redirect to catalog
        return <Navigate to="/" replace />;
    }

    return (
        <ProductDetail 
            product={product} 
            onBack={() => navigate('/')} 
        />
    );
};

export default ProductDetailWrapper;
