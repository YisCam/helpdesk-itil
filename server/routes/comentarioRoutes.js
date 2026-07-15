const express = require('express');
const router = express.Router({ mergeParams: true });
const comentarioController = require('../controllers/comentarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/',       comentarioController.listar);
router.post('/',      comentarioController.crear);
router.put('/:id', comentarioController.editar);
router.delete('/:id', comentarioController.eliminar);

module.exports = router;