import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Women', to: '/products?category=women' },
  { label: 'Girls', to: '/products?category=girls' },
  { label: 'Child Girls', to: '/products?category=child-girls' },
  { label: 'Categories', to: '/products' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="container-page flex items-center justify-between h-16">
        <Link to="/" className="font-display text-2xl font-bold text-brand-700">
          Unique Designs
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm font-medium text-gray-700 hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:block w-64">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="input-field"
          />
        </form>

        <div className="flex items-center gap-4">
          <Link to="/user/wishlist" className="text-gray-700 hover:text-brand-600 text-xl" title="Wishlist">
            ♡
          </Link>
          <Link to="/user/cart" className="relative text-gray-700 hover:text-brand-600 text-xl" title="Cart">
            🛍
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative group">
              <button className="text-sm font-medium text-gray-700">Hi, {user.fullName?.split(' ')[0]}</button>
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-40">
                <div className="card py-2">
                  <Link to="/user/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">
                    My Profile
                  </Link>
                  <Link to="/user/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50">
                    Wishlist
                  </Link>
                  <Link to="/user/cart" className="block px-4 py-2 text-sm hover:bg-gray-50">
                    Cart
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-4">
              Login
            </Link>
          )}
          <button className="lg:hidden text-2xl" onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 pb-4">
          <form onSubmit={handleSearch} className="my-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field"
            />
          </form>
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
