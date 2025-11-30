const prisma = require('../../config/database');

class FeriadoRepository {
  async findAll() {
    return await prisma.feriado.findMany({
      orderBy: {
        data: 'asc'
      }
    });
  }

  async findById(id) {
    return await prisma.feriado.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async findByData(data) {
    return await prisma.feriado.findUnique({
      where: { data: new Date(data) }
    });
  }

  async create(data) {
    return await prisma.feriado.create({ data });
  }

  async update(id, data) {
    return await prisma.feriado.update({
      where: { id: parseInt(id) },
      data
    });
  }

  async delete(id) {
    return await prisma.feriado.delete({
      where: { id: parseInt(id) }
    });
  }

  async checkDataExists(data, excludeId = null) {
    const where = { data: new Date(data) };
    if (excludeId) {
      where.id = { not: parseInt(excludeId) };
    }
    
    const count = await prisma.feriado.count({ where });
    return count > 0;
  }
}

module.exports = new FeriadoRepository();
