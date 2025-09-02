const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');

router.post('/', categoriesController.createCategory);
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.patch('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;