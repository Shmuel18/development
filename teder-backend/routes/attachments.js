const express = require('express');
const router = express.Router();
const attachmentsController = require('../controllers/attachments');
const { protect, authorize } = require('../middleware/authMiddleware'); // ייבוא ה-middleware

router.post('/devices/:id/attachments', attachmentsController.upload, attachmentsController.createAttachment);
router.delete('/:id', protect, authorize(['editor', 'admin']), attachmentsController.deleteAttachment);

module.exports = router;