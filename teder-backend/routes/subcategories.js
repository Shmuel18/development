const express = require('express');
const router = express.Router();
const subcategoriesController = require('../controllers/subcategories');

router.post('/', subcategoriesController.createSubcategory);
router.get('/', subcategoriesController.getAllSubcategories);
router.get('/:id', subcategoriesController.getSubcategoryById);
router.patch('/:id', subcategoriesController.updateSubcategory);
router.delete('/:id', subcategoriesController.deleteSubcategory);

module.exports = router;