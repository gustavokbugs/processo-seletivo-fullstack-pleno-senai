const prisma = require('../../config/database');

class ColaboradorRepository {
  async findAll() {
    return await prisma.colaborador.findMany({
      include: {
        cargo: true,
        funcao: true,
        usuario: {
          select: {
            id: true,
            usuario: true,
            tipo: true,
            ativo: true
          }
        },
        quadroHorarios: {
          orderBy: {
            diaSemana: 'asc'
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
  }

  async findById(id) {
    return await prisma.colaborador.findUnique({
      where: { id: parseInt(id) },
      include: {
        cargo: true,
        funcao: true,
        usuario: {
          select: {
            id: true,
            usuario: true,
            tipo: true,
            ativo: true
          }
        },
        quadroHorarios: {
          orderBy: {
            diaSemana: 'asc'
          }
        }
      }
    });
  }

  async findByCpf(cpf) {
    return await prisma.colaborador.findUnique({
      where: { cpf }
    });
  }

  async findByEmail(email) {
    return await prisma.colaborador.findUnique({
      where: { email }
    });
  }

  async create(data) {
    return await prisma.colaborador.create({
      data,
      include: {
        cargo: true,
        funcao: true,
        usuario: {
          select: {
            id: true,
            usuario: true,
            tipo: true,
            ativo: true
          }
        }
      }
    });
  }

  async update(id, data) {
    return await prisma.colaborador.update({
      where: { id: parseInt(id) },
      data,
      include: {
        cargo: true,
        funcao: true,
        usuario: {
          select: {
            id: true,
            usuario: true,
            tipo: true,
            ativo: true
          }
        }
      }
    });
  }

  async delete(id) {
    return await prisma.colaborador.delete({
      where: { id: parseInt(id) }
    });
  }

  async checkCpfExists(cpf, excludeId = null) {
    const where = { cpf };
    if (excludeId) {
      where.id = { not: parseInt(excludeId) };
    }
    
    const count = await prisma.colaborador.count({ where });
    return count > 0;
  }

  async checkEmailExists(email, excludeId = null) {
    const where = { email };
    if (excludeId) {
      where.id = { not: parseInt(excludeId) };
    }
    
    const count = await prisma.colaborador.count({ where });
    return count > 0;
  }
}

module.exports = new ColaboradorRepository();
