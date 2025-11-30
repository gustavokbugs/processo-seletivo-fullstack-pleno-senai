const express = require('express');
const colaboradorController = require('./colaborador.controller');
const { authenticateToken, restrictTo } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/check-cpf', colaboradorController.checkCpf);
router.get('/generate-username', colaboradorController.generateUsername);

router.use(restrictTo('ADMINISTRADOR'));

router.get('/', colaboradorController.getAll);
router.get('/:id', colaboradorController.getById);
router.post('/', colaboradorController.create);
router.put('/:id', colaboradorController.update);
router.delete('/:id', colaboradorController.delete);

module.exports = router;
