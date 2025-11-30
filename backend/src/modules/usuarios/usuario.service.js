const usuarioRepository = require('./usuario.repository');
const bcrypt = require('bcrypt');
const AppError = require('../../utils/AppError');

class UsuarioService {
  async getAllUsuarios() {
    const usuarios = await usuarioRepository.findAll();
    
    return usuarios.map(usuario => {
      const { senha, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    });
  }

  async getUsuarioById(id) {
    const usuario = await usuarioRepository.findById(id);
    
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  async createUsuario(data) {
    if (!data.senha || data.senha.length < 8) {
      throw new AppError('A senha deve ter no mínimo 8 caracteres', 400);
    }

    const usuarioExiste = await usuarioRepository.checkUsernameExists(data.usuario);
    if (usuarioExiste) {
      throw new AppError('Nome de usuário já existe', 409);
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const novoUsuario = await usuarioRepository.create({
      ...data,
      senha: hashedPassword
    });

    const { senha, ...usuarioSemSenha } = novoUsuario;
    return usuarioSemSenha;
  }

  async updateUsuario(id, data) {
    const usuarioExiste = await usuarioRepository.findById(id);
    
    if (!usuarioExiste) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (data.senha) {
      if (data.senha.length < 8) {
        throw new AppError('A senha deve ter no mínimo 8 caracteres', 400);
      }
      data.senha = await bcrypt.hash(data.senha, 10);
    } else {
      delete data.senha;
    }

    delete data.usuario;

    const usuarioAtualizado = await usuarioRepository.update(id, data);

    const { senha, ...usuarioSemSenha } = usuarioAtualizado;
    return usuarioSemSenha;
  }

  async deleteUsuario(id) {
    const usuarioExiste = await usuarioRepository.findById(id);
    
    if (!usuarioExiste) {
      throw new AppError('Usuário não encontrado', 404);
    }

    await usuarioRepository.delete(id);
    
    return { message: 'Usuário deletado com sucesso' };
  }

  async checkUsernameAvailable(usuario, excludeId = null) {
    const existe = await usuarioRepository.checkUsernameExists(usuario, excludeId);
    return {
      disponivel: !existe,
      mensagem: existe ? 'Nome de usuário já existe' : 'Nome de usuário disponível'
    };
  }
}

module.exports = new UsuarioService();
