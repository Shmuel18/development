const Joi = require('joi');
const categoryModel = require('../models/category');
const ApiError = require('../utils/ApiError');

// פונקציית עזר לטיפול בשגיאות א-סינכרוניות
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// סכימת ולידציה באמצעות Joi
const categorySchema = Joi.object({
    name: Joi.string().min(2).required(),
});

// יצירת קטגוריה חדשה
const createCategory = async (req, res) => {
    const { error } = categorySchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }
    const category = await categoryModel.create(req.body.name);
    res.status(201).json({
        message: 'הקטגוריה נוספה בהצלחה',
        category
    });
};

// קבלת כל הקטגוריות
const getAllCategories = async (req, res) => {
    const categories = await categoryModel.getAll();
    res.status(200).json(categories);
};

// קבלת קטגוריה ספציפית
const getCategoryById = async (req, res) => {
    const categoryId = req.params.id;
    const category = await categoryModel.getById(categoryId);

    if (!category) {
        throw new ApiError(404, 'הקטגוריה לא נמצאה');
    }

    res.status(200).json(category);
};

// עדכון קטגוריה קיימת
const updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { error } = categorySchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const updatedCategory = await categoryModel.update(categoryId, req.body.name);

    if (!updatedCategory) {
        throw new ApiError(404, 'הקטגוריה לא נמצאה');
    }

    res.status(200).json({
        message: 'הקטגוריה עודכנה בהצלחה',
        category: updatedCategory
    });
};

// מחיקת קטגוריה
const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    const deletedCategory = await categoryModel.remove(categoryId);

    if (!deletedCategory.category) {
        throw new ApiError(404, 'הקטגוריה לא נמצאה');
    }

    res.status(200).json({ 
        message: 'הקטגוריה נמחקה בהצלחה',
        category: deletedCategory.category,
        deletedSubcategories: deletedCategory.subcategories.length
    });
};

module.exports = {
    createCategory: asyncHandler(createCategory),
    getAllCategories: asyncHandler(getAllCategories),
    getCategoryById: asyncHandler(getCategoryById),
    updateCategory: asyncHandler(updateCategory),
    deleteCategory: asyncHandler(deleteCategory)
};