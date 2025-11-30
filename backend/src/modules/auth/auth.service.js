const prisma = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');

class AuthService {
  async login(usuario, senha) {
    const user = await prisma.usuario.findUnique({
      where: { usuario },
      include: {
        colaborador: {
          include: {
            cargo: true,
            funcao: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('Usuário ou senha incorretos', 401);
    }

    if (!user.ativo) {
      throw new AppError('Usuário inativo', 401);
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      throw new AppError('Usuário ou senha incorretos', 401);
    }

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    delete user.senha;

    return {
      token,
      usuario: user
    };
  }

  async verificarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        include: {
          colaborador: {
            include: {
              cargo: true,
              funcao: true
            }
          }
        }
      });

      if (!usuario || !usuario.ativo) {
        throw new AppError('Token inválido', 401);
      }

      delete usuario.senha;

      return usuario;
    } catch (error) {
      throw new AppError('Token inválido ou expirado', 401);
    }
  }
}

module.exports = new AuthService();
