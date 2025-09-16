const Joi = require('joi');
const categoryModel = require('../models/category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// הגדרת סוגי הקבצים המותרים
const ALLOWED_IMAGE_TYPES = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/svg+xml': ['.svg']
};

// הגדרת אחסון הקבצים באמצעות Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/categories/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // הגבלת גודל קובץ ל-5MB
    fileFilter: (req, file, cb) => {
        const fileMimeType = file.mimetype;
        const fileExtname = path.extname(file.originalname).toLowerCase();
        
        const isMimeTypeAllowed = Object.keys(ALLOWED_IMAGE_TYPES).includes(fileMimeType);
        const isExtnameAllowed = isMimeTypeAllowed && ALLOWED_IMAGE_TYPES[fileMimeType].includes(fileExtname);

        if (isMimeTypeAllowed && isExtnameAllowed) {
            return cb(null, true);
        } else {
            cb(new ApiError(400, 'העלאת קובץ נכשלה. סוגי קבצים מותרים הם תמונות בלבד (JPEG, PNG, GIF, SVG).'));
        }
    }
}).single('categoryImage'); // שם השדה בטופס ה-multipart

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

    let imageUrl = null;
    if (req.file) {
        imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    const category = await categoryModel.create(req.body.name, imageUrl);
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
    if (isNaN(categoryId)) {
        throw new ApiError(400, 'מזהה קטגוריה לא תקין');
    }

    const { error } = categorySchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { name } = req.body;
    let imageUrl = req.body.imageUrl || null;

    if (req.file) {
        imageUrl = `/uploads/categories/${req.file.filename}`;
        // מחיקת הקובץ הישן אם קיים
        const oldCategory = await categoryModel.getById(categoryId);
        if (oldCategory && oldCategory.image_url) {
            const oldImagePath = path.join(__dirname, '..', oldCategory.image_url);
            try {
                await fs.unlink(oldImagePath);
            } catch (e) {
                console.error(`Failed to delete old image: ${oldImagePath}`, e);
            }
        }
    }
    
    const updatedCategory = await categoryModel.update(categoryId, name, imageUrl);

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
    if (isNaN(categoryId)) {
        throw new ApiError(400, 'מזהה קטגוריה לא תקין');
    }

    const categoryToDelete = await categoryModel.getById(categoryId);
    if (!categoryToDelete) {
        throw new ApiError(404, 'הקטגוריה לא נמצאה');
    }

    // מחיקת קובץ התמונה המשויך
    if (categoryToDelete.image_url) {
        const imagePath = path.join(__dirname, '..', categoryToDelete.image_url);
        try {
            await fs.unlink(imagePath);
        } catch (e) {
            console.error(`Failed to delete image for category: ${categoryId}`, e);
        }
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
    upload,
    createCategory: asyncHandler(createCategory),
    getAllCategories: asyncHandler(getAllCategories),
    getCategoryById: asyncHandler(getCategoryById),
    updateCategory: asyncHandler(updateCategory),
    deleteCategory: asyncHandler(deleteCategory)
};