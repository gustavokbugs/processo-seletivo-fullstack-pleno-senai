jest.mock('../utils/AppError', () => {
  return class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  };
});

jest.mock('../modules/usuarios/usuario.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  checkUsernameExists: jest.fn(),
}));

const usuarioRepository = require('../modules/usuarios/usuario.repository');
const usuarioService = require('../modules/usuarios/usuario.service');

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUsuario', () => {
    it('deve criar usuário com dados válidos', async () => {
      const novoUsuario = {
        usuario: 'teste_user',
        senha: '12345678',
        tipo: 'COLABORADOR',
        ativo: true
      };

      usuarioRepository.checkUsernameExists.mockResolvedValue(false);
      usuarioRepository.create.mockResolvedValue({
        id: 1,
        ...novoUsuario,
        senha: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await usuarioService.createUsuario(novoUsuario);

      expect(result).toBeDefined();
      expect(result.usuario).toBe('teste_user');
      expect(result).not.toHaveProperty('senha');
    });

    it('deve validar senha mínima de 8 caracteres', async () => {
      const usuarioInvalido = {
        usuario: 'teste',
        senha: '123',
        tipo: 'COLABORADOR'
      };

      await expect(
        usuarioService.createUsuario(usuarioInvalido)
      ).rejects.toThrow('A senha deve ter no mínimo 8 caracteres');
    });

    it('deve validar username único', async () => {
      const usuarioDuplicado = {
        usuario: 'admin',
        senha: '12345678',
        tipo: 'ADMINISTRADOR'
      };

      usuarioRepository.checkUsernameExists.mockResolvedValue(true);

      await expect(
        usuarioService.createUsuario(usuarioDuplicado)
      ).rejects.toThrow('Nome de usuário já existe');
    });

    it('deve fazer hash da senha antes de salvar', async () => {
      const novoUsuario = {
        usuario: 'teste_hash',
        senha: '12345678',
        tipo: 'COLABORADOR'
      };

      usuarioRepository.checkUsernameExists.mockResolvedValue(false);
      usuarioRepository.create.mockImplementation((data) => {
        return Promise.resolve({
          id: 1,
          usuario: data.usuario,
          senha: data.senha,
          tipo: data.tipo,
          ativo: true
        });
      });

      await usuarioService.createUsuario(novoUsuario);

      const createCall = usuarioRepository.create.mock.calls[0][0];
      expect(createCall.senha).not.toBe('12345678');
      expect(createCall.senha.length).toBeGreaterThan(20);
    });

    it('deve rejeitar senha vazia', async () => {
      const usuarioSemSenha = {
        usuario: 'teste',
        senha: '',
        tipo: 'COLABORADOR'
      };

      await expect(
        usuarioService.createUsuario(usuarioSemSenha)
      ).rejects.toThrow('A senha deve ter no mínimo 8 caracteres');
    });

    it('deve rejeitar senha undefined', async () => {
      const usuarioSemSenha = {
        usuario: 'teste',
        tipo: 'COLABORADOR'
      };

      await expect(
        usuarioService.createUsuario(usuarioSemSenha)
      ).rejects.toThrow('A senha deve ter no mínimo 8 caracteres');
    });
  });

  describe('updateUsuario', () => {
    it('deve atualizar usuário sem alterar username', async () => {
      const usuarioExistente = {
        id: 1,
        usuario: 'teste_user',
        senha: 'hashed_password',
        tipo: 'COLABORADOR',
        ativo: true
      };

      usuarioRepository.findById.mockResolvedValue(usuarioExistente);
      usuarioRepository.update.mockResolvedValue({
        ...usuarioExistente,
        tipo: 'ADMINISTRADOR'
      });

      const dadosAtualizacao = {
        usuario: 'tentativa_alterar_username',
        tipo: 'ADMINISTRADOR'
      };

      await usuarioService.updateUsuario(1, dadosAtualizacao);

      const updateCall = usuarioRepository.update.mock.calls[0][1];
      expect(updateCall).not.toHaveProperty('usuario');
      expect(updateCall.tipo).toBe('ADMINISTRADOR');
    });

    it('deve atualizar senha fazendo novo hash', async () => {
      const usuarioExistente = {
        id: 1,
        usuario: 'teste_user',
        senha: 'hashed_password',
        tipo: 'COLABORADOR',
        ativo: true
      };

      usuarioRepository.findById.mockResolvedValue(usuarioExistente);
      usuarioRepository.update.mockImplementation((id, data) => {
        return Promise.resolve({ ...usuarioExistente, ...data });
      });

      const dadosAtualizacao = {
        senha: 'nova_senha_12345678'
      };

      await usuarioService.updateUsuario(1, dadosAtualizacao);

      const updateCall = usuarioRepository.update.mock.calls[0][1];
      expect(updateCall.senha).not.toBe('nova_senha_12345678');
      expect(updateCall.senha.length).toBeGreaterThan(20);
    });

    it('deve rejeitar atualização de usuário inexistente', async () => {
      usuarioRepository.findById.mockResolvedValue(null);

      await expect(
        usuarioService.updateUsuario(999, { tipo: 'ADMINISTRADOR' })
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('checkUsernameAvailable', () => {
    it('deve retornar disponível para username novo', async () => {
      usuarioRepository.checkUsernameExists.mockResolvedValue(false);

      const result = await usuarioService.checkUsernameAvailable('novo_user');

      expect(result.disponivel).toBe(true);
      expect(result.mensagem).toBe('Nome de usuário disponível');
    });

    it('deve retornar indisponível para username existente', async () => {
      usuarioRepository.checkUsernameExists.mockResolvedValue(true);

      const result = await usuarioService.checkUsernameAvailable('admin');

      expect(result.disponivel).toBe(false);
      expect(result.mensagem).toBe('Nome de usuário já existe');
    });
  });

  describe('deleteUsuario', () => {
    it('deve deletar usuário existente', async () => {
      const usuarioExistente = {
        id: 1,
        usuario: 'teste_user',
        tipo: 'COLABORADOR'
      };

      usuarioRepository.findById.mockResolvedValue(usuarioExistente);
      usuarioRepository.delete.mockResolvedValue(usuarioExistente);

      const result = await usuarioService.deleteUsuario(1);

      expect(result.message).toBe('Usuário deletado com sucesso');
      expect(usuarioRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve rejeitar deleção de usuário inexistente', async () => {
      usuarioRepository.findById.mockResolvedValue(null);

      await expect(
        usuarioService.deleteUsuario(999)
      ).rejects.toThrow('Usuário não encontrado');
    });
  });
});
