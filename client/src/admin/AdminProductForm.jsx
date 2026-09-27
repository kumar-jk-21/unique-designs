import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { assetUrl, getErrorMessage, getFieldErrors } from '../services/api';

const emptyForm = {
  name: '',
  categoryId: '',
  description: '',
  price: '',
  discountType: 'NONE',
  discountValue: '',
  stock: '',
  rating: '0',
  status: 'ACTIVE',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCategories({ includeInactive: 'true' }).then((res) => setCategories(res.data.data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.getProductById(id).then((res) => {
      const p = res.data.data.product;
      setForm({
        name: p.name,
        categoryId: p.categoryId,
        description: p.description,
        price: p.price,
        discountType: p.discountType,
        discountValue: p.discountValue,
        stock: p.stock,
        rating: p.rating,
        status: p.status,
      });
      setSizes(p.sizes || []);
      setColors(p.colors || []);
      setExistingImages(p.images || []);
    });
  }, [id, isEdit]);

  // Live discount preview
  const price = Number(form.price) || 0;
  const discountValue = Number(form.discountValue) || 0;
  let discountAmount = 0;
  if (form.discountType === 'PERCENTAGE') discountAmount = (price * discountValue) / 100;
  else if (form.discountType === 'FIXED') discountAmount = discountValue;
  const finalPrice = Math.max(price - discountAmount, 0);

  function addSize() {
    if (sizeInput && !sizes.includes(sizeInput)) setSizes([...sizes, sizeInput]);
    setSizeInput('');
  }
  function addColor() {
    if (colorInput && !colors.includes(colorInput)) setColors([...colors, colorInput]);
    setColorInput('');
  }

  async function handleDeleteExistingImage(imageId) {
    try {
      await api.deleteProductImage(id, imageId);
      setExistingImages((imgs) => imgs.filter((i) => i.id !== imageId));
      toast.success('Image deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append('sizes', JSON.stringify(sizes));
    formData.append('colors', JSON.stringify(colors));
    newImages.forEach((file) => formData.append('images', file));

    try {
      if (isEdit) {
        await api.updateProduct(id, formData);
        toast.success('Product updated successfully');
      } else {
        await api.createProduct(formData);
        toast.success('Product added successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="card p-6 grid md:grid-cols-2 gap-6">
        <div>
          <label className="label-text">Product Name</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div>
          <label className="label-text">Category</label>
          <select
            className="input-field"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="error-text">{errors.categoryId}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="label-text">Description</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && <p className="error-text">{errors.description}</p>}
        </div>

        <div>
          <label className="label-text">Price (₹)</label>
          <input
            type="number"
            className="input-field"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          {errors.price && <p className="error-text">{errors.price}</p>}
        </div>

        <div>
          <label className="label-text">Stock</label>
          <input
            type="number"
            className="input-field"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          {errors.stock && <p className="error-text">{errors.stock}</p>}
        </div>

        <div>
          <label className="label-text">Discount Type</label>
          <div className="flex gap-4 text-sm">
            {['NONE', 'PERCENTAGE', 'FIXED'].map((t) => (
              <label key={t} className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={form.discountType === t}
                  onChange={() => setForm({ ...form, discountType: t })}
                />
                {t === 'NONE' ? 'No Discount' : t === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
              </label>
            ))}
          </div>
        </div>

        {form.discountType !== 'NONE' && (
          <div>
            <label className="label-text">Discount Value</label>
            <input
              type="number"
              className="input-field"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            />
            {errors.discountValue && <p className="error-text">{errors.discountValue}</p>}
          </div>
        )}

        {price > 0 && (
          <div className="md:col-span-2 bg-brand-50 rounded-lg p-4 text-sm flex gap-6">
            <span>
              Original: <strong>₹{price}</strong>
            </span>
            <span>
              Discount: <strong>₹{discountAmount.toFixed(2)}</strong>
            </span>
            <span>
              Final Price: <strong className="text-brand-700">₹{finalPrice.toFixed(2)}</strong>
            </span>
          </div>
        )}

        <div>
          <label className="label-text">Rating</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="input-field"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text">Status</label>
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div>
          <label className="label-text">Sizes</label>
          <div className="flex gap-2">
            <input className="input-field" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="e.g. M, L, XL" />
            <button type="button" onClick={addSize} className="btn-outline px-3">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {sizes.map((s) => (
              <span key={s} className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {s}
                <button type="button" onClick={() => setSizes(sizes.filter((x) => x !== s))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text">Colors</label>
          <div className="flex gap-2">
            <input className="input-field" value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="e.g. Red, Blue" />
            <button type="button" onClick={addColor} className="btn-outline px-3">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.map((c) => (
              <span key={c} className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {c}
                <button type="button" onClick={() => setColors(colors.filter((x) => x !== c))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {isEdit && existingImages.length > 0 && (
          <div className="md:col-span-2">
            <label className="label-text">Existing Images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img src={assetUrl(img.imageUrl)} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="label-text">{isEdit ? 'Add More Images' : 'Product Images'}</label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setNewImages(Array.from(e.target.files))}
          />
          {newImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {newImages.map((file, i) => (
                <img key={i} src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
