const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const port = process.env.PORT || 3000;
const devicesRouter = require('./routes/devices');
const categoriesRouter = require('./routes/categories');
const subcategoriesRouter = require('./routes/subcategories');
const attachmentsRouter = require('./routes/attachments'); // הוספה: ייבוא הראוטר החדש
const ApiError = require('./utils/ApiError');

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use('/api/devices', devicesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api', attachmentsRouter); // הוספה: שימוש בראוטר החדש

app.get('/', (req, res) => {
    res.send('ברוכים הבאים לבק-אנד של "תדר"!');
});

// Middleware לטיפול בנתיבים לא קיימים (404 Not Found)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: "אירעה שגיאה",
        message: 'הנתיב לא נמצא'
    });
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