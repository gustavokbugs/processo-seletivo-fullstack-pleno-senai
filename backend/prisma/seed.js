const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('==== Iniciando seed... ====');

  const cargos = await Promise.all([
    prisma.cargo.upsert({
      where: { nome: 'Desenvolvedor' },
      update: {},
      create: {
        nome: 'Desenvolvedor',
        descricao: 'Desenvolvedor de Software'
      }
    }),
    prisma.cargo.upsert({
      where: { nome: 'Analista' },
      update: {},
      create: {
        nome: 'Analista',
        descricao: 'Analista de Sistemas'
      }
    }),
    prisma.cargo.upsert({
      where: { nome: 'Gerente' },
      update: {},
      create: {
        nome: 'Gerente',
        descricao: 'Gerente de Projetos'
      }
    }),
    prisma.cargo.upsert({
      where: { nome: 'Coordenador' },
      update: {},
      create: {
        nome: 'Coordenador',
        descricao: 'Coordenador de Equipe'
      }
    })
  ]);

  console.log('-----> Cargos criados');

  const funcoes = await Promise.all([
    prisma.funcao.upsert({
      where: { nome: 'Backend' },
      update: {},
      create: {
        nome: 'Backend',
        descricao: 'Desenvolvimento Backend'
      }
    }),
    prisma.funcao.upsert({
      where: { nome: 'Frontend' },
      update: {},
      create: {
        nome: 'Frontend',
        descricao: 'Desenvolvimento Frontend'
      }
    }),
    prisma.funcao.upsert({
      where: { nome: 'Fullstack' },
      update: {},
      create: {
        nome: 'Fullstack',
        descricao: 'Desenvolvimento Fullstack'
      }
    }),
    prisma.funcao.upsert({
      where: { nome: 'DevOps' },
      update: {},
      create: {
        nome: 'DevOps',
        descricao: 'Infraestrutura e DevOps'
      }
    })
  ]);

  console.log('-----> Funções criadas');

  const hashedPassword = await bcrypt.hash('12345678', 10);
  
  const adminUser = await prisma.usuario.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      usuario: 'admin',
      senha: hashedPassword,
      tipo: 'ADMINISTRADOR',
      ativo: true
    }
  });

  console.log('-----> Usuário admin criado (usuário: admin, senha: 12345678)');

  const feriados = await Promise.all([
    prisma.feriado.upsert({
      where: { data: new Date('2025-01-01') },
      update: {},
      create: {
        data: new Date('2025-01-01'),
        descricao: 'Ano Novo'
      }
    }),
    prisma.feriado.upsert({
      where: { data: new Date('2025-04-21') },
      update: {},
      create: {
        data: new Date('2025-04-21'),
        descricao: 'Tiradentes'
      }
    }),
    prisma.feriado.upsert({
      where: { data: new Date('2025-05-01') },
      update: {},
      create: {
        data: new Date('2025-05-01'),
        descricao: 'Dia do Trabalho'
      }
    }),
    prisma.feriado.upsert({
      where: { data: new Date('2025-09-07') },
      update: {},
      create: {
        data: new Date('2025-09-07'),
        descricao: 'Independência do Brasil'
      }
    }),
    prisma.feriado.upsert({
      where: { data: new Date('2025-12-25') },
      update: {},
      create: {
        data: new Date('2025-12-25'),
        descricao: 'Natal'
      }
    })
  ]);

  console.log('-----> Feriados criados');

  console.log('==== Seed concluído com sucesso! ====');
}

main()
  .catch((e) => {
    console.error(' Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
