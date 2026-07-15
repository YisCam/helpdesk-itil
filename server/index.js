const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const csatRoutes = require('./routes/csatRoutes');
const cerrarTicketsResueltos = require('./jobs/cerrarTicketsResueltos');
const reporteRoutes = require('./routes/reporteRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const empresaRoutes = require('./routes/empresaRoutes');

const app = express();

// ── Middlewares globales ──────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use((req, res, next) => {
  if (req.path.includes('/suscribir')) {
    // No parsear body en SSE
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use((req, res, next) => {
  if (req.path.includes('/suscribir')) {
    req.setTimeout(0);
    res.setTimeout(0);
  }
  next();
});

// ── Rutas ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets/:ticketId/comentarios', comentarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tickets/:ticketId/csat', csatRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/empresas', empresaRoutes);


// ── Ruta de salud ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor HelpDesk funcionando' });
});

cerrarTicketsResueltos();

// ── Arrancar servidor ─────────────────────────
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

server.keepAliveTimeout = 0;
server.headersTimeout = 0;