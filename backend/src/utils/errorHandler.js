const AppError = require('./AppError');

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Já existe um registro com este ${err.meta?.target?.[0] || 'valor'}`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Registro não encontrado';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Violação de chave estrangeira - verifique as referências';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  const response = {
    status: 'error',
    statusCode,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  console.error('ERROR 💥', err);

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
