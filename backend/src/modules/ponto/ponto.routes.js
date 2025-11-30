const express = require('express');
const pontoController = require('./ponto.controller');
const { authenticateToken, restrictTo } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/registrar', pontoController.registrar);

router.get('/meus-registros', pontoController.getMeusRegistros);
router.get('/hoje', pontoController.getRegistrosHoje);

router.get('/', restrictTo('ADMINISTRADOR'), pontoController.getAllRegistros);

module.exports = router;
