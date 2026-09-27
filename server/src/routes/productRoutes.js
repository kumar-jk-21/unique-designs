const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { upload } = require('../middleware/upload');

// Public (but recognizes a logged-in admin to show all statuses)
router.get('/', optionalAuthenticate, productController.listProducts);
router.get('/:id', productController.getProductById);

// Admin/Super Admin only
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.array('images', 10),
  productController.createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.array('images', 10),
  productController.updateProduct
);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.deleteProduct);
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  productController.deleteProductImage
);

module.exports = router;
