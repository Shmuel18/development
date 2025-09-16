const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const fs = require('fs').promises; // שינוי: ייבוא אסינכרוני של fs
const path = require('path');
const deviceModel = require('./device');

// קבלת כל הקטגוריות
const getAll = async (limit, offset, searchTerm) => {
    let baseQuery = `SELECT id, name, image_url FROM categories`; // נתיב התמונה נשלף גם כן
    let countQuery = `SELECT COUNT(*) FROM categories`;
    
    const conditions = [];
    const values = [];

    if (searchTerm) {
        conditions.push(`name ILIKE $1`);
        values.push(`%${searchTerm}%`);
    }

    if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        baseQuery += whereClause;
        countQuery += whereClause;
    }

    baseQuery += ` ORDER BY name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const totalCountResult = await db.query(countQuery, values.slice(0, values.length - 2));
    const categories = await db.query(baseQuery, values);
    
    return {
        total: parseInt(totalCountResult.rows[0].count),
        categories: categories.rows,
    };
};

// קבלת קטגוריה ספציפית לפי ID
const getById = async (id) => {
    const result = await db.query('SELECT id, name, image_url FROM categories WHERE id = $1', [id]); // נתיב התמונה נשלף גם כן
    return result.rows[0];
};

// יצירת קטגוריה חדשה
const create = async (name, image_url = null) => { // הוספת image_url כפרמטר
    const result = await db.query('INSERT INTO categories (name, image_url) VALUES ($1, $2) RETURNING *', [name, image_url]);
    return result.rows[0];
};

// עדכון קטגוריה קיימת
const update = async (id, name, image_url = null) => { // הוספת image_url כפרמטר
    const result = await db.query('UPDATE categories SET name = $1, image_url = $2 WHERE id = $3 RETURNING *', [name, image_url, id]);
    return result.rows[0];
};

// מחיקת קטגוריה
const remove = async (id) => {
    await db.query('BEGIN'); // התחלת טרנזקציה
    try {
        // מציאת כל המכשירים שקשורים לקטגוריה
        const devicesResult = await db.query('SELECT id FROM devices WHERE category_id = $1', [id]);
        const deviceIds = devicesResult.rows.map(row => row.id);

        // מחיקת כל המכשירים הקשורים באמצעות המודל שלהם
        const deletionPromises = deviceIds.map(deviceId => deviceModel.remove(deviceId));
        await Promise.all(deletionPromises);
        
        // מחיקת התתי-קטגוריות
        const subcategoriesResult = await db.query('DELETE FROM subcategories WHERE category_id = $1 RETURNING *', [id]);
        
        // מחיקת הקטגוריה עצמה
        const categoryResult = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

        // אישור הטרנזקציה
        await db.query('COMMIT');

        // החזרת התוצאות
        return {
            category: categoryResult.rows[0],
            subcategories: subcategoriesResult.rows,
            deletedDevices: deviceIds.length
        };
    } catch (e) {
        await db.query('ROLLBACK'); // ביטול הטרנזקציה במקרה של שגיאה
        throw e;
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};