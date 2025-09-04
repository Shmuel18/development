const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devices');
const { protect, authorize } = require('../middleware/authMiddleware'); // ייבוא ה-middleware

router.post('/', protect, authorize('editor'), devicesController.createDevice);
router.get('/', devicesController.getAllDevices); // בקשה זו לא דורשת אימות
router.get('/:id', devicesController.getDeviceById); // בקשה זו לא דורשת אימות
router.patch('/:id', protect, authorize('editor'), devicesController.updateDevice); 
router.delete('/:id', protect, authorize('editor'), devicesController.deleteDevice);

module.exports = router;