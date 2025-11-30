const prisma = require('../../config/database');

class UsuarioRepository {
  async findAll() {
    return await prisma.usuario.findMany({
      include: {
        colaborador: {
          include: {
            cargo: true,
            funcao: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
  }

  async findById(id) {
    return await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        colaborador: {
          include: {
            cargo: true,
            funcao: true
          }
        }
      }
    });
  }

  async findByUsername(usuario) {
    return await prisma.usuario.findUnique({
      where: { usuario }
    });
  }

  async create(data) {
    return await prisma.usuario.create({
      data,
      include: {
        colaborador: true
      }
    });
  }

  async update(id, data) {
    return await prisma.usuario.update({
      where: { id: parseInt(id) },
      data,
      include: {
        colaborador: true
      }
    });
  }

  async delete(id) {
    return await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });
  }

  async checkUsernameExists(usuario, excludeId = null) {
    const where = { usuario };
    if (excludeId) {
      where.id = { not: parseInt(excludeId) };
    }
    
    const count = await prisma.usuario.count({ where });
    return count > 0;
  }
}

module.exports = new UsuarioRepository();
