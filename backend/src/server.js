require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const usuarioRoutes = require('./modules/usuarios/usuario.routes');
const colaboradorRoutes = require('./modules/colaboradores/colaborador.routes');
const feriadoRoutes = require('./modules/feriados/feriado.routes');
const pontoRoutes = require('./modules/ponto/ponto.routes');
const cargoRoutes = require('./modules/cargos/cargo.routes');
const funcaoRoutes = require('./modules/funcoes/funcao.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/feriados', feriadoRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/funcoes', funcaoRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Rota ${req.originalUrl} não encontrada`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
