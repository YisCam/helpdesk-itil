const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/suscribir',     notificacionController.suscribir);
router.get('/',              notificacionController.listar);
router.get('/no-leidos',     notificacionController.contarNoLeidos);
router.patch('/:id/leido',   notificacionController.marcarLeido);
router.patch('/leer-todos',  notificacionController.marcarTodosLeidos);

module.exports = router;