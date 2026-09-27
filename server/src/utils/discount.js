/**
 * Calculates discountAmount and finalPrice for a product given its price,
 * discount type and discount value. Enforces business rules from spec section 12.
 */
function calculateDiscount(price, discountType, discountValue) {
  const originalPrice = Number(price);
  let value = Number(discountValue) || 0;

  if (originalPrice < 0) {
    throw new Error('Price cannot be negative');
  }

  let discountAmount = 0;

  if (!discountType || discountType === 'NONE') {
    return { discountAmount: 0, finalPrice: originalPrice, discountValue: 0 };
  }

  if (discountType === 'PERCENTAGE') {
    if (value < 0 || value > 100) {
      throw new Error('Percentage discount must be between 0 and 100');
    }
    discountAmount = (originalPrice * value) / 100;
  } else if (discountType === 'FIXED') {
    if (value < 0) {
      throw new Error('Fixed discount cannot be negative');
    }
    if (value > originalPrice) {
      throw new Error('Fixed discount cannot exceed product price');
    }
    discountAmount = value;
  } else {
    throw new Error('Invalid discount type');
  }

  let finalPrice = originalPrice - discountAmount;
  if (finalPrice < 0) finalPrice = 0;

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
    discountValue: value,
  };
}

module.exports = { calculateDiscount };
