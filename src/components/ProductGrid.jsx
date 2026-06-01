import React from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

const ProductGrid = ({ onProductClick }) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4 animate-fade-in">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onClick={onProductClick} 
        />
      ))}
    </section>
  );
};

export default ProductGrid;
