const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const csatModel = {

  async crear(ticket_id, empresa_id, usuario_id, puntuacion, comentario) {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO csat (id, empresa_id, ticket_id, usuario_id, puntuacion, comentario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, empresa_id, ticket_id, usuario_id, puntuacion, comentario || null]
    );
    return { id, puntuacion, comentario };
  },

  async buscarPorTicket(ticket_id, empresa_id) {
    const [rows] = await pool.query(
      'SELECT * FROM csat WHERE ticket_id = ? AND empresa_id = ?',
      [ticket_id, empresa_id]
    );
    return rows[0];
  }

};

module.exports = csatModel;