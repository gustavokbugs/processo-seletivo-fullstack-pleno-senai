const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../config/database', () => ({
  usuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../utils/AppError', () => {
  return class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  };
});

const prisma = require('../config/database');
const authService = require('../modules/auth/auth.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockUser = {
        id: 1,
        usuario: 'admin',
        senha: await bcrypt.hash('12345678', 10),
        tipo: 'ADMINISTRADOR',
        ativo: true,
        colaborador: null
      };

      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await authService.login('admin', '12345678');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('usuario');
      expect(result.usuario.usuario).toBe('admin');
      expect(result.usuario).not.toHaveProperty('senha');
    });

    it('deve rejeitar login com usuário inexistente', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('usuario_inexistente', '12345678')
      ).rejects.toThrow('Usuário ou senha incorretos');
    });

    it('deve rejeitar login com senha incorreta', async () => {
      const mockUser = {
        id: 1,
        usuario: 'admin',
        senha: await bcrypt.hash('12345678', 10),
        tipo: 'ADMINISTRADOR',
        ativo: true
      };

      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.login('admin', 'senha_errada')
      ).rejects.toThrow('Usuário ou senha incorretos');
    });

    it('deve rejeitar login de usuário inativo', async () => {
      const mockUser = {
        id: 1,
        usuario: 'admin',
        senha: await bcrypt.hash('12345678', 10),
        tipo: 'ADMINISTRADOR',
        ativo: false
      };

      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.login('admin', '12345678')
      ).rejects.toThrow('Usuário inativo');
    });

    it('deve retornar token JWT válido', async () => {
      const mockUser = {
        id: 1,
        usuario: 'admin',
        senha: await bcrypt.hash('12345678', 10),
        tipo: 'ADMINISTRADOR',
        ativo: true
      };

      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await authService.login('admin', '12345678');

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.').length).toBe(3);
    });

    it('não deve retornar a senha no objeto usuario', async () => {
      const mockUser = {
        id: 1,
        usuario: 'admin',
        senha: await bcrypt.hash('12345678', 10),
        tipo: 'ADMINISTRADOR',
        ativo: true
      };

      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await authService.login('admin', '12345678');

      expect(result.usuario).not.toHaveProperty('senha');
      expect(result.usuario.usuario).toBe('admin');
      expect(result.usuario.tipo).toBe('ADMINISTRADOR');
    });
  });

  describe('verificarToken', () => {
    it('deve rejeitar token inválido', async () => {
      await expect(
        authService.verificarToken('token_invalido')
      ).rejects.toThrow('Token inválido ou expirado');
    });

    it('deve rejeitar token de usuário inativo', async () => {
      const mockUser = {
        id: 1,
        usuario: 'admin',
        senha: await bcrypt.hash('12345678', 10),
        tipo: 'ADMINISTRADOR',
        ativo: true
      };

      prisma.usuario.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, ativo: false });

      const loginResult = await authService.login('admin', '12345678');

      await expect(
        authService.verificarToken(loginResult.token)
      ).rejects.toThrow('Token inválido');
    });
  });
});
