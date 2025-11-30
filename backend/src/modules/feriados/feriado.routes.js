const express = require('express');
const feriadoController = require('./feriado.controller');
const { authenticateToken, restrictTo } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', feriadoController.getAll);
router.get('/:id', feriadoController.getById);

router.use(restrictTo('ADMINISTRADOR'));

router.post('/', feriadoController.create);
router.put('/:id', feriadoController.update);
router.delete('/:id', feriadoController.delete);

module.exports = router;
