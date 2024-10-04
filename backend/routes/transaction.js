const express = require('express');
const router = express.Router();
const {
    initializeDatabase, getTransactions, getStatistics, getBarChart, getPieChart, getCombinedData
} = require('../controllers/transactionController');

router.get('/initialize', initializeDatabase);
router.get('/transactions', getTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChart);
router.get('/pie-chart', getPieChart);
router.get('/combined-data', getCombinedData);

module.exports = router;
