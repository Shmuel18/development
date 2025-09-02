const db = require('../config/db');
const ApiError = require('../utils/ApiError');

// קבלת כל תתי-הקטגוריות
const getAll = async () => {
    const result = await db.query('SELECT * FROM subcategories ORDER BY name ASC');
    return result.rows;
};

// קבלת תת-קטגוריה ספציפית לפי ID
const getById = async (id) => {
    const result = await db.query('SELECT * FROM subcategories WHERE id = $1', [id]);
    return result.rows[0];
};

// יצירת תת-קטגוריה חדשה
const create = async (name, categoryId) => {
    const result = await db.query('INSERT INTO subcategories (name, category_id) VALUES ($1, $2) RETURNING *', [name, categoryId]);
    return result.rows[0];
};

// עדכון תת-קטגוריה קיימת
const update = async (id, name, categoryId) => {
    const result = await db.query('UPDATE subcategories SET name = $1, category_id = $2 WHERE id = $3 RETURNING *', [name, categoryId, id]);
    return result.rows[0];
};

// מחיקת תת-קטגוריה
const remove = async (id) => {
    const result = await db.query('DELETE FROM subcategories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};