const db = require('../config/db');

// קבלת כל המכשירים עם פאגינציה וסינון
const getAll = async (limit, offset, sort, searchTerm) => {
    const query = `
        SELECT * FROM devices
        WHERE name ILIKE $1 OR manufacturer ILIKE $1 OR model ILIKE $1
        ORDER BY ${sort}
        LIMIT $2 OFFSET $3
    `;
    const devices = await db.query(query, [searchTerm, limit, offset]);

    const totalCountResult = await db.query(
        `SELECT COUNT(*) FROM devices WHERE name ILIKE $1 OR manufacturer ILIKE $1 OR model ILIKE $1`,
        [searchTerm]
    );

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
    const result = await db.query(
        `UPDATE devices SET ${updates} WHERE id = $${values.length} RETURNING *`,
        values
    );
    return result.rows[0];
};

// מחיקת מכשיר
const remove = async (id) => {
    const result = await db.query('DELETE FROM devices WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};