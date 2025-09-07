const express = require('express');
const router = express.Router();
const attachmentsController = require('../controllers/attachments');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post(
    '/devices/:id/attachments',
    protect,
    authorize(['editor', 'admin']),
    attachmentsController.upload,
    attachmentsController.createAttachment
);

router.delete(
    '/devices/:deviceId/attachments/:id', 
    protect,
    authorize(['editor', 'admin']),
    attachmentsController.deleteAttachment
);

module.exports = router;