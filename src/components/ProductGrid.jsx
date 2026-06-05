import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';
import ElasticSlider from './ui/ElasticSlider';

/**
 * Optimized Storefront catalog with compact filter architecture.
 */
const ProductGrid = ({ onProductClick, initialCategory = 'Todas', initialSearch = '' }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(initialSearch);
    const [category, setCategory] = useState(initialCategory);
    const [maxPriceLimit, setMaxPriceLimit] = useState(1000);
    const [priceFilter, setPriceFilter] = useState(1000);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [isExtraFiltersOpen, setIsExtraFiltersOpen] = useState(false);

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
        <section className="animate-fade-in space-y-12">
            {/* Compact Filter Architecture */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 via-transparent to-transparent opacity-30 pointer-events-none" />

                <div className="relative z-10 p-4 lg:p-6 space-y-4">
                    {/* Row 1: Search, Categories & Favorites (Ultra-compact) */}
                    <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-8">
                        {/* Search Bar */}
                        <div className="relative w-full xl:w-96">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="BUSCAR DROP..."
                                className="w-full bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-[2px] rounded-xl px-12 py-4 focus:outline-none focus:border-[#a855f7]/40 transition-all placeholder:text-white/10 text-white"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>

                        {/* Categories & Favorites Wrapper */}
                        <div className="flex flex-wrap items-center justify-between xl:justify-start gap-3 w-full xl:w-auto">
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCategory(c)}
                                        className={`px-4 xl:px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[2px] transition-all duration-300 border ${category === c ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-white/[0.02] text-white/30 border-white/5 hover:border-white/20 hover:text-white'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            <div className="h-4 w-px bg-white/5 hidden xl:block mx-2" />

                            <div className="flex items-center gap-2 ml-auto xl:ml-0">
                                <button
                                    onClick={() => setShowFavorites(!showFavorites)}
                                    className={`shrink-0 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[2px] transition-all flex items-center gap-2 border ${showFavorites ? 'bg-[#ff4444] text-white border-[#ff4444]' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white'}`}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill={showFavorites ? "white" : "none"} stroke="currentColor" strokeWidth="3"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    <span className="hidden sm:inline">Favoritos</span>
                                </button>
                                
                                {/* Toggle for Advanced Filters (Mobile Focus) */}
                                <button 
                                    onClick={() => setIsExtraFiltersOpen(!isExtraFiltersOpen)}
                                    className={`lg:hidden px-4 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[2px] transition-all ${isExtraFiltersOpen ? 'bg-[#a855f7] text-white border-[#a855f7]' : 'bg-white/5 border-white/5 text-white/40'}`}
                                >
                                    {isExtraFiltersOpen ? 'Cerrar' : 'Filtros'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Price & Stock (Collapsible on Mobile, compact on Desktop) */}
                    <AnimatePresence>
                        {(isExtraFiltersOpen || window.innerWidth >= 1024) && (
                            <motion.div 
                                initial={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : false}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-t border-white/5 pt-4 lg:pt-6">
                                    <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-4 xl:gap-8">
                                        <div className="flex flex-col shrink-0">
                                            <span className="text-[8px] font-black uppercase tracking-[3px] text-[#a855f7]">Filtro Inversión</span>
                                            <div className="text-white font-syne font-black text-lg">
                                                <span className="text-[10px] opacity-30 mr-1">$</span>{Math.round(priceFilter)}
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/[0.01] px-4 py-3 rounded-2xl border border-white/5 flex items-center">
                                            <ElasticSlider 
                                                startingValue={0}
                                                maxValue={maxPriceLimit}
                                                defaultValue={priceFilter}
                                                onChange={setPriceFilter}
                                                className="!w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 flex justify-end">
                                        <button
                                            onClick={() => setInStockOnly((v) => !v)}
                                            className={`w-full lg:w-auto px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[3px] transition-all border ${inStockOnly ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-white/5 text-white/20 border-white/5 hover:text-white'}`}
                                        >
                                            {inStockOnly ? '✓ Solo Stock' : 'Mostrar Agotados'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {loading ? (
                <div className="py-32 flex justify-center">
                    <div className="w-12 h-12 border-4 border-white/5 border-t-[#a855f7] rounded-full animate-spin" />
                </div>
            ) : visible.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 lg:gap-y-24">
                    {visible.map((product) => (
                        <ProductCard key={product.id} product={product} onClick={onProductClick} />
                    ))}
                </div>
            ) : (
                <div className="py-40 text-center space-y-4">
                    <div className="text-white/10 font-syne font-black text-6xl tracking-tighter opacity-20 select-none uppercase">Vacío</div>
                    <p className="text-white/20 uppercase font-black tracking-[5px] text-[10px]">
                        Ninguna pieza coincide con este criterio
                    </p>
                </div>
            )}
        </section>
    );
};

export default ProductGrid;
