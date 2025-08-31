const express = require('express');
const app = express();
const port = 3000;
const devicesRouter = require('./routes/devices');
const ApiError = require('./utils/ApiError');

app.use(express.json());

app.use('/api/devices', devicesRouter);

app.get('/', (req, res) => {
    res.send('ברוכים הבאים לבק-אנד של "תדר"!');
});

// Middleware לטיפול בשגיאות
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ error: err.message });
    } else {
        console.error(err.message, err.stack);
        res.status(500).json({ error: 'אירעה שגיאה בשרת' });
    }
});

app.listen(port, () => {
    console.log(`שרת "תדר" פועל בכתובת http://localhost:${port}`);
});