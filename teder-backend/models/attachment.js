const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');

const getById = async (id) => {
    const result = await db.query('SELECT * FROM attachments WHERE id = $1', [id]);
    return result.rows[0];
};

const remove = async (id) => {
    // 1. קבלת פרטי הקובץ מה-DB
    const attachment = await getById(id);
    if (!attachment) {
        return null;
    }

    // 2. מחיקת הקובץ הפיזי מהשרת
    const filePath = path.join(__dirname, '..', 'uploads', attachment.file_name);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (e) {
        console.error(`Failed to delete file: ${filePath}`, e);
        // נמשיך למחיקת הרשומה ב-DB גם אם מחיקת הקובץ הפיזי נכשלה.
        // אנו נשאיר הודעת שגיאה ב-log כדי שנדע על הבעיה.
    }

    // 3. מחיקת רשומת הקובץ המצורף ממסד הנתונים
    const result = await db.query('DELETE FROM attachments WHERE id = $1 RETURNING *', [id]);
    
    return result.rows[0];
};

module.exports = {
    getById,
    remove,
};