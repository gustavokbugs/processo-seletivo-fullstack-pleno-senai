const express = require('express');
const prisma = require('../../config/database');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

router.use(authenticateToken);

router.get('/', catchAsync(async (req, res) => {
  const funcoes = await prisma.funcao.findMany({
    orderBy: { nome: 'asc' }
  });

  res.status(200).json({
    status: 'success',
    data: { funcoes }
  });
}));

module.exports = router;
