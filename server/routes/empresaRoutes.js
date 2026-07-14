const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const authMiddleware = require('../middlewares/authMiddleware');
const permisos = require('../middlewares/permisosMiddleware');

router.use(authMiddleware);

router.get('/',                permisos('superadmin'), empresaController.listar);
router.post('/',               permisos('superadmin'), empresaController.crear);
router.put('/:id',             permisos('superadmin'), empresaController.actualizar);
router.delete('/:id',          permisos('superadmin'), empresaController.desactivar);
router.patch('/:id/activar',   permisos('superadmin'), empresaController.activar);

module.exports = router;