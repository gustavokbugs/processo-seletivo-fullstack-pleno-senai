const pontoRepository = require('./ponto.repository');
const AppError = require('../../utils/AppError');
const prisma = require('../../config/database');

class PontoService {
  calcularDiferencaHoras(horario1, horario2) {
    const diff = Math.abs(new Date(horario2) - new Date(horario1));
    return diff / (1000 * 60 * 60);
  }

  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  calcularHorasTrabalhadas(registros) {
    let totalMinutos = 0;
    
    for (let i = 0; i < registros.length - 1; i += 2) {
      if (registros[i].tipoRegistro === 'ENTRADA' && registros[i + 1]?.tipoRegistro === 'SAIDA') {
        const diff = new Date(registros[i + 1].horario) - new Date(registros[i].horario);
        totalMinutos += diff / (1000 * 60);
      }
    }
    
    return totalMinutos / 60; 
  }

  async registrarPonto(colaboradorId, data) {
    const colaborador = await prisma.colaborador.findUnique({
      where: { id: parseInt(colaboradorId) },
      include: {
        quadroHorarios: true
      }
    });

    if (!colaborador) {
      throw new AppError('Colaborador não encontrado', 404);
    }

    if (!colaborador.ativo) {
      throw new AppError('Colaborador inativo não pode registrar ponto', 400);
    }

    const hoje = new Date();
    const registrosHoje = await pontoRepository.findByColaboradorAndDate(colaboradorId, hoje);

    let tipoRegistro = 'ENTRADA';
    if (registrosHoje.length > 0) {
      const ultimoRegistro = registrosHoje[registrosHoje.length - 1];
      tipoRegistro = ultimoRegistro.tipoRegistro === 'ENTRADA' ? 'SAIDA' : 'ENTRADA';
    }

    const ultimoRegistro = await pontoRepository.getLastRegistro(colaboradorId);

    const alertas = [];

    if (ultimoRegistro && ultimoRegistro.tipoRegistro === 'SAIDA') {
      const diferenciaHoras = this.calcularDiferencaHoras(ultimoRegistro.horario, hoje);
      if (diferenciaHoras < 11) {
        alertas.push('TAC: Intervalo entre jornadas menor que 11 horas');
      }
    }

    if (tipoRegistro === 'ENTRADA' && registrosHoje.length === 1) {
      const primeiraEntrada = registrosHoje[0];
      if (primeiraEntrada.tipoRegistro === 'SAIDA') {
        const diferenciaHoras = this.calcularDiferencaHoras(primeiraEntrada.horario, hoje);
        if (diferenciaHoras < 1) {
          alertas.push('TAC: Intervalo intrajornada menor que 1 hora');
        }
      }
    }

    if (tipoRegistro === 'SAIDA' && registrosHoje.length >= 3) {
      const registrosComAtual = [...registrosHoje, { horario: hoje, tipoRegistro: 'SAIDA' }];
      const horasTrabalhadas = this.calcularHorasTrabalhadas(registrosComAtual);

      if (horasTrabalhadas > 10) {
        alertas.push('TAC: Jornada de trabalho maior que 10 horas');
      }

      const diasSemana = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
      const diaSemana = diasSemana[hoje.getDay()];
      
      const quadroHorario = colaborador.quadroHorarios.find(q => q.diaSemana === diaSemana);
      
      if (quadroHorario) {
        const horasEsperadas = quadroHorario.totalHoras;
        if (horasTrabalhadas > horasEsperadas) {
          alertas.push(`Horas extras: Trabalhou ${horasTrabalhadas.toFixed(2)}h de ${horasEsperadas}h esperadas`);
        }
      }
    }

    const registro = await pontoRepository.create({
      colaboradorId: parseInt(colaboradorId),
      data: hoje,
      horario: hoje,
      latitude: data.latitude,
      longitude: data.longitude,
      tipoRegistro,
      observacao: alertas.length > 0 ? alertas.join('; ') : null
    });

    return {
      registro,
      alertas
    };
  }

  async getRegistrosByColaborador(colaboradorId, data = null) {
    if (data) {
      return await pontoRepository.findByColaboradorAndDate(colaboradorId, data);
    }
    return await pontoRepository.findByColaborador(colaboradorId);
  }

  async getAllRegistros() {
    return await pontoRepository.findAll();
  }

  async getRegistrosHoje(colaboradorId) {
    const hoje = new Date();
    return await pontoRepository.findByColaboradorAndDate(colaboradorId, hoje);
  }
}

module.exports = new PontoService();
