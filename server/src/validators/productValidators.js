function validateProduct(body, { isUpdate = false } = {}) {
  const errors = {};
  const { name, categoryId, description, price, discountType, discountValue, stock, status } = body;

  if (!isUpdate || name !== undefined) {
    if (!name || !String(name).trim()) errors.name = 'Product name is required';
  }
  if (!isUpdate || categoryId !== undefined) {
    if (!categoryId) errors.categoryId = 'Category is required';
  }
  if (!isUpdate || description !== undefined) {
    if (!description || !String(description).trim()) errors.description = 'Description is required';
  }
  if (!isUpdate || price !== undefined) {
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      errors.price = 'Enter a valid non-negative price';
    }
  }
  if (discountType !== undefined && !['NONE', 'PERCENTAGE', 'FIXED'].includes(discountType)) {
    errors.discountType = 'Discount type must be NONE, PERCENTAGE, or FIXED';
  }
  if (discountValue !== undefined && (isNaN(Number(discountValue)) || Number(discountValue) < 0)) {
    errors.discountValue = 'Discount value cannot be negative';
  }
  if (!isUpdate || stock !== undefined) {
    if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
      errors.stock = 'Enter a valid non-negative stock quantity';
    }
  }
  if (status !== undefined && !['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(status)) {
    errors.status = 'Invalid product status';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateCategory(body) {
  const errors = {};
  if (!body.name || !String(body.name).trim()) {
    errors.name = 'Category name is required';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateProduct, validateCategory };
