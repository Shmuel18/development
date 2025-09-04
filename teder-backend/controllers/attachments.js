const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');

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
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new ApiError(400, 'העלאת קובץ נכשלה. סוגי קבצים מותרים הם תמונות ו-PDF בלבד.'));
        }
    }
}).array('attachments'); // ציפייה למערך של קבצים תחת השם 'attachments'

// פונקציית עזר לטיפול בשגיאות א-סינכרוניות
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

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

module.exports = {
    upload,
    createAttachment: asyncHandler(createAttachment)
};