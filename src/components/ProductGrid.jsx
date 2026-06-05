import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';

/**
 * Storefront catalog powered by Supabase.
 * Loads products directly from the cloud database and applies in-memory filters
 * for instant user feedback.
 */
const ProductGrid = ({ onProductClick }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todas');
    const [maxPrice, setMaxPrice] = useState(0);
    const [priceFilter, setPriceFilter] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products with their current stock levels from the inventory join
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        inventory (
                            stock_actual
                        )
                    `)
                    .eq('active', true);

                if (error) throw error;

                // Flatten the data for easier consumption in the UI
                const formattedProducts = data.map(p => ({
                    ...p,
                    stock_actual: p.inventory?.stock_actual || 0,
                    // Check for low stock (demonstration threshold: 5)
                    is_low: (p.inventory?.stock_actual || 0) <= 5 && (p.inventory?.stock_actual || 0) > 0
                }));

                setProducts(formattedProducts);
                const highest = formattedProducts.reduce((max, p) => Math.max(max, p.price), 0);
                setMaxPrice(highest);
                setPriceFilter(highest);
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
        if (priceFilter && p.price > priceFilter) return false;
        if (inStockOnly && p.stock_actual <= 0) return false;
        return true;
    }), [products, search, category, priceFilter, inStockOnly]);

    return (
        <section className="animate-fade-in">
            {/* Filter bar */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-8 flex flex-col lg:flex-row gap-4 lg:items-center">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar prenda o SKU..."
                    className="bg-white/5 border border-white/10 text-sm rounded-full px-6 py-3 flex-grow focus:outline-none focus:border-accent transition-all placeholder:text-white/20 text-white"
                />
                <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${category === c ? 'bg-accent text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setInStockOnly((v) => !v)}
                    className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${inStockOnly ? 'bg-neon-lime text-dark-card border-neon-lime' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}
                >
                    Disponibles
                </button>
                {maxPrice > 0 && (
                    <div className="flex items-center gap-3 min-w-[180px]">
                        <input
                            type="range"
                            min="0"
                            max={maxPrice}
                            step="10"
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(Number(e.target.value))}
                            className="accent-accent flex-grow cursor-pointer"
                        />
                        <span className="text-[10px] font-black text-white/60 whitespace-nowrap">&le; ${priceFilter}</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="py-32 flex justify-center">
                    <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
                </div>
            ) : visible.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
