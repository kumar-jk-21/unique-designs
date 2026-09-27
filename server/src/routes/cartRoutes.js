const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.post('/merge', cartController.mergeGuestCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeCartItem);

module.exports = router;
