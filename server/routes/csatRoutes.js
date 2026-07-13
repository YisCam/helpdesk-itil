const express = require('express');
const router = express.Router({ mergeParams: true });
const csatController = require('../controllers/csatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/',  csatController.obtener);
router.post('/', csatController.crear);

module.exports = router;