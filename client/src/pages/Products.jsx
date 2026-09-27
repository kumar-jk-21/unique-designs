import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../services/endpoints';
import ProductCard from '../components/ProductCard';
import { SkeletonCard, EmptyState } from '../components/Common';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Highest Discount' },
  { value: 'popular', label: 'Popular' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.data.data.categories)).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getProducts({
        category: category || undefined,
        search: search || undefined,
        sort,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStock || undefined,
        page,
        limit: 12,
      });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, minPrice, maxPrice, inStock, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">
        {category ? category.replace(/-/g, ' ') : 'All Products'}
        {search && <span className="text-gray-500 font-normal text-base"> — results for "{search}"</span>}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-sm mb-2">Category</h3>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Price Range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateParam('minPrice', e.target.value)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam('maxPrice', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inStock === 'true'}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
              />
              In Stock Only
            </label>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="input-field w-52">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState message="No products found." />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`w-9 h-9 rounded-full text-sm ${
                        page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
