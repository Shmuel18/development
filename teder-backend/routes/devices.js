const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devices');

router.post('/', devicesController.createDevice);
router.get('/', devicesController.getAllDevices);
router.get('/:id', devicesController.getDeviceById);
router.patch('/:id', devicesController.updateDevice); 
router.delete('/:id', devicesController.deleteDevice);

module.exports = router;