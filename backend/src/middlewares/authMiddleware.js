const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/database');

const authenticateToken = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Você não está autenticado. Por favor, faça login.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const usuario = await prisma.usuario.findUnique({
    where: { id: decoded.id },
    include: {
      colaborador: true
    }
  });

  if (!usuario) {
    return next(new AppError('O usuário deste token não existe mais.', 401));
  }

  if (!usuario.ativo) {
    return next(new AppError('Este usuário está inativo.', 401));
  }

  req.user = usuario;
  next();
});

const restrictTo = (...tipos) => {
  return (req, res, next) => {
    if (!tipos.includes(req.user.tipo)) {
      return next(
        new AppError('Você não tem permissão para executar esta ação.', 403)
      );
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  restrictTo
};
