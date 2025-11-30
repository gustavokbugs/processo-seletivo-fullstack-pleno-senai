const feriadoService = require('./feriado.service');
const catchAsync = require('../../utils/catchAsync');

class FeriadoController {
  getAll = catchAsync(async (req, res) => {
    const feriados = await feriadoService.getAllFeriados();

    res.status(200).json({
      status: 'success',
      data: { feriados }
    });
  });

  getById = catchAsync(async (req, res) => {
    const feriado = await feriadoService.getFeriadoById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { feriado }
    });
  });

  create = catchAsync(async (req, res) => {
    const feriado = await feriadoService.createFeriado(req.body);

    res.status(201).json({
      status: 'success',
      data: { feriado }
    });
  });

  update = catchAsync(async (req, res) => {
    const feriado = await feriadoService.updateFeriado(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { feriado }
    });
  });

  delete = catchAsync(async (req, res) => {
    await feriadoService.deleteFeriado(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}

module.exports = new FeriadoController();
