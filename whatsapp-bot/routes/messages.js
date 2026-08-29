const express = require('express');
const router = express.Router();
const { sendBulkMessages } = require('../controller/messageController');

// GET /api/send-bulk-message  — trigger from browser
router.get('/send-bulk-message', sendBulkMessages);

// POST /api/send-bulk-message — trigger from curl/Postman
router.post('/send-bulk-message', sendBulkMessages);

module.exports = router;
