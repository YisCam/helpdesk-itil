const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const permisos = require('../middlewares/permisosMiddleware');

router.use(authMiddleware);

router.get('/', permisos('admin', 'tecnico'), usuarioController.listar);
router.post('/', permisos('admin'), usuarioController.crear);
router.put('/:id', permisos('admin'), usuarioController.actualizar);
router.delete('/:id', permisos('admin'), usuarioController.desactivar);

module.exports = router;