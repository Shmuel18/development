const db = require('../config/db');

// מציאת משתמש לפי שם משתמש
const findByUsername = async (username) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
};

// יצירת משתמש חדש
const create = async (username, passwordHash, role = 'editor') => {
    const result = await db.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
        [username, passwordHash, role]
    );
    return result.rows[0];
};

module.exports = {
    findByUsername,
    create,
};