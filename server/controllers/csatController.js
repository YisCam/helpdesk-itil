const csatModel = require('../models/csatModel');
const ticketModel = require('../models/ticketModel');
const pool = require('../db');

const csatController = {

  async crear(req, res) {
    try {
      const { puntuacion, comentario } = req.body;
      const ticket_id = req.params.ticketId;

      if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
        return res.status(400).json({ error: 'Puntuación inválida (1-5)' });
      }

      const [tickets] = await pool.query(
        'SELECT * FROM tickets WHERE id = ? AND creado_por = ?',
        [ticket_id, req.usuario.id]
      );
      if (!tickets[0]) return res.status(404).json({ error: 'Ticket no encontrado' });
      if (!['Resuelto', 'Cerrado'].includes(tickets[0].estado)) {
        return res.status(400).json({ error: 'Solo puedes calificar tickets resueltos o cerrados' });
      }

      const existente = await csatModel.buscarPorTicket(ticket_id, tickets[0].empresa_id);
      if (existente) return res.status(409).json({ error: 'Ya calificaste este ticket' });

      const csat = await csatModel.crear(ticket_id, tickets[0].empresa_id, req.usuario.id, puntuacion, comentario);

      // Cerrar ticket automáticamente al calificar
      if (tickets[0].estado === 'Resuelto') {
        await ticketModel.actualizarEstado(ticket_id, tickets[0].empresa_id, 'Cerrado');
      }

      res.status(201).json(csat);
    } catch (error) {
      console.error('Error al crear CSAT:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async obtener(req, res) {
    try {
      const ticket_id = req.params.ticketId;
      const [tickets] = await pool.query('SELECT empresa_id FROM tickets WHERE id = ?', [ticket_id]);
      if (!tickets[0]) return res.status(404).json({ error: 'Ticket no encontrado' });

      const csat = await csatModel.buscarPorTicket(ticket_id, tickets[0].empresa_id);
      res.json(csat || null);
    } catch (error) {
      console.error('Error al obtener CSAT:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = csatController;