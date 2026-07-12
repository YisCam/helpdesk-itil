const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const permisos = require('../middlewares/permisosMiddleware');

router.use(authMiddleware);

router.get('/',              permisos('admin', 'tecnico', 'superadmin'), usuarioController.listar);
router.post('/',             permisos('admin', 'superadmin'),            usuarioController.crear);
router.put('/:id',           permisos('admin', 'superadmin'),            usuarioController.actualizar);
router.delete('/:id',        permisos('admin', 'superadmin'),            usuarioController.desactivar);
router.patch('/:id/activar', permisos('admin', 'superadmin'),            usuarioController.activar);
router.patch('/:id/reset-password', permisos('admin', 'superadmin'), usuarioController.resetPassword);

module.exports = router;