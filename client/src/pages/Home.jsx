import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/endpoints';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Common';

function Section({ title, viewAllLink, products, loading }) {
  return (
    <section className="container-page py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-brand-600 text-sm font-semibold hover:underline">
            View All →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [discounted, setDiscounted] = useState([]);
  const [women, setWomen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [newRes, trendRes, discRes, womenRes] = await Promise.all([
          api.getProducts({ sort: 'newest', limit: 4 }),
          api.getProducts({ sort: 'popular', limit: 4 }),
          api.getProducts({ sort: 'discount', limit: 4 }),
          api.getProducts({ category: 'women', limit: 4 }),
        ]);
        setNewArrivals(newRes.data.data.products);
        setTrending(trendRes.data.data.products);
        setDiscounted(discRes.data.data.products);
        setWomen(womenRes.data.data.products);
      } catch {
        // Homepage sections fail silently — the page still renders without them.
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-100">
        <div className="container-page py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Fashion that fits every <span className="text-brand-600">story</span>.
            </h1>
            <p className="mt-4 text-gray-600 max-w-md">
              Curated collections for women, girls, and child girls — elegant, comfortable, and made for everyday
              confidence.
            </p>
            <Link to="/products" className="btn-primary inline-block mt-8">
              Shop Now
            </Link>
          </div>
          <div className="flex-1 h-72 md:h-96 w-full rounded-2xl bg-brand-200/60 flex items-center justify-center text-brand-700 font-display text-2xl">
            Unique Designs
          </div>
        </div>
      </section>

      <section className="container-page py-10 grid grid-cols-3 gap-4">
        {['Women', 'Girls', 'Child Girls'].map((cat) => (
          <Link
            key={cat}
            to={`/products?category=${cat.toLowerCase().replace(/\s+/g, '-')}`}
            className="card p-6 text-center font-semibold hover:shadow-md transition-shadow"
          >
            {cat}
          </Link>
        ))}
      </section>

      <Section title="New Arrivals" viewAllLink="/products?sort=newest" products={newArrivals} loading={loading} />
      <Section title="Trending Products" viewAllLink="/products?sort=popular" products={trending} loading={loading} />
      <Section title="Discount Products" viewAllLink="/products?sort=discount" products={discounted} loading={loading} />
      <Section title="Women Collection" viewAllLink="/products?category=women" products={women} loading={loading} />
    </div>
  );
}
