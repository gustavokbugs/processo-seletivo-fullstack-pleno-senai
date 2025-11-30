const AppError = require('../../utils/AppError');

describe('AppError', () => {
  it('deve criar erro com mensagem e status code', () => {
    const error = new AppError('Erro de teste', 400);
    
    expect(error.message).toBe('Erro de teste');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('deve usar status code padrão 400', () => {
    const error = new AppError('Erro de teste');
    
    expect(error.statusCode).toBe(400);
  });

  it('deve ser uma instância de Error', () => {
    const error = new AppError('Erro de teste', 404);
    
    expect(error instanceof Error).toBe(true);
  });

  it('deve ter stack trace', () => {
    const error = new AppError('Erro de teste', 500);
    
    expect(error.stack).toBeDefined();
  });
});
