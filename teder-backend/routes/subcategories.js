const express = require('express');
const router = express.Router();
const subcategoriesController = require('../controllers/subcategories');
const { protect, authorize } = require('../middleware/authMiddleware'); // ייבוא ה-middleware

router.post('/', protect, authorize('editor'), subcategoriesController.createSubcategory);
router.get('/', subcategoriesController.getAllSubcategories);
router.get('/:id', subcategoriesController.getSubcategoryById);
router.patch('/:id', protect, authorize('editor'), subcategoriesController.updateSubcategory);
router.delete('/:id', protect, authorize('editor'), subcategoriesController.deleteSubcategory);

module.exports = router;