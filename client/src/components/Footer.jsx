import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-xl text-white mb-3">Unique Designs</h3>
          <p className="text-sm text-gray-400">
            Fashion crafted for women, girls and child girls — modern, elegant, everyday wear.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products?category=women">Women</Link></li>
            <li><Link to="/products?category=girls">Girls</Link></li>
            <li><Link to="/products?category=child-girls">Child Girls</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/user/wishlist">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>support@uniquedesigns.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Unique Designs. All rights reserved.
      </div>
    </footer>
  );
}
