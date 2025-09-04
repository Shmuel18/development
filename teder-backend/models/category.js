const db = require('../config/db');
const ApiError = require('../utils/ApiError');

// קבלת כל הקטגוריות
const getAll = async (limit, offset, searchTerm) => {
    let baseQuery = `SELECT * FROM categories`;
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
    await db.query('BEGIN'); // התחלת טרנזקציה
    try {
        // מציאת המכשירים שקשורים לקטגוריה
        const devicesResult = await db.query('SELECT id FROM devices WHERE category_id = $1', [id]);
        const deviceIds = devicesResult.rows.map(row => row.id);

        // מחיקת הקבצים המצורפים של המכשירים
        if (deviceIds.length > 0) {
            const placeholders = deviceIds.map((_, i) => `$${i + 1}`).join(',');
            const attachmentsResult = await db.query(`SELECT file_path FROM attachments WHERE device_id IN (${placeholders})`, deviceIds);
            const filePaths = attachmentsResult.rows.map(row => path.join(__dirname, '..', 'uploads', path.basename(row.file_path)));
            
            for (const filePath of filePaths) {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (e) {
                    console.error(`Failed to delete file: ${filePath}`, e);
                }
            }
        }

        // מחיקה של מכשירים, תתי-קטגוריות והקטגוריה
        const deletedDevices = await db.query('DELETE FROM devices WHERE category_id = $1 RETURNING *', [id]);
        const subcategoriesResult = await db.query('DELETE FROM subcategories WHERE category_id = $1 RETURNING *', [id]);
        const categoryResult = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

        // אישור הטרנזקציה
        await db.query('COMMIT');

        // החזרת התוצאות
        return {
            category: categoryResult.rows[0],
            subcategories: subcategoriesResult.rows,
            devices: deletedDevices.rows
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