jest.mock('../utils/AppError', () => {
  return class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  };
});

jest.mock('../modules/ponto/ponto.repository');
jest.mock('../config/database', () => ({
  colaborador: {
    findUnique: jest.fn(),
  },
  registroPonto: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

const pontoService = require('../modules/ponto/ponto.service');

describe('PontoService', () => {
  describe('calcularDiferencaHoras', () => {
    it('deve calcular diferença entre dois horários', () => {
      const horario1 = new Date('2024-01-01T08:00:00');
      const horario2 = new Date('2024-01-01T17:00:00');
      
      const diferenca = pontoService.calcularDiferencaHoras(horario1, horario2);
      expect(diferenca).toBe(9);
    });

    it('deve retornar valor positivo independente da ordem', () => {
      const horario1 = new Date('2024-01-01T17:00:00');
      const horario2 = new Date('2024-01-01T08:00:00');
      
      const diferenca = pontoService.calcularDiferencaHoras(horario1, horario2);
      expect(diferenca).toBe(9);
    });

    it('deve calcular diferença com minutos', () => {
      const horario1 = new Date('2024-01-01T08:30:00');
      const horario2 = new Date('2024-01-01T12:45:00');
      
      const diferenca = pontoService.calcularDiferencaHoras(horario1, horario2);
      expect(diferenca).toBe(4.25);
    });
  });

  describe('timeToMinutes', () => {
    it('deve converter horário para minutos', () => {
      const minutos = pontoService.timeToMinutes('08:30');
      expect(minutos).toBe(510); // 8*60 + 30
    });

    it('deve converter meia-noite corretamente', () => {
      const minutos = pontoService.timeToMinutes('00:00');
      expect(minutos).toBe(0);
    });

    it('deve converter 23:59 corretamente', () => {
      const minutos = pontoService.timeToMinutes('23:59');
      expect(minutos).toBe(1439); // 23*60 + 59
    });
  });

  describe('calcularHorasTrabalhadas', () => {
    it('deve calcular horas trabalhadas com um par entrada/saída', () => {
      const registros = [
        {
          tipoRegistro: 'ENTRADA',
          horario: new Date('2024-01-01T08:00:00')
        },
        {
          tipoRegistro: 'SAIDA',
          horario: new Date('2024-01-01T12:00:00')
        }
      ];

      const horas = pontoService.calcularHorasTrabalhadas(registros);
      expect(horas).toBe(4);
    });

    it('deve calcular horas trabalhadas com dois pares entrada/saída', () => {
      const registros = [
        {
          tipoRegistro: 'ENTRADA',
          horario: new Date('2024-01-01T08:00:00')
        },
        {
          tipoRegistro: 'SAIDA',
          horario: new Date('2024-01-01T12:00:00')
        },
        {
          tipoRegistro: 'ENTRADA',
          horario: new Date('2024-01-01T13:00:00')
        },
        {
          tipoRegistro: 'SAIDA',
          horario: new Date('2024-01-01T17:00:00')
        }
      ];

      const horas = pontoService.calcularHorasTrabalhadas(registros);
      expect(horas).toBe(8);
    });

    it('deve retornar 0 para array vazio', () => {
      const horas = pontoService.calcularHorasTrabalhadas([]);
      expect(horas).toBe(0);
    });

    it('deve ignorar entrada sem saída', () => {
      const registros = [
        {
          tipoRegistro: 'ENTRADA',
          horario: new Date('2024-01-01T08:00:00')
        }
      ];

      const horas = pontoService.calcularHorasTrabalhadas(registros);
      expect(horas).toBe(0);
    });
  });
});
