jest.mock('../utils/AppError', () => {
  return class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  };
});

jest.mock('../modules/feriados/feriado.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByData: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  checkDataExists: jest.fn(),
}));

const feriadoRepository = require('../modules/feriados/feriado.repository');
const feriadoService = require('../modules/feriados/feriado.service');

describe('FeriadoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFeriado', () => {
    it('deve criar feriado com data válida', async () => {
      const novoFeriado = {
        data: '2025-12-25',
        descricao: 'Natal'
      };

      feriadoRepository.checkDataExists.mockResolvedValue(false);
      feriadoRepository.create.mockResolvedValue({
        id: 1,
        data: new Date(novoFeriado.data),
        descricao: novoFeriado.descricao,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await feriadoService.createFeriado(novoFeriado);

      expect(result).toBeDefined();
      expect(result.descricao).toBe('Natal');
      expect(feriadoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          descricao: 'Natal'
        })
      );
    });

    it('deve validar data duplicada', async () => {
      const feriadoDuplicado = {
        data: '2025-01-01',
        descricao: 'Ano Novo'
      };

      feriadoRepository.checkDataExists.mockResolvedValue(true);

      await expect(
        feriadoService.createFeriado(feriadoDuplicado)
      ).rejects.toThrow('Já existe um feriado cadastrado para esta data');
    });

    it('deve converter string de data para Date', async () => {
      const novoFeriado = {
        data: '2025-06-15',
        descricao: 'Feriado Teste'
      };

      feriadoRepository.checkDataExists.mockResolvedValue(false);
      feriadoRepository.create.mockImplementation((data) => {
        return Promise.resolve({
          id: 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await feriadoService.createFeriado(novoFeriado);

      const createCall = feriadoRepository.create.mock.calls[0][0];
      expect(createCall.data).toBeInstanceOf(Date);
    });

    it('deve aceitar múltiplos feriados em datas diferentes', async () => {
      const feriado1 = {
        data: '2025-01-01',
        descricao: 'Ano Novo'
      };
      const feriado2 = {
        data: '2025-12-25',
        descricao: 'Natal'
      };

      feriadoRepository.checkDataExists.mockResolvedValue(false);
      feriadoRepository.create
        .mockResolvedValueOnce({ id: 1, ...feriado1 })
        .mockResolvedValueOnce({ id: 2, ...feriado2 });

      const result1 = await feriadoService.createFeriado(feriado1);
      const result2 = await feriadoService.createFeriado(feriado2);

      expect(result1.descricao).toBe('Ano Novo');
      expect(result2.descricao).toBe('Natal');
    });
  });

  describe('updateFeriado', () => {
    it('deve atualizar feriado existente', async () => {
      const feriadoExistente = {
        id: 1,
        data: new Date('2025-01-01'),
        descricao: 'Ano Novo'
      };

      const dadosAtualizacao = {
        descricao: 'Ano Novo - Feriado Nacional'
      };

      feriadoRepository.findById.mockResolvedValue(feriadoExistente);
      feriadoRepository.update.mockResolvedValue({
        ...feriadoExistente,
        ...dadosAtualizacao
      });

      const result = await feriadoService.updateFeriado(1, dadosAtualizacao);

      expect(result.descricao).toBe('Ano Novo - Feriado Nacional');
    });

    it('deve validar data duplicada ao atualizar (excluindo próprio registro)', async () => {
      const feriadoExistente = {
        id: 1,
        data: new Date('2025-01-01'),
        descricao: 'Ano Novo'
      };

      const dadosAtualizacao = {
        data: '2025-12-25'
      };

      feriadoRepository.findById.mockResolvedValue(feriadoExistente);
      feriadoRepository.checkDataExists.mockResolvedValue(true);

      await expect(
        feriadoService.updateFeriado(1, dadosAtualizacao)
      ).rejects.toThrow('Já existe um feriado cadastrado para esta data');
    });

    it('deve permitir atualização sem alterar a data', async () => {
      const feriadoExistente = {
        id: 1,
        data: new Date('2025-01-01'),
        descricao: 'Ano Novo'
      };

      const dadosAtualizacao = {
        descricao: 'Confraternização Universal'
      };

      feriadoRepository.findById.mockResolvedValue(feriadoExistente);
      feriadoRepository.update.mockResolvedValue({
        ...feriadoExistente,
        ...dadosAtualizacao
      });

      const result = await feriadoService.updateFeriado(1, dadosAtualizacao);

      expect(result.descricao).toBe('Confraternização Universal');
      expect(feriadoRepository.checkDataExists).not.toHaveBeenCalled();
    });

    it('deve rejeitar atualização de feriado inexistente', async () => {
      feriadoRepository.findById.mockResolvedValue(null);

      await expect(
        feriadoService.updateFeriado(999, { descricao: 'Teste' })
      ).rejects.toThrow('Feriado não encontrado');
    });
  });

  describe('deleteFeriado', () => {
    it('deve deletar feriado existente', async () => {
      const feriadoExistente = {
        id: 1,
        data: new Date('2025-01-01'),
        descricao: 'Ano Novo'
      };

      feriadoRepository.findById.mockResolvedValue(feriadoExistente);
      feriadoRepository.delete.mockResolvedValue(feriadoExistente);

      const result = await feriadoService.deleteFeriado(1);

      expect(result.message).toBe('Feriado deletado com sucesso');
      expect(feriadoRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve rejeitar deleção de feriado inexistente', async () => {
      feriadoRepository.findById.mockResolvedValue(null);

      await expect(
        feriadoService.deleteFeriado(999)
      ).rejects.toThrow('Feriado não encontrado');
    });
  });

  describe('getAllFeriados', () => {
    it('deve retornar lista de feriados', async () => {
      const mockFeriados = [
        {
          id: 1,
          data: new Date('2025-01-01'),
          descricao: 'Ano Novo'
        },
        {
          id: 2,
          data: new Date('2025-12-25'),
          descricao: 'Natal'
        }
      ];

      feriadoRepository.findAll.mockResolvedValue(mockFeriados);

      const result = await feriadoService.getAllFeriados();

      expect(result).toHaveLength(2);
      expect(result[0].descricao).toBe('Ano Novo');
      expect(result[1].descricao).toBe('Natal');
    });

    it('deve retornar array vazio quando não há feriados', async () => {
      feriadoRepository.findAll.mockResolvedValue([]);

      const result = await feriadoService.getAllFeriados();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getFeriadoById', () => {
    it('deve retornar feriado por ID', async () => {
      const mockFeriado = {
        id: 1,
        data: new Date('2025-01-01'),
        descricao: 'Ano Novo'
      };

      feriadoRepository.findById.mockResolvedValue(mockFeriado);

      const result = await feriadoService.getFeriadoById(1);

      expect(result.id).toBe(1);
      expect(result.descricao).toBe('Ano Novo');
    });

    it('deve rejeitar quando feriado não existe', async () => {
      feriadoRepository.findById.mockResolvedValue(null);

      await expect(
        feriadoService.getFeriadoById(999)
      ).rejects.toThrow('Feriado não encontrado');
    });
  });
});
