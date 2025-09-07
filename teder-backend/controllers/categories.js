const Joi = require('joi');
const categoryModel = require('../models/category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

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
    // סכימת ולידציה לפרמטרי ה-query
    const querySchema = Joi.object({
        limit: Joi.number().integer().min(1).default(10),
        page: Joi.number().integer().min(1).default(1),
        search: Joi.string().allow('').default(''),
    });

    const { error, value } = querySchema.validate(req.query);

    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { limit, page, search } = value;
    const offset = (page - 1) * limit;

    const result = await categoryModel.getAll(limit, offset, search);

    res.status(200).json({
        total: result.total,
        page,
        limit,
        categories: result.categories
    });
};

// קבלת קטגוריה ספציפית
const getCategoryById = async (req, res) => {
    const categoryId = req.params.id;
    // ולידציה: ודא שה-ID הוא מספר תקין
    if (isNaN(categoryId)) {
        throw new ApiError(400, 'מזהה קטגוריה לא תקין');
    }
    const category = await categoryModel.getById(categoryId);

    if (!category) {
        throw new ApiError(404, 'הקטגוריה לא נמצאה');
    }

    res.status(200).json(category);
};

// עדכון קטגוריה קיימת
const updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    // ולידציה: ודא שה-ID הוא מספר תקין
    if (isNaN(categoryId)) {
        throw new ApiError(400, 'מזהה קטגוריה לא תקין');
    }
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
    // ולידציה: ודא שה-ID הוא מספר תקין
    if (isNaN(categoryId)) {
        throw new ApiError(400, 'מזהה קטגוריה לא תקין');
    }
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