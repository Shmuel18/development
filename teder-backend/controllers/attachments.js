const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');
const attachmentModel = require('../models/attachment');
const asyncHandler = require('../utils/asyncHandler');

// הגדרת קבוע עבור שם השדה של הקובץ המצורף
const ATTACHMENT_FIELD_NAME = 'attachments';

// הגדרת קבוע עבור סוגי הקבצים המותרים
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|pdf/;

// הגדרת אחסון הקבצים באמצעות Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // תיקיית היעד לשמירת הקבצים
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // הגבלת גודל קובץ ל-10MB
    fileFilter: (req, file, cb) => {
        // בקרת סוגי קבצים מותרים (תמונות ו-PDF)
        const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
        const extname = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new ApiError(400, 'העלאת קובץ נכשלה. סוגי קבצים מותרים הם תמונות ו-PDF בלבד.'));
        }
    }
}).array(ATTACHMENT_FIELD_NAME);

const createAttachment = async (req, res) => {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'לא נשלחו קבצים להעלאה.');
    }

    // קריאה לפונקציה החדשה במודל שתטפל בטרנזקציה ובשמירה של כל הקבצים
    const attachments = await attachmentModel.createMany(id, req.files);
    
    res.status(201).json({
        message: 'הקבצים הועלו בהצלחה',
        attachments: attachments
    });
};

const deleteAttachment = async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        throw new ApiError(400, 'מזהה קובץ מצורף לא תקין');
    }
    const deletedAttachment = await attachmentModel.remove(id);
    if (!deletedAttachment) {
        throw new ApiError(404, 'הקובץ המצורף לא נמצא');
    }
    res.status(200).json({ message: 'הקובץ המצורף נמחק בהצלחה', attachment: deletedAttachment });
};

module.exports = {
    upload,
    createAttachment: asyncHandler(createAttachment),
    deleteAttachment: asyncHandler(deleteAttachment)
};