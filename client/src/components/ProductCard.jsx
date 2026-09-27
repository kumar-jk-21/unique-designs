import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import * as api from '../services/endpoints';
import { assetUrl, getErrorMessage } from '../services/api';
import { StarRating } from './Common';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const image = product.images?.[0]?.imageUrl;
  const hasDiscount = product.discountAmount > 0;

  async function handleWishlist(e) {
    e.preventDefault();
    if (!user) {
      toast.error('Please login or create an account to continue.');
      return;
    }
    try {
      await api.addToWishlist(product.id);
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function handleAddToCart(e) {
    e.preventDefault();
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    addItem(product, 1);
  }

  return (
    <Link to={`/products/${product.id}`} className="card overflow-hidden group block">
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={assetUrl(image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-lg hover:text-brand-600"
          title="Add to wishlist"
        >
          ♡
        </button>
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {product.discountType === 'PERCENTAGE' ? `${product.discountValue}% OFF` : `₹${product.discountValue} OFF`}
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
        <div className="mt-1">
          <StarRating value={product.rating || 0} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-brand-700">₹{product.finalPrice}</span>
          {hasDiscount && <span className="text-gray-400 text-sm line-through">₹{product.price}</span>}
        </div>
        <button onClick={handleAddToCart} className="btn-primary w-full mt-3 text-sm py-2">
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
