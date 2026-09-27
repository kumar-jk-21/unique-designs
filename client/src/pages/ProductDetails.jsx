import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { assetUrl, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Loader, StarRating } from '../components/Common';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getProductById(id)
      .then((res) => {
        const p = res.data.data.product;
        setProduct(p);
        setSize(p.sizes?.[0] || '');
        setColor(p.colors?.[0] || '');
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading product..." />;
  if (!product) return <div className="container-page py-16 text-center text-gray-500">Product not found.</div>;

  const images = product.images || [];
  const hasDiscount = product.discountAmount > 0;

  function handleAddToCart() {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} item(s) left in stock`);
      return;
    }
    addItem(product, quantity, size, color);
  }

  async function handleWishlist() {
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

  return (
    <div className="container-page py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div className="h-96 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative">
          {images.length > 0 ? (
            <img src={assetUrl(images[activeImage]?.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">No image</span>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 w-8 h-8 rounded-full"
              >
                ‹
              </button>
              <button
                onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 w-8 h-8 rounded-full"
              >
                ›
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  activeImage === i ? 'border-brand-600' : 'border-transparent'
                }`}
              >
                <img src={assetUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-brand-600 font-semibold">{product.category?.name}</p>
        <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
        <div className="mt-2">
          <StarRating value={product.rating || 0} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl font-bold text-brand-700">₹{product.finalPrice}</span>
          {hasDiscount && (
            <>
              <span className="text-gray-400 line-through">₹{product.price}</span>
              <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-1 rounded-full">
                You Save ₹{product.discountAmount}
              </span>
            </>
          )}
        </div>

        <p className="text-gray-600 mt-4">{product.description}</p>

        {product.sizes?.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-2">Size</h4>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    size === s ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Color</h4>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    color === c ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <h4 className="text-sm font-semibold">Quantity</h4>
          <div className="flex items-center border rounded-lg">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1">
              −
            </button>
            <span className="px-4">{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-1">
              +
            </button>
          </div>
          <span className="text-xs text-gray-500">{product.stock} in stock</span>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={handleAddToCart} disabled={product.stock <= 0} className="btn-primary flex-1">
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button onClick={handleWishlist} className="btn-outline">
            ♡ Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
