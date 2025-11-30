const feriadoRepository = require('./feriado.repository');
const AppError = require('../../utils/AppError');

class FeriadoService {
  async getAllFeriados() {
    return await feriadoRepository.findAll();
  }

  async getFeriadoById(id) {
    const feriado = await feriadoRepository.findById(id);
    
    if (!feriado) {
      throw new AppError('Feriado não encontrado', 404);
    }

    return feriado;
  }

  async createFeriado(data) {
    const dataExiste = await feriadoRepository.checkDataExists(data.data);
    if (dataExiste) {
      throw new AppError('Já existe um feriado cadastrado para esta data', 409);
    }

    return await feriadoRepository.create({
      data: new Date(data.data),
      descricao: data.descricao
    });
  }

  async updateFeriado(id, data) {
    const feriadoExiste = await feriadoRepository.findById(id);
    
    if (!feriadoExiste) {
      throw new AppError('Feriado não encontrado', 404);
    }

    if (data.data) {
      const dataExiste = await feriadoRepository.checkDataExists(data.data, id);
      if (dataExiste) {
        throw new AppError('Já existe um feriado cadastrado para esta data', 409);
      }
      data.data = new Date(data.data);
    }

    return await feriadoRepository.update(id, data);
  }

  async deleteFeriado(id) {
    const feriadoExiste = await feriadoRepository.findById(id);
    
    if (!feriadoExiste) {
      throw new AppError('Feriado não encontrado', 404);
    }

    await feriadoRepository.delete(id);
    
    return { message: 'Feriado deletado com sucesso' };
  }
}

module.exports = new FeriadoService();
