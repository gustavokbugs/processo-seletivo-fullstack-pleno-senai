const prisma = require('../../config/database');

class PontoRepository {
  async findAll() {
    return await prisma.registroPonto.findMany({
      include: {
        colaborador: {
          include: {
            usuario: {
              select: {
                usuario: true
              }
            }
          }
        }
      },
      orderBy: {
        horario: 'desc'
      }
    });
  }

  async findByColaboradorAndDate(colaboradorId, data) {
    const dataObj = typeof data === 'string' ? new Date(data) : new Date(data);
    
    const inicioDia = new Date(dataObj);
    inicioDia.setHours(0, 0, 0, 0);
    
    const fimDia = new Date(dataObj);
    fimDia.setHours(23, 59, 59, 999);

    return await prisma.registroPonto.findMany({
      where: {
        colaboradorId: parseInt(colaboradorId),
        data: {
          gte: inicioDia,
          lte: fimDia
        }
      },
      orderBy: {
        horario: 'asc'
      }
    });
  }

  async findByColaboradorAndDateRange(colaboradorId, dataInicio, dataFim) {
    return await prisma.registroPonto.findMany({
      where: {
        colaboradorId: parseInt(colaboradorId),
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      orderBy: {
        horario: 'asc'
      }
    });
  }

  async findByColaborador(colaboradorId, limit = 50) {
    return await prisma.registroPonto.findMany({
      where: {
        colaboradorId: parseInt(colaboradorId)
      },
      orderBy: {
        horario: 'desc'
      },
      take: limit
    });
  }

  async create(data) {
    return await prisma.registroPonto.create({
      data,
      include: {
        colaborador: true
      }
    });
  }

  async getLastRegistro(colaboradorId) {
    return await prisma.registroPonto.findFirst({
      where: {
        colaboradorId: parseInt(colaboradorId)
      },
      orderBy: {
        horario: 'desc'
      }
    });
  }
}

module.exports = new PontoRepository();
