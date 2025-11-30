const colaboradorRepository = require('./colaborador.repository');
const usuarioRepository = require('../usuarios/usuario.repository');
const bcrypt = require('bcrypt');
const AppError = require('../../utils/AppError');
const prisma = require('../../config/database');

class ColaboradorService {
  async generateUsername(nome) {
    const partesNome = nome.trim().split(' ');
    const primeiroNome = partesNome[0].toLowerCase();
    const sobrenome = partesNome[partesNome.length - 1].toLowerCase();
    
    let baseUsername = `${primeiroNome}_${sobrenome}`;
    let username = baseUsername;
    let contador = 1;

    while (await usuarioRepository.checkUsernameExists(username)) {
      username = `${baseUsername}${contador}`;
      contador++;
    }

    return username;
  }

  validateNome(nome) {
    const partes = nome.trim().split(' ');
    
    if (partes.length < 2) {
      throw new AppError('O nome deve conter nome e sobrenome', 400);
    }

    for (const parte of partes) {
      if (parte[0] !== parte[0].toUpperCase()) {
        throw new AppError('Cada parte do nome deve começar com letra maiúscula', 400);
      }
    }

    return true;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Formato de e-mail inválido', 400);
    }
    return true;
  }

  validateCpf(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      throw new AppError('CPF deve ter 11 dígitos', 400);
    }
    return cpfLimpo;
  }

  calculateTotalHorasSemanais(quadroHorarios) {
    let total = 0;
    quadroHorarios.forEach(horario => {
      total += parseFloat(horario.totalHoras);
    });
    return total;
  }

  async getAllColaboradores() {
    return await colaboradorRepository.findAll();
  }

  async getColaboradorById(id) {
    const colaborador = await colaboradorRepository.findById(id);
    
    if (!colaborador) {
      throw new AppError('Colaborador não encontrado', 404);
    }

    return colaborador;
  }

  async createColaborador(data) {
    const { quadroHorarios, ...dadosColaborador } = data;

    dadosColaborador.cpf = this.validateCpf(dadosColaborador.cpf);
    this.validateNome(dadosColaborador.nome);
    this.validateEmail(dadosColaborador.email);

    const cpfExiste = await colaboradorRepository.checkCpfExists(dadosColaborador.cpf);
    if (cpfExiste) {
      throw new AppError('CPF já cadastrado', 409);
    }

    const emailExiste = await colaboradorRepository.checkEmailExists(dadosColaborador.email);
    if (emailExiste) {
      throw new AppError('E-mail já cadastrado', 409);
    }

    if (dadosColaborador.dataRescisao) {
      const dataAdmissao = new Date(dadosColaborador.dataAdmissao);
      const dataRescisao = new Date(dadosColaborador.dataRescisao);
      
      if (dataRescisao < dataAdmissao) {
        throw new AppError('Data de rescisão não pode ser anterior à data de admissão', 400);
      }
    }

    dadosColaborador.ativo = !dadosColaborador.dataRescisao || 
                              new Date(dadosColaborador.dataRescisao) > new Date();

    if (quadroHorarios && quadroHorarios.length > 0) {
      const totalSemanal = this.calculateTotalHorasSemanais(quadroHorarios);
      if (totalSemanal > 44) {
        throw new AppError('Total de horas semanais não pode exceder 44 horas', 400);
      }
    }

    const username = await this.generateUsername(dadosColaborador.nome);

    const resultado = await prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash('12345678', 10);
      
      const usuario = await tx.usuario.create({
        data: {
          usuario: username,
          senha: hashedPassword,
          tipo: 'COLABORADOR',
          ativo: dadosColaborador.ativo
        }
      });

      const colaborador = await tx.colaborador.create({
        data: {
          ...dadosColaborador,
          usuarioId: usuario.id
        },
        include: {
          cargo: true,
          funcao: true,
          usuario: {
            select: {
              id: true,
              usuario: true,
              tipo: true,
              ativo: true
            }
          }
        }
      });

      if (quadroHorarios && quadroHorarios.length > 0) {
        await tx.quadroHorario.createMany({
          data: quadroHorarios.map(horario => ({
            ...horario,
            colaboradorId: colaborador.id
          }))
        });
      }

      return colaborador;
    });

    return resultado;
  }

  async updateColaborador(id, data) {
    const { quadroHorarios, ...dadosColaborador } = data;

    const colaboradorExiste = await colaboradorRepository.findById(id);
    
    if (!colaboradorExiste) {
      throw new AppError('Colaborador não encontrado', 404);
    }

    if (dadosColaborador.nome) {
      this.validateNome(dadosColaborador.nome);
    }

    if (dadosColaborador.email) {
      this.validateEmail(dadosColaborador.email);
      
      const emailExiste = await colaboradorRepository.checkEmailExists(dadosColaborador.email, id);
      if (emailExiste) {
        throw new AppError('E-mail já cadastrado', 409);
      }
    }

    if (dadosColaborador.dataRescisao) {
      const dataAdmissao = dadosColaborador.dataAdmissao || colaboradorExiste.dataAdmissao;
      const dataRescisao = new Date(dadosColaborador.dataRescisao);
      
      if (dataRescisao < new Date(dataAdmissao)) {
        throw new AppError('Data de rescisão não pode ser anterior à data de admissão', 400);
      }
    }

    if ('dataRescisao' in dadosColaborador) {
      dadosColaborador.ativo = !dadosColaborador.dataRescisao || 
                                new Date(dadosColaborador.dataRescisao) > new Date();
    }

    delete dadosColaborador.cpf;

    if (quadroHorarios && quadroHorarios.length > 0) {
      const totalSemanal = this.calculateTotalHorasSemanais(quadroHorarios);
      if (totalSemanal > 44) {
        throw new AppError('Total de horas semanais não pode exceder 44 horas', 400);
      }
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const colaborador = await tx.colaborador.update({
        where: { id: parseInt(id) },
        data: dadosColaborador,
        include: {
          cargo: true,
          funcao: true,
          usuario: {
            select: {
              id: true,
              usuario: true,
              tipo: true,
              ativo: true
            }
          }
        }
      });

      if ('ativo' in dadosColaborador) {
        await tx.usuario.update({
          where: { id: colaborador.usuarioId },
          data: { ativo: dadosColaborador.ativo }
        });
      }

      if (quadroHorarios) {
        await tx.quadroHorario.deleteMany({
          where: { colaboradorId: parseInt(id) }
        });

        if (quadroHorarios.length > 0) {
          await tx.quadroHorario.createMany({
            data: quadroHorarios.map(horario => ({
              ...horario,
              colaboradorId: parseInt(id)
            }))
          });
        }
      }

      return colaborador;
    });

    return resultado;
  }

  async deleteColaborador(id) {
    const colaboradorExiste = await colaboradorRepository.findById(id);
    
    if (!colaboradorExiste) {
      throw new AppError('Colaborador não encontrado', 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.colaborador.delete({
        where: { id: parseInt(id) }
      });

      await tx.usuario.delete({
        where: { id: colaboradorExiste.usuarioId }
      });
    });
    
    return { message: 'Colaborador deletado com sucesso' };
  }

  async checkCpfAvailable(cpf) {
    const cpfLimpo = this.validateCpf(cpf);
    const existe = await colaboradorRepository.checkCpfExists(cpfLimpo);
    
    return {
      disponivel: !existe,
      mensagem: existe ? 'CPF já cadastrado' : 'CPF disponível'
    };
  }

  async generateUsernamePreview(nome) {
    this.validateNome(nome);
    const username = await this.generateUsername(nome);
    
    return { usuario: username };
  }
}

module.exports = new ColaboradorService();
