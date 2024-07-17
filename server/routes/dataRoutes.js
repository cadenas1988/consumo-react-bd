const express = require('express');
const router = express.Router();
const { exportData } = require('../controllers/dataController');

router.get('/export', exportData);

module.exports = router;
