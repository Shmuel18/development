const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const attachmentModel = require('./attachment'); // ייבוא המודל החדש

// קבלת כל המכשירים עם פאגינציה וסינון
const getAll = async (limit, offset, sort, dir, searchTerm, categoryId, subcategoryId) => {
    const allowedSortColumns = {
        'id': 'id',
        'name': 'name',
        'manufacturer': 'manufacturer',
        'model': 'model'
    };
    const sortField = allowedSortColumns[sort] || 'id';
    const sortDirection = dir === 'DESC' ? 'DESC' : 'ASC';

    let baseQuery = `SELECT * FROM devices`;
    let countQuery = `SELECT COUNT(*) FROM devices`;
    
    const conditions = [];
    const values = [];

    // סינון לפי חיפוש טקסטואלי
    if (searchTerm) {
        conditions.push(`(name ILIKE $${values.length + 1} OR manufacturer ILIKE $${values.length + 1} OR model ILIKE $${values.length + 1})`);
        values.push(`%${searchTerm}%`);
    }

    // סינון לפי קטגוריה
    if (categoryId) {
        conditions.push(`category_id = $${values.length + 1}`);
        values.push(categoryId);
    }

    // סינון לפי תת-קטגוריה
    if (subcategoryId) {
        conditions.push(`subcategory_id = $${values.length + 1}`);
        values.push(subcategoryId);
    }
    
    // הוספת תנאי ה-WHERE לשאילתות
    if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        baseQuery += whereClause;
        countQuery += whereClause;
    }

    // הוספת מיון, לימיט ואופסט לשאילתה הראשית
    baseQuery += ` ORDER BY ${sortField} ${sortDirection} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    // ביצוע השאילתות
    const totalCountResult = await db.query(countQuery, values.slice(0, values.length - 2));
    const devices = await db.query(baseQuery, values);
    
    return {
        total: parseInt(totalCountResult.rows[0].count),
        devices: devices.rows,
    };
};

// קבלת מכשיר ספציפי לפי ID
const getById = async (id) => {
    const result = await db.query('SELECT * FROM devices WHERE id = $1', [id]);
    return result.rows[0];
};

// יצירת מכשיר חדש
const create = async (deviceData) => {
    const { name, manufacturer, model, frequency_range, year, security_classification, description, category_id, subcategory_id } = deviceData;
    const result = await db.query(
        `INSERT INTO devices (name, manufacturer, model, frequency_range, year, security_classification, description, category_id, subcategory_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [name, manufacturer, model, frequency_range, year, security_classification, description, category_id, subcategory_id]
    );
    return result.rows[0];
};

// עדכון מכשיר קיים
const update = async (id, updates, values) => {
    // הוספת ה-id למערך הערכים
    const finalValues = [...values, id];
    const result = await db.query(
        `UPDATE devices SET ${updates} WHERE id = $${finalValues.length} RETURNING *`,
        finalValues
    );
    return result.rows[0];
};

// מחיקת מכשיר
const remove = async (id) => {
    await db.query('BEGIN'); // התחלת טרנזקציה
    try {
        // 1. מציאת כל הקבצים המצורפים המשויכים למכשיר
        const attachmentsResult = await db.query('SELECT * FROM attachments WHERE device_id = $1', [id]);
        const attachments = attachmentsResult.rows;

        // 2. מחיקת הקבצים הפיזיים ורשומות ה-DB באמצעות מודל attachments
        const deletionPromises = attachments.map(attachment => attachmentModel.remove(attachment.id));
        await Promise.all(deletionPromises);

        // 3. מחיקת רשומת המכשיר
        const deviceResult = await db.query('DELETE FROM devices WHERE id = $1 RETURNING *', [id]);
        
        await db.query('COMMIT'); // אישור הטרנזקציה
        
        return deviceResult.rows[0];
    } catch (error) {
        await db.query('ROLLBACK'); // ביטול הטרנזקציה במקרה של שגיאה
        throw error;
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};