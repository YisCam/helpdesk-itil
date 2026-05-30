const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middlewares globales ──────────────────────
app.use(cors());
app.use(express.json());

// ── Ruta de salud ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor HelpDesk funcionando' });
});

// ── Arrancar servidor ─────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});