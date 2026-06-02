import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import { apiService } from '../services/api';

/**
 * Fetches a single product (with live stock) by its database id from the URL
 * and renders the detail view. Redirects to the catalog if it does not exist.
 */
const ProductDetailWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | ready | notfound

    useEffect(() => {
        apiService.products.get(id)
            .then((res) => { setProduct(res.data); setStatus('ready'); })
            .catch(() => setStatus('notfound'));
    }, [id]);

    if (status === 'loading') {
        return (
            <div className="py-32 flex justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'notfound') {
        return <Navigate to="/" replace />;
    }

    return <ProductDetail product={product} onBack={() => navigate('/')} />;
};

export default ProductDetailWrapper;
