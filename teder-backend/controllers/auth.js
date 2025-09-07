const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi'); // הוספת ייבוא של Joi
const userModel = require('../models/user');
const ApiError = require('../utils/ApiError');

// טעינת משתני סביבה
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// פונקציית עזר לטיפול בשגיאות א-סינכרוניות
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// סכימת ולידציה להרשמה והתחברות
const authSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(8).required()
});

// התחברות משתמש
const login = async (req, res) => {
    const { error, value } = authSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }
    const { username, password } = value;

    // 1. מציאת המשתמש
    const user = await userModel.findByUsername(username);
    if (!user) {
        throw new ApiError(401, 'שם משתמש או סיסמה שגויים');
    }

    // 2. השוואת סיסמאות
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new ApiError(401, 'שם משתמש או סיסמה שגויים');
    }

    // 3. יצירת טוקן JWT
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({
        message: 'התחברת בהצלחה',
        token,
        user: { id: user.id, username: user.username, role: user.role }
    });
};

// הרשמת משתמש חדש
const register = async (req, res) => {
    // 1. ולידציה של הקלט
    const { error } = authSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }
    const { username, password } = req.body;

    // 2. בדיקה האם המשתמש כבר קיים
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
        throw new ApiError(409, 'שם המשתמש תפוס. בחר שם אחר.');
    }

    // 3. הצפנת הסיסמה
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 4. יצירת המשתמש החדש במסד הנתונים
    const newUser = await userModel.create(username, passwordHash, 'editor'); // יצירת משתמש עם תפקיד "editor" כברירת מחדל
    
    // 5. יצירת טוקן למשתמש החדש (התחברות אוטומטית)
    const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(201).json({
        message: 'ההרשמה בוצעה בהצלחה',
        token,
        user: { id: newUser.id, username: newUser.username, role: newUser.role }
    });
};

module.exports = {
    login: asyncHandler(login),
    register: asyncHandler(register) // הוספת פונקציית הרישום ל-module.exports
};