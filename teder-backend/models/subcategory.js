const db = require('../config/db');
const ApiError = require('../utils/ApiError');

// קבלת כל תתי-הקטגוריות
const getAll = async (limit, offset, searchTerm, categoryId) => {
    let baseQuery = `SELECT * FROM subcategories`;
    let countQuery = `SELECT COUNT(*) FROM subcategories`;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // סינון לפי חיפוש טקסטואלי
    if (searchTerm) {
        conditions.push(`name ILIKE $${paramIndex++}`);
        values.push(`%${searchTerm}%`);
    }

    // סינון לפי קטגוריה
    if (categoryId) {
        conditions.push(`category_id = $${paramIndex++}`);
        values.push(categoryId);
    }
    
    // הוספת תנאי ה-WHERE לשאילתות
    if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        baseQuery += whereClause;
        countQuery += whereClause;
    }

    baseQuery += ` ORDER BY name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const totalCountResult = await db.query(countQuery, values.slice(0, values.length - 2));
    const subcategories = await db.query(baseQuery, values);
    
    return {
        total: parseInt(totalCountResult.rows[0].count),
        subcategories: subcategories.rows,
    };
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