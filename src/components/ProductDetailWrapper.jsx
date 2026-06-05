import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import { supabase } from '../lib/supabase';

/**
 * Fetches a single product powered by Supabase.
 */
const ProductDetailWrapper = ({ onBackToCollection }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | ready | notfound

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, inventory(stock_actual, stock_minimo)')
                    .eq('id', id)
                    .maybeSingle();

                if (error || !data) throw new Error('Not found');

                setProduct({
                    ...data,
                    stock_actual: data.inventory?.stock_actual || 0,
                    is_low: (data.inventory?.stock_actual || 0) <= (data.inventory?.stock_minimo || 5)
                });
                setStatus('ready');
            } catch (err) {
                console.error(err);
                setStatus('notfound');
            }
        };

        fetchProduct();
    }, [id]);

    if (status === 'loading') {
        return (
            <div className="py-32 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'notfound') {
        return <Navigate to="/" replace />;
    }

    return <ProductDetail product={product} onBack={onBackToCollection || (() => navigate('/'))} />;
};


export default ProductDetailWrapper;
