const Joi = require('joi');
const deviceModel = require('../models/device');
const ApiError = require('../utils/ApiError');

// פונקציית עזר לטיפול בשגיאות א-סינכרוניות
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

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
    subcategory_id: Joi.number().integer().required(),
});

// יצירת מכשיר חדש
const createDevice = async (req, res) => {
    const { error } = deviceSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }
    const device = await deviceModel.create(req.body);
    res.status(201).json({
        message: 'המכשיר נוסף בהצלחה',
        device
    });
};

// קבלת כל המכשירים
const getAllDevices = async (req, res) => {
    // סכימת ולידציה לפרמטרי ה-query, כולל dir חדש
    const querySchema = Joi.object({
        limit: Joi.number().integer().min(1).default(10),
        page: Joi.number().integer().min(1).default(1),
        sort: Joi.string().valid('id', 'name', 'manufacturer', 'model').default('id'),
        dir: Joi.string().valid('ASC', 'DESC').default('ASC'), // הוספנו ולידציה לכיוון המיון
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
};

// קבלת מכשיר ספציפי
const getDeviceById = async (req, res) => {
    const deviceId = req.params.id;
    const device = await deviceModel.getById(deviceId);
    
    if (!device) {
        throw new ApiError(404, 'המכשיר לא נמצא');
    }
    
    res.status(200).json(device);
};

// עדכון מכשיר קיים (PATCH)
const updateDevice = async (req, res) => {
    const deviceId = req.params.id;
    
    // סכימת ולידציה עבור עדכון - כל השדות אופציונליים
    const updateSchema = Joi.object({
        name: Joi.string().min(3),
        manufacturer: Joi.string(),
        model: Joi.string(),
        frequency_range: Joi.string().allow(null, ''),
        year: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null),
        security_classification: Joi.string().allow(null, ''),
        description: Joi.string().allow(null, ''),
        category_id: Joi.number().integer(),
        subcategory_id: Joi.number().integer(),
    }).min(1); // לפחות שדה אחד חייב להישלח

    const { error, value } = updateSchema.validate(req.body);
    
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }
    
    const updates = Object.keys(value)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
    
    const values = Object.values(value);
    values.push(deviceId);

    const updatedDevice = await deviceModel.update(deviceId, updates, values);

    if (!updatedDevice) {
        throw new ApiError(404, 'המכשיר לא נמצא');
    }
    
    res.status(200).json({
        message: 'המכשיר עודכן בהצלחה',
        device: updatedDevice
    });
};

// מחיקת מכשיר
const deleteDevice = async (req, res) => {
    const deviceId = req.params.id;
    const deletedDevice = await deviceModel.remove(deviceId);
    
    if (!deletedDevice) {
        throw new ApiError(404, 'המכשיר לא נמצא');
    }
    
    res.status(200).json({ message: 'המכשיר נמחק בהצלחה', device: deletedDevice });
};

module.exports = {
    createDevice: asyncHandler(createDevice),
    getAllDevices: asyncHandler(getAllDevices),
    getDeviceById: asyncHandler(getDeviceById),
    updateDevice: asyncHandler(updateDevice),
    deleteDevice: asyncHandler(deleteDevice)
};