const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { upload } = require('../middleware/upload');

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.listUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

router.get('/admins', adminController.listAdmins);
// Only a Super Admin may create new admins or change admin status
router.post('/create-admin', authorize('SUPER_ADMIN'), upload.single('profileImage'), adminController.createAdmin);
router.put('/admins/:id/status', authorize('SUPER_ADMIN'), adminController.updateAdminStatus);

module.exports = router;
