import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { assetUrl, getErrorMessage } from '../services/api';
import { Loader, ConfirmModal, EmptyState } from '../components/Common';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  async function load(page = 1) {
    setLoading(true);
    try {
      const { data } = await api.getProducts({ search: search || undefined, page, limit: 10 });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    load(1);
  }

  async function confirmDelete() {
    try {
      await api.deleteProduct(toDelete.id);
      toast.success('Product deleted successfully');
      setToDelete(null);
      load(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    }
  }

  async function handleToggleStatus(product) {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const formData = new FormData();
    formData.append('status', nextStatus);
    try {
      await api.updateProduct(product.id, formData);
      toast.success(`Product ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      load(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/add" className="btn-primary text-sm">
          + Add Product
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 max-w-sm">
        <input
          className="input-field"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState message="No products found." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <img
                      src={assetUrl(p.images?.[0]?.imageUrl) || 'https://placehold.co/48x48'}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                    />
                  </td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.category?.name}</td>
                  <td className="p-3">
                    ₹{p.finalPrice} {p.discountAmount > 0 && <span className="text-gray-400 line-through text-xs">₹{p.price}</span>}
                  </td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : p.status === 'OUT_OF_STOCK'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-3 whitespace-nowrap">
                    <Link to={`/admin/products/edit/${p.id}`} className="text-brand-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleToggleStatus(p)} className="text-gray-600 hover:underline">
                      {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => setToDelete(p)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => load(i + 1)}
              className={`w-9 h-9 rounded-full text-sm ${
                pagination.page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${toDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
