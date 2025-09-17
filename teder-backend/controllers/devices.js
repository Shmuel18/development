const Joi = require('joi');
const deviceModel = require('../models/device');
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
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `device-image-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadDeviceImage = multer({
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
}).single('primaryImage'); // שם השדה בטופס ה-multipart

// סכימת ולידציה ליצירה ועדכון
const deviceSchema = Joi.object({
    name: Joi.string().min(3).required(),
    manufacturer: Joi.string().required(),
    model: Joi.string().required(),
    frequency_range: Joi.string().allow(null, ''),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null),
    security_classification: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    category_id: Joi.number().integer().required(),
    subcategory_id: Joi.number().integer().allow(null).optional(), 
    image_url: Joi.string().allow(null, '').optional(),
});

// יצירת מכשיר חדש
const createDevice = asyncHandler(async (req, res) => {
    // השתמש ב-req.body כי Multer כבר עיבד את הפורם-דאטה
    const { error } = deviceSchema.validate(req.body);
    if (error) {
        // מחיקת קובץ שהועלה אם יש שגיאת ולידציה
        if (req.file) {
            await fs.unlink(req.file.path);
        }
        throw new ApiError(400, error.details[0].message);
    }

    // ודא שהנתיב לתמונה הוא יחסי
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const deviceData = { ...req.body, image_url: imageUrl };

    const device = await deviceModel.create(deviceData);
    res.status(201).json({
        message: 'המכשיר נוסף בהצלחה',
        device
    });
});

// קבלת כל המכשירים
const getAllDevices = asyncHandler(async (req, res) => {
    // סכימת ולידציה לפרמטרי ה-query, כולל dir חדש
    const querySchema = Joi.object({
        limit: Joi.number().integer().min(1).default(10),
        page: Joi.number().integer().min(1).default(1),
        sort: Joi.string().valid('id', 'name', 'manufacturer', 'model').default('id'),
        dir: Joi.string().valid('ASC', 'DESC').default('ASC'),
        search: Joi.string().allow(''),
        categoryId: Joi.number().integer(),
        subcategoryId: Joi.number().integer(),
    });

    const { error, value } = querySchema.validate(req.query);

    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { limit, page, sort, dir, search, categoryId, subcategoryId } = value;
    const offset = (page - 1) * limit;

    const result = await deviceModel.getAll(limit, offset, sort, dir, search, categoryId, subcategoryId);
    
    res.status(200).json({
        total: result.total,
        page,
        limit,
        devices: result.devices
    });
});

// קבלת מכשיר ספציפי
const getDeviceById = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    // ולידציה: ודא שה-ID הוא מספר תקין
    if (isNaN(deviceId)) {
        throw new ApiError(400, 'מזהה מכשיר לא תקין');
    }
    const device = await deviceModel.getById(deviceId);
    
    if (!device) {
        throw new ApiError(404, 'המכשיר לא נמצא');
    }
    
    res.status(200).json(device);
});

// עדכון מכשיר קיים (PATCH)
const updateDevice = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    if (isNaN(deviceId)) {
        if (req.file) { await fs.unlink(req.file.path); }
        throw new ApiError(400, 'מזהה מכשיר לא תקין');
    }

    const updateSchema = Joi.object({
        name: Joi.string().min(3),
        manufacturer: Joi.string(),
        model: Joi.string(),
        frequency_range: Joi.string().allow(null, ''),
        year: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null),
        security_classification: Joi.string().allow(null, ''),
        description: Joi.string().allow(null, ''),
        category_id: Joi.number().integer(),
        subcategory_id: Joi.number().integer().allow(null).optional(),
        image_url: Joi.string().allow(null, '').optional(),
    }).min(1);

    // אם הועלה קובץ חדש, יש לעדכן את image_url
    if (req.file) {
        const oldDevice = await deviceModel.getById(deviceId);
        if (oldDevice && oldDevice.image_url) {
            const oldImagePath = path.join(__dirname, '..', oldDevice.image_url);
            try {
                await fs.unlink(oldImagePath);
            } catch (e) {
                console.error(`Failed to delete old image: ${oldImagePath}`, e);
            }
        }
        req.body.image_url = `/uploads/${req.file.filename}`;
    }
    
    const { error, value } = updateSchema.validate(req.body);
    
    if (error) {
        if (req.file) { await fs.unlink(req.file.path); }
        throw new ApiError(400, error.details[0].message);
    }
    
    const updates = [];
    const values = [];
    let index = 1;
    for (const [key, val] of Object.entries(value)) {
        updates.push(`${key} = $${index}`);
        values.push(val);
        index++;
    }

    const updatedDevice = await deviceModel.update(deviceId, updates.join(', '), values);

    if (!updatedDevice) {
        throw new ApiError(404, 'המכשיר לא נמצא');
    }
    
    res.status(200).json({
        message: 'המכשיר עודכן בהצלחה',
        device: updatedDevice
    });
});


// מחיקת מכשיר
const deleteDevice = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    // ולידציה: ודא שה-ID הוא מספר תקין
    if (isNaN(deviceId)) {
        throw new ApiError(400, 'מזהה מכשיר לא תקין');
    }
    const deletedDevice = await deviceModel.remove(deviceId);
    
    if (!deletedDevice) {
        throw new ApiError(404, 'המכשיר לא נמצא');
    }
    
    res.status(200).json({ message: 'המכשיר נמחק בהצלחה', device: deletedDevice });
});

module.exports = {
    uploadDeviceImage, // ייצוא ה-middleware החדש
    createDevice,
    getAllDevices,
    getDeviceById,
    updateDevice,
    deleteDevice
};