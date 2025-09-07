const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');

const getById = async (id) => {
    const result = await db.query('SELECT * FROM attachments WHERE id = $1', [id]);
    return result.rows[0];
};

// פונקציה ליצירת קובץ מצורף יחיד
const create = async (deviceId, fileName, mimeType, filePath) => {
    const query = `
        INSERT INTO attachments (device_id, file_name, mime_type, file_path)
        VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const values = [deviceId, fileName, mimeType, filePath];
    const result = await db.query(query, values);
    return result.rows[0];
};

// פונקציה חדשה ליצירת מספר קבצים בטרנזקציה אחת
const createMany = async (deviceId, files) => {
    await db.query('BEGIN'); // התחלת טרנזקציה
    const insertedAttachments = [];
    try {
        const attachmentPromises = files.map(file => {
            const query = `
                INSERT INTO attachments (device_id, file_name, mime_type, file_path)
                VALUES ($1, $2, $3, $4) RETURNING *
            `;
            const values = [deviceId, file.filename, file.mimetype, file.path];
            return db.query(query, values);
        });

        const results = await Promise.all(attachmentPromises);
        results.forEach(result => insertedAttachments.push(result.rows[0]));

        await db.query('COMMIT'); // אישור הטרנזקציה
        return insertedAttachments;
    } catch (e) {
        await db.query('ROLLBACK'); // ביטול הטרנזקציה במקרה של שגיאה
        // מחיקת הקבצים הפיזיים שהועלו בהצלחה לפני שהטרנזקציה נכשלה
        const deletionPromises = files.map(file => {
            const filePath = path.join(__dirname, '..', 'uploads', file.filename);
            if (fs.existsSync(filePath)) {
                return fs.promises.unlink(filePath);
            }
            return Promise.resolve();
        });
        await Promise.all(deletionPromises);
        throw e; // זריקת השגיאה הלאה לטיפול הבקר
    }
};

const remove = async (id) => {
    await db.query('BEGIN'); // התחלת טרנזקציה
    try {
        // 1. קבלת פרטי הקובץ מה-DB
        const attachment = await getById(id);
        if (!attachment) {
            await db.query('ROLLBACK');
            return null;
        }

        // 2. מחיקת רשומת הקובץ המצורף ממסד הנתונים
        const result = await db.query('DELETE FROM attachments WHERE id = $1 RETURNING *', [id]);
        
        // 3. מחיקת הקובץ הפיזי מהשרת
        const filePath = path.join(__dirname, '..', 'uploads', attachment.file_name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('COMMIT'); // אישור הטרנזקציה
        return result.rows[0];
    } catch (e) {
        console.error(`Failed to delete attachment: ${id}`, e);
        await db.query('ROLLBACK'); // ביטול הטרנזקציה במקרה של שגיאה
        throw e; // זריקת השגיאה הלאה לטיפול הבקר
    }
};

module.exports = {
    getById,
    create,
    createMany, 
    remove,
};