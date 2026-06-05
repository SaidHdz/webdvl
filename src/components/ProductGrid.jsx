import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';
import ElasticSlider from './ui/ElasticSlider';

/**
 * Storefront catalog powered by Supabase.
 * Features an interactive ElasticSlider for premium price filtering.
 */
const ProductGrid = ({ onProductClick, initialCategory = 'Todas', initialSearch = '' }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(initialSearch);
    const [category, setCategory] = useState(initialCategory);
    const [maxPriceLimit, setMaxPriceLimit] = useState(1000);
    const [priceFilter, setPriceFilter] = useState(1000);
    const [inStockOnly, setInStockOnly] = useState(false);

    // Sync state when initial props change
    useEffect(() => {
        setCategory(initialCategory);
        setSearch(initialSearch);
    }, [initialCategory, initialSearch]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`*, inventory (stock_actual)`)
                    .eq('active', true);

                if (error) throw error;

                const formattedProducts = data.map(p => ({
                    ...p,
                    stock_actual: p.inventory?.stock_actual || 0,
                    is_low: (p.inventory?.stock_actual || 0) <= 5 && (p.inventory?.stock_actual || 0) > 0
                }));

                setProducts(formattedProducts);
                
                const highest = formattedProducts.reduce((max, p) => Math.max(max, p.price), 0);
                setMaxPriceLimit(highest || 1000);
                setPriceFilter(highest || 1000);
            } catch (err) {
                console.error('Error loading products:', err.message);
                toast.error('No se pudieron cargar los productos');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const categories = useMemo(
        () => ['Todas', ...new Set(products.map((p) => p.category).filter(Boolean))],
        [products]
    );

    const visible = useMemo(() => products.filter((p) => {
        if (search && !`${p.name} ${p.id_producto}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (category !== 'Todas' && p.category !== category) return false;
        if (p.price > priceFilter) return false;
        if (inStockOnly && p.stock_actual <= 0) return false;
        return true;
    }), [products, search, category, priceFilter, inStockOnly]);

    return (
        <section className="animate-fade-in">
            {/* Unified Premium Filter Bar */}
            <div className="bg-[#1C1C1C] border border-white/10 rounded-[32px] p-8 mb-12 flex flex-col gap-10 shadow-2xl">
                {/* Search Bar - Dominant Row */}
                <div className="relative w-full">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar en la colección..."
                        className="w-full bg-white/5 border border-white/5 text-sm rounded-2xl px-14 py-5 focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 text-white font-medium"
                    />
                    <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>

                {/* Controls Row - Cohesive and Compact */}
                <div className="flex flex-col xl:flex-row items-center gap-10 xl:gap-12">
                    {/* 1. Categories */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all whitespace-nowrap ${category === c ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white border border-white/5'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="hidden xl:block w-px h-10 bg-white/5" />

                    {/* 2. Dynamic Price Slider Container */}
                    <div className="flex-grow w-full xl:max-w-md bg-white/[0.02] px-8 py-4 rounded-[24px] border border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-[3px] text-white/20">Rango de Precio</span>
                            <span className="text-white font-black text-[11px] tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                                $0 — ${Math.round(priceFilter)}
                            </span>
                        </div>
                        <ElasticSlider 
                            startingValue={0}
                            maxValue={maxPriceLimit}
                            defaultValue={priceFilter}
                            onChange={setPriceFilter}
                            className="!w-full !items-start"
                        />
                    </div>

                    <div className="hidden xl:block w-px h-10 bg-white/5" />

                    {/* 3. Availability Toggle */}
                    <button
                        onClick={() => setInStockOnly((v) => !v)}
                        className={`shrink-0 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all border ${inStockOnly ? 'bg-white text-black border-white shadow-xl' : 'bg-transparent text-white/40 border-white/10 hover:text-white hover:border-white/20'}`}
                    >
                        Solo Disponibles
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-32 flex justify-center">
                    <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
                </div>
            ) : visible.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {visible.map((product) => (
                        <ProductCard key={product.id} product={product} onClick={onProductClick} />
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center text-white/20 uppercase font-black tracking-[4px] text-[10px]">
                    No hay productos que coincidan con tu busqueda
                </div>
            )}
        </section>
    );
};

export default ProductGrid;
