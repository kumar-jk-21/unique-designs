import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { assetUrl, getErrorMessage } from '../services/api';
import { useCart } from '../context/CartContext';
import { Loader, EmptyState } from '../components/Common';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.getWishlist();
      setItems(data.data.items);
      setTotalValue(data.data.totalValue);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(productId) {
    try {
      await api.removeFromWishlist(productId);
      toast.success('Removed from wishlist');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleMoveToCart(item) {
    await addItem(item.product, 1);
    await handleRemove(item.product.id);
  }

  if (loading) return <Loader label="Loading wishlist..." />;

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <EmptyState message="Your wishlist is empty." actionLabel="Browse Products" onAction={() => (window.location.href = '/products')} />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <Link to={`/products/${item.product.id}`}>
                <img
                  src={assetUrl(item.product.images?.[0]?.imageUrl) || 'https://placehold.co/80x80'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
              </Link>
              <div className="flex-1">
                <Link to={`/products/${item.product.id}`} className="font-semibold hover:text-brand-600">
                  {item.product.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-brand-700">₹{item.product.finalPrice}</span>
                  {item.product.discountAmount > 0 && (
                    <span className="text-gray-400 text-sm line-through">₹{item.product.price}</span>
                  )}
                </div>
              </div>
              <button onClick={() => handleMoveToCart(item)} className="btn-outline text-sm py-2 px-3">
                Move to Cart
              </button>
              <button onClick={() => handleRemove(item.product.id)} className="text-red-500 text-sm">
                Remove
              </button>
            </div>
          ))}
          <div className="text-right font-semibold text-lg pt-4">Total Wishlist Value: ₹{totalValue}</div>
        </div>
      )}
    </div>
  );
}
