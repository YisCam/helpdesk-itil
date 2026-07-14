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

const app = express();

// ── Middlewares globales ──────────────────────
app.use(cors());
app.use(express.json());

// ── Rutas ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets/:ticketId/comentarios', comentarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tickets/:ticketId/csat', csatRoutes);
app.use('/api/reportes', reporteRoutes);


// ── Ruta de salud ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor HelpDesk funcionando' });
});



cerrarTicketsResueltos();

// ── Arrancar servidor ─────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});