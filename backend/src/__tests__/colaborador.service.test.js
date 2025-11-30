jest.mock('../utils/AppError', () => {
  return class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  };
});

jest.mock('../modules/colaboradores/colaborador.repository');
jest.mock('../modules/usuarios/usuario.repository');
jest.mock('../config/database', () => ({
  colaborador: {
    findUnique: jest.fn(),
  },
}));

const colaboradorService = require('../modules/colaboradores/colaborador.service');

describe('ColaboradorService', () => {
  describe('validateNome', () => {
    it('deve validar nome com formato correto', () => {
      expect(() => {
        colaboradorService.validateNome('João Silva');
      }).not.toThrow();
    });

    it('deve rejeitar nome sem sobrenome', () => {
      expect(() => {
        colaboradorService.validateNome('João');
      }).toThrow('O nome deve conter nome e sobrenome');
    });

    it('deve rejeitar nome sem letra maiúscula', () => {
      expect(() => {
        colaboradorService.validateNome('joão silva');
      }).toThrow('Cada parte do nome deve começar com letra maiúscula');
    });

    it('deve validar nome composto', () => {
      expect(() => {
        colaboradorService.validateNome('João Pedro Da Silva Santos');
      }).not.toThrow();
    });
  });

  describe('validateEmail', () => {
    it('deve validar email correto', () => {
      expect(() => {
        colaboradorService.validateEmail('joao@example.com');
      }).not.toThrow();
    });

    it('deve rejeitar email sem @', () => {
      expect(() => {
        colaboradorService.validateEmail('joaoexample.com');
      }).toThrow('Formato de e-mail inválido');
    });

    it('deve rejeitar email sem domínio', () => {
      expect(() => {
        colaboradorService.validateEmail('joao@');
      }).toThrow('Formato de e-mail inválido');
    });

    it('deve rejeitar email sem extensão', () => {
      expect(() => {
        colaboradorService.validateEmail('joao@example');
      }).toThrow('Formato de e-mail inválido');
    });
  });

  describe('validateCpf', () => {
    it('deve validar CPF com 11 dígitos', () => {
      const cpf = colaboradorService.validateCpf('12345678901');
      expect(cpf).toBe('12345678901');
    });

    it('deve remover formatação do CPF', () => {
      const cpf = colaboradorService.validateCpf('123.456.789-01');
      expect(cpf).toBe('12345678901');
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      expect(() => {
        colaboradorService.validateCpf('123456789');
      }).toThrow('CPF deve ter 11 dígitos');
    });

    it('deve rejeitar CPF com mais de 11 dígitos', () => {
      expect(() => {
        colaboradorService.validateCpf('123456789012');
      }).toThrow('CPF deve ter 11 dígitos');
    });
  });

  describe('calculateTotalHorasSemanais', () => {
    it('deve calcular total de horas corretamente', () => {
      const quadroHorarios = [
        { totalHoras: 8 },
        { totalHoras: 8 },
        { totalHoras: 8 },
        { totalHoras: 8 },
        { totalHoras: 8 }
      ];

      const total = colaboradorService.calculateTotalHorasSemanais(quadroHorarios);
      expect(total).toBe(40);
    });

    it('deve retornar 0 para array vazio', () => {
      const total = colaboradorService.calculateTotalHorasSemanais([]);
      expect(total).toBe(0);
    });

    it('deve somar horas decimais corretamente', () => {
      const quadroHorarios = [
        { totalHoras: 8.5 },
        { totalHoras: 8.5 },
        { totalHoras: 8.5 },
        { totalHoras: 8.5 },
        { totalHoras: 8 }
      ];

      const total = colaboradorService.calculateTotalHorasSemanais(quadroHorarios);
      expect(total).toBe(42);
    });
  });
});
