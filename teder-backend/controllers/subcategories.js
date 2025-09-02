const Joi = require('joi');
const subcategoryModel = require('../models/subcategory');
const ApiError = require('../utils/ApiError');

// פונקציית עזר לטיפול בשגיאות א-סינכרוניות
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// סכימת ולידציה ליצירה ועדכון
const subcategorySchema = Joi.object({
    name: Joi.string().min(2).required(),
    categoryId: Joi.number().integer().required(),
});

// יצירת תת-קטגוריה חדשה
const createSubcategory = async (req, res) => {
    const { error, value } = subcategorySchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }
    const subcategory = await subcategoryModel.create(value.name, value.categoryId);
    res.status(201).json({
        message: 'תת-הקטגוריה נוספה בהצלחה',
        subcategory
    });
};

// קבלת כל תתי-הקטגוריות
const getAllSubcategories = async (req, res) => {
    const subcategories = await subcategoryModel.getAll();
    res.status(200).json(subcategories);
};

// קבלת תת-קטגוריה ספציפית
const getSubcategoryById = async (req, res) => {
    const subcategoryId = req.params.id;
    const subcategory = await subcategoryModel.getById(subcategoryId);

    if (!subcategory) {
        throw new ApiError(404, 'תת-הקטגוריה לא נמצאה');
    }

    res.status(200).json(subcategory);
};

// עדכון תת-קטגוריה קיימת
const updateSubcategory = async (req, res) => {
    const subcategoryId = req.params.id;
    const { error, value } = subcategorySchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const updatedSubcategory = await subcategoryModel.update(subcategoryId, value.name, value.categoryId);

    if (!updatedSubcategory) {
        throw new ApiError(404, 'תת-הקטגוריה לא נמצאה');
    }

    res.status(200).json({
        message: 'תת-הקטגוריה עודכנה בהצלחה',
        subcategory: updatedSubcategory
    });
};

// מחיקת תת-קטגוריה
const deleteSubcategory = async (req, res) => {
    const subcategoryId = req.params.id;
    const deletedSubcategory = await subcategoryModel.remove(subcategoryId);
    
    if (!deletedSubcategory) {
        throw new ApiError(404, 'תת-הקטגוריה לא נמצאה');
    }
    
    res.status(200).json({ message: 'תת-הקטגוריה נמחקה בהצלחה', subcategory: deletedSubcategory });
};

module.exports = {
    createSubcategory: asyncHandler(createSubcategory),
    getAllSubcategories: asyncHandler(getAllSubcategories),
    getSubcategoryById: asyncHandler(getSubcategoryById),
    updateSubcategory: asyncHandler(updateSubcategory),
    deleteSubcategory: asyncHandler(deleteSubcategory)
};