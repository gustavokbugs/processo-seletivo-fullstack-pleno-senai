const express = require('express');
const usuarioController = require('./usuario.controller');
const { authenticateToken, restrictTo } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/check-username', usuarioController.checkUsername);

router.use(restrictTo('ADMINISTRADOR'));

router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;
