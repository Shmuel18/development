const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');
const attachmentModel = require('../models/attachment');
const asyncHandler = require('../utils/asyncHandler');

// הגדרת קבוע עבור שם השדה של הקובץ המצורף
const ATTACHMENT_FIELD_NAME = 'attachments';

// הגדרת סוגי הקבצים המותרים
const ALLOWED_FILE_TYPES = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

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
        const fileMimeType = file.mimetype;
        const fileExtname = path.extname(file.originalname).toLowerCase();
        
        // בדיקה מורכבת יותר של סוגי הקבצים
        const isMimeTypeAllowed = Object.keys(ALLOWED_FILE_TYPES).includes(fileMimeType);
        const isExtnameAllowed = isMimeTypeAllowed && ALLOWED_FILE_TYPES[fileMimeType].includes(fileExtname);

        if (isMimeTypeAllowed && isExtnameAllowed) {
            return cb(null, true);
        } else {
            cb(new ApiError(400, 'העלאת קובץ נכשלה. סוגי קבצים מותרים הם תמונות, PDF וקבצי Word בלבד.'));
        }
    }
}).array(ATTACHMENT_FIELD_NAME);

const createAttachment = async (req, res) => {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'לא נשלחו קבצים להעלאה.');
    }

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