const pontoService = require('./ponto.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

class PontoController {
  registrar = catchAsync(async (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Latitude e longitude são obrigatórios', 400);
    }

    const usuario = req.user;
    
    if (!usuario.colaborador) {
      throw new AppError('Usuário não possui cadastro de colaborador', 403);
    }

    const result = await pontoService.registrarPonto(usuario.colaborador.id, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    });

    res.status(201).json({
      status: 'success',
      data: result
    });
  });

  getMeusRegistros = catchAsync(async (req, res) => {
    const { data } = req.query;
    const usuario = req.user;

    if (!usuario.colaborador) {
      throw new AppError('Usuário não possui cadastro de colaborador', 403);
    }

    const registros = await pontoService.getRegistrosByColaborador(
      usuario.colaborador.id,
      data || null
    );

    res.status(200).json({
      status: 'success',
      data: { registros }
    });
  });

  getRegistrosHoje = catchAsync(async (req, res) => {
    const usuario = req.user;

    if (!usuario.colaborador) {
      throw new AppError('Usuário não possui cadastro de colaborador', 403);
    }

    const registros = await pontoService.getRegistrosHoje(usuario.colaborador.id);

    res.status(200).json({
      status: 'success',
      data: { registros }
    });
  });

  getAllRegistros = catchAsync(async (req, res) => {
    const registros = await pontoService.getAllRegistros();

    res.status(200).json({
      status: 'success',
      data: { registros }
    });
  });
}

module.exports = new PontoController();
