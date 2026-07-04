const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const permisos = require('../middlewares/permisosMiddleware');
const historialController = require('../controllers/historialController');


router.use(authMiddleware);

router.get('/:id/historial', historialController.listar);
router.get('/',            ticketController.listar);
router.get('/:id',         ticketController.obtener);
router.post('/',           ticketController.crear);
router.put('/:id',         permisos('admin', 'tecnico'), ticketController.actualizar);
router.patch('/:id/estado',   permisos('admin', 'tecnico'), ticketController.actualizarEstado);
router.patch('/:id/asignar',  permisos('admin'),            ticketController.asignar);
router.patch('/:id/resolver', permisos('admin', 'tecnico'), ticketController.resolver);


module.exports = router;