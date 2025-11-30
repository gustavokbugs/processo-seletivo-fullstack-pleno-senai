const usuarioService = require('./usuario.service');
const catchAsync = require('../../utils/catchAsync');

class UsuarioController {
  getAll = catchAsync(async (req, res) => {
    const usuarios = await usuarioService.getAllUsuarios();

    res.status(200).json({
      status: 'success',
      data: { usuarios }
    });
  });

  getById = catchAsync(async (req, res) => {
    const usuario = await usuarioService.getUsuarioById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  });

  create = catchAsync(async (req, res) => {
    const usuario = await usuarioService.createUsuario(req.body);

    res.status(201).json({
      status: 'success',
      data: { usuario }
    });
  });

  update = catchAsync(async (req, res) => {
    const usuario = await usuarioService.updateUsuario(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  });

  delete = catchAsync(async (req, res) => {
    await usuarioService.deleteUsuario(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  checkUsername = catchAsync(async (req, res) => {
    const { usuario } = req.query;
    const excludeId = req.query.excludeId || null;
    
    const result = await usuarioService.checkUsernameAvailable(usuario, excludeId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}

module.exports = new UsuarioController();
