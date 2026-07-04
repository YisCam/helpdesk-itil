const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/metricas',          dashboardController.getMetricas);
router.get('/tickets-recientes', dashboardController.getTicketsRecientes);
router.get('/sla-prioridad',     dashboardController.getSLAPorPrioridad);

module.exports = router;