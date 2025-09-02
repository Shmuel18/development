const express = require('express');
const router = express.Router();
const attachmentsController = require('../controllers/attachments');

router.post('/devices/:id/attachments', attachmentsController.upload, attachmentsController.createAttachment);

module.exports = router;