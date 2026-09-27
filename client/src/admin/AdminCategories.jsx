import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { getErrorMessage, getFieldErrors } from '../services/api';
import { Loader, ConfirmModal, EmptyState } from '../components/Common';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.getCategories({ includeInactive: 'true' });
      setCategories(data.data.categories);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCategory(editingId, form);
        toast.success('Category updated successfully');
      } else {
        await api.createCategory(form);
        toast.success('Category created successfully');
      }
      resetForm();
      load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    }
  }

  function handleEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
  }

  async function handleToggleActive(cat) {
    try {
      await api.updateCategory(cat.id, { isActive: !cat.isActive });
      toast.success(`Category ${cat.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function confirmDelete() {
    try {
      await api.deleteCategory(toDelete.id);
      toast.success('Category deleted successfully');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <form onSubmit={handleSubmit} className="card p-5 mb-6 grid sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="label-text">Category Name</label>
          <input
            className="input-field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label className="label-text">Description</label>
          <input
            className="input-field"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Add Category'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-outline">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : categories.length === 0 ? (
        <EmptyState message="No categories found." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Products</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3">{cat._count?.products ?? 0}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 space-x-3">
                    <button onClick={() => handleEdit(cat)} className="text-brand-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleToggleActive(cat)} className="text-gray-600 hover:underline">
                      {cat.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => setToDelete(cat)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${toDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
