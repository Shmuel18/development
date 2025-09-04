const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// הגדר את מפתח ה-JWT הסודי שלך
const JWT_SECRET = 'your-super-secret-jwt-key'; // ודא שזה אותו מפתח כמו ב-controllers/auth.js

// Middleware לאימות טוקן
const protect = (req, res, next) => {
    // 1. קבלת הטוקן מה-Header של הבקשה
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // קבלת הטוקן מהפורמט 'Bearer TOKEN'
            token = req.headers.authorization.split(' ')[1];

            // 2. אימות הטוקן
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. הצמדת המשתמש לבקשה
            req.user = decoded; // פרטי המשתמש זמינים כעת ב-req.user
            next();
        } catch (error) {
            throw new ApiError(401, 'אימות נכשל, טוקן לא תקין');
        }
    }

    if (!token) {
        throw new ApiError(401, 'אין טוקן אימות, לא מורשה לגשת');
    }
};

// Middleware להרשאות (לפי תפקיד)
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, 'אין לך הרשאה לבצע פעולה זו');
        }
        next();
    };
};

module.exports = { protect, authorize };