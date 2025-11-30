const authService = require('./auth.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

class AuthController {
  login = catchAsync(async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      throw new AppError('Por favor, forneça usuário e senha', 400);
    }

    const result = await authService.login(usuario, senha);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  verificarToken = catchAsync(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('Token não fornecido', 401);
    }

    const usuario = await authService.verificarToken(token);

    res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  });

  me = catchAsync(async (req, res) => {
    const usuario = { ...req.user };
    delete usuario.senha;

    res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  });
}

module.exports = new AuthController();
