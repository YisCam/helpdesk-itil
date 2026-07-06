const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const permisos = require('../middlewares/permisosMiddleware');

router.use(authMiddleware);

router.get('/',    permisos('admin', 'tecnico', 'superadmin'), usuarioController.listar);
router.post('/',   permisos('admin', 'superadmin'),            usuarioController.crear);
router.put('/:id', permisos('admin', 'superadmin'),            usuarioController.actualizar);
router.delete('/:id', permisos('admin', 'superadmin'),         usuarioController.desactivar);

module.exports = router;