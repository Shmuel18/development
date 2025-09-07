const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const attachmentModel = require('../models/attachment');
const asyncHandler = require('../utils/asyncHandler');

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
}).array('attachments'); // ציפייה למערך של קבצים תחת השם 'attachments'

const createAttachment = async (req, res) => {
    // מזהה המכשיר מתוך הפרמטרים של הנתיב
    const { id } = req.params;

    // ודא שהקובץ הועלה
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'לא נשלחו קבצים להעלאה.');
    }

    // יצירת מערך של Promises עבור כל קובץ שהועלה
    const attachmentPromises = req.files.map(file => {
        const query = `
            INSERT INTO attachments (device_id, file_name, mime_type, file_path)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [id, file.filename, file.mimetype, file.path];
        return db.query(query, values);
    });

    // ביצוע כל ה-Promises במקביל
    const results = await Promise.all(attachmentPromises);

    // חילוץ הנתונים מהתוצאות
    const attachments = results.map(result => result.rows[0]);

    res.status(201).json({
        message: 'הקבצים הועלו בהצלחה',
        attachments: attachments
    });
};

const deleteAttachment = async (req, res) => {
    // יש לוודא שהפונקציה עדיין עובדת עם ה-ID של הקובץ המצורף עצמו
    // ולא עם ה-deviceId מהנתיב המעודכן, כפי שנדרש
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