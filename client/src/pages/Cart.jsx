import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../services/api';
import { EmptyState, Loader } from '../components/Common';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, total, loading, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loader label="Loading cart..." />;

  function handleCheckout() {
    if (!user) {
      toast.error('Please login or create an account to continue.');
      navigate('/login');
      return;
    }
    toast.success('Checkout flow is not part of this build — cart totals are ready to hand off.');
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">My Cart</h1>
      {items.length === 0 ? (
        <EmptyState message="Your cart is empty." actionLabel="Browse Products" onAction={() => navigate('/products')} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              const itemKey = user ? item.id : item.productId;
              return (
                <div key={itemKey} className="card p-4 flex items-center gap-4">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={assetUrl(product.images?.[0]?.imageUrl) || 'https://placehold.co/80x80'}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/products/${product.id}`} className="font-semibold hover:text-brand-600">
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-brand-700">₹{product.finalPrice}</span>
                      {product.discountAmount > 0 && (
                        <span className="text-gray-400 text-sm line-through">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(itemKey, Math.max(1, item.quantity - 1))} className="px-3 py-1">
                      −
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button onClick={() => updateQuantity(itemKey, item.quantity + 1)} className="px-3 py-1">
                      +
                    </button>
                  </div>
                  <span className="font-semibold w-20 text-right">
                    ₹{item.subtotal ?? (product.finalPrice * item.quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeItem(itemKey)} className="text-red-500 text-sm">
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <div className="card p-6 h-fit">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
              <span>Total</span>
              <span>₹{user ? total : '—'}</span>
            </div>
            {!user && (
              <p className="text-xs text-gray-500 mt-2">Login to see live pricing and complete checkout.</p>
            )}
            <button onClick={handleCheckout} className="btn-primary w-full mt-5">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
