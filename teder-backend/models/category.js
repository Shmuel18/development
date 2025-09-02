const db = require('../config/db');
const ApiError = require('../utils/ApiError');

// קבלת כל הקטגוריות
const getAll = async () => {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
};

// קבלת קטגוריה ספציפית לפי ID
const getById = async (id) => {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
};

// יצירת קטגוריה חדשה
const create = async (name) => {
    const result = await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    return result.rows[0];
};

// עדכון קטגוריה קיימת
const update = async (id, name) => {
    const result = await db.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    return result.rows[0];
};

// מחיקת קטגוריה
const remove = async (id) => {
    // בצע מחיקה גם של תתי-הקטגוריות המשויכות אליה
    const subcategoriesResult = await db.query('DELETE FROM subcategories WHERE category_id = $1 RETURNING *', [id]);
    const categoryResult = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    
    return {
        category: categoryResult.rows[0],
        subcategories: subcategoriesResult.rows
    };
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};