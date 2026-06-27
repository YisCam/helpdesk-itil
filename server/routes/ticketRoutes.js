const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/',           ticketController.listar);
router.get('/:id',        ticketController.obtener);
router.post('/',          ticketController.crear);
router.patch('/:id/estado',   ticketController.actualizarEstado);
router.patch('/:id/asignar',  ticketController.asignar);
router.patch('/:id/resolver', ticketController.resolver);

module.exports = router;