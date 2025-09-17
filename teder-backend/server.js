const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const port = process.env.PORT || 3000;
const devicesRouter = require('./routes/devices');
const categoriesRouter = require('./routes/categories');
const subcategoriesRouter = require('./routes/subcategories');
const attachmentsRouter = require('./routes/attachments');
const authRouter = require('./routes/auth');
const ApiError = require('./utils/ApiError');

// הגדרת Rate Limiter למניעת התקפות Brute-Force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 800,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(cors());
// הסרת helmet גלובלית כדי להשתמש בהגדרה ספציפית
// app.use(helmet()); 
app.use(limiter);
app.use(morgan('dev'));

// הגדרת נתיבים סטטיים לקבצים המצורפים
// שינוי: הגדרת helmet ספציפית לתיקיית uploads
app.use('/uploads', helmet({
  crossOriginResourcePolicy: false, // מאפשר טעינת משאבים ממקורות שונים
}), express.static(path.join(__dirname, 'uploads')));

app.use('/uploads/categories', express.static(path.join(__dirname, 'uploads/categories')));


app.use('/api/devices', devicesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api', attachmentsRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.send('ברוכים הבאים לבק-אנד של "תדר"!');
});

// Middleware לטיפול בנתיבים לא קיימים (404 Not Found)
app.use((req, res, next) => {
    next(new ApiError(404, 'הנתיב לא נמצא'));
});

// Middleware לטיפול בשגיאות כלליות
app.use((err, req, res, next) => {
    // אם השגיאה מגיעה מוולידציה של Joi
    if (err.isJoi) {
        return res.status(400).json({
            success: false,
            error: "שגיאת ולידציה",
            message: err.details[0].message
        });
    }

    // אם השגיאה מגיעה מטיפוס ApiError שהגדרנו
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.name || 'אירעה שגיאה',
            message: err.message
        });
    }

    // טיפול בשגיאות שרת פנימיות
    console.error(err.message, err.stack);
    res.status(500).json({
        success: false,
        error: "אירעה שגיאה בשרת",
        message: 'אירעה שגיאה פנימית בשרת. אנא נסה שנית מאוחר יותר.'
    });
});

app.listen(port, () => {
    console.log(`שרת "תדר" פועל בכתובת http://localhost:${port}`);
});