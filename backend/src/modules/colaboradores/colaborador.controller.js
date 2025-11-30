const colaboradorService = require('./colaborador.service');
const catchAsync = require('../../utils/catchAsync');

class ColaboradorController {
  getAll = catchAsync(async (req, res) => {
    const colaboradores = await colaboradorService.getAllColaboradores();

    res.status(200).json({
      status: 'success',
      data: { colaboradores }
    });
  });

  getById = catchAsync(async (req, res) => {
    const colaborador = await colaboradorService.getColaboradorById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { colaborador }
    });
  });

  create = catchAsync(async (req, res) => {
    const colaborador = await colaboradorService.createColaborador(req.body);

    res.status(201).json({
      status: 'success',
      data: { colaborador }
    });
  });

  update = catchAsync(async (req, res) => {
    const colaborador = await colaboradorService.updateColaborador(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { colaborador }
    });
  });

  delete = catchAsync(async (req, res) => {
    await colaboradorService.deleteColaborador(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  checkCpf = catchAsync(async (req, res) => {
    const { cpf } = req.query;
    const result = await colaboradorService.checkCpfAvailable(cpf);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  generateUsername = catchAsync(async (req, res) => {
    const { nome } = req.query;
    const result = await colaboradorService.generateUsernamePreview(nome);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}

module.exports = new ColaboradorController();
