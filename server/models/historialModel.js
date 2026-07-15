const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const historialModel = {

  async registrar(ticket_id, empresa_id, usuario_id, accion, detalle) {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO ticket_historial (id, empresa_id, ticket_id, usuario_id, accion, detalle)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, empresa_id, ticket_id, usuario_id, accion, detalle]
    );
  },

  async listar(ticket_id, empresa_id) {
    const [rows] = await pool.query(
      `SELECT h.id, h.accion, h.detalle, h.creado_en,
              u.nombre AS usuario_nombre, u.rol AS usuario_rol
       FROM ticket_historial h
       JOIN usuarios u ON h.usuario_id = u.id
       WHERE h.ticket_id = ? AND h.empresa_id = ?
       ORDER BY h.creado_en ASC`,
      [ticket_id, empresa_id]
    );
    return rows;
  }

};

module.exports = historialModel;