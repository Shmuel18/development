const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');
const { protect, authorize } = require('../middleware/authMiddleware');

// יצירת קטגוריה חדשה עם קובץ מצורף
router.post('/', protect, authorize(['editor', 'admin']), categoriesController.upload, categoriesController.createCategory);
// קבלת כל הקטגוריות
router.get('/', categoriesController.getAllCategories);
// קבלת קטגוריה ספציפית
router.get('/:id', categoriesController.getCategoryById);
// עדכון קטגוריה קיימת עם קובץ מצורף
router.patch('/:id', protect, authorize(['editor', 'admin']), categoriesController.upload, categoriesController.updateCategory);
// מחיקת קטגוריה
router.delete('/:id', protect, authorize(['editor', 'admin']), categoriesController.deleteCategory);

module.exports = router;