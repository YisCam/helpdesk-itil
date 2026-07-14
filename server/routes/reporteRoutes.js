const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authMiddleware = require('../middlewares/authMiddleware');
const permisos = require('../middlewares/permisosMiddleware');

router.use(authMiddleware);
router.get('/', permisos('admin', 'tecnico', 'superadmin'), reporteController.getReporte);

module.exports = router;