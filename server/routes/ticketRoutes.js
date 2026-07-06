const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const permisos = require('../middlewares/permisosMiddleware');
const historialController = require('../controllers/historialController');


router.use(authMiddleware);

router.get('/',               ticketController.listar);
router.get('/:id',            ticketController.obtener);
router.post('/',              ticketController.crear);
router.put('/:id',            permisos('admin', 'tecnico', 'superadmin'), ticketController.actualizar);
router.patch('/:id/estado',   permisos('admin', 'tecnico', 'superadmin'), ticketController.actualizarEstado);
router.patch('/:id/asignar',  permisos('admin', 'superadmin'),            ticketController.asignar);
router.patch('/:id/resolver', permisos('admin', 'tecnico', 'superadmin'), ticketController.resolver);
router.get('/:id/historial',  historialController.listar);
router.get('/:id/sla-detalle', ticketController.getSLADetalle);

module.exports = router;