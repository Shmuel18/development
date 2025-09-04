const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');
const { protect, authorize } = require('../middleware/authMiddleware'); // ייבוא ה-middleware

router.post('/', protect, authorize(['editor', 'admin']), categoriesController.createCategory);
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.patch('/:id', protect, authorize(['editor', 'admin']), categoriesController.updateCategory);
router.delete('/:id', protect, authorize(['editor', 'admin']), categoriesController.deleteCategory);

module.exports = router;