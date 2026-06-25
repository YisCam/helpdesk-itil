const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', usuarioController.listar);
router.post('/', usuarioController.crear);
router.put('/:id', usuarioController.actualizar);
router.delete('/:id', usuarioController.desactivar);

module.exports = router;