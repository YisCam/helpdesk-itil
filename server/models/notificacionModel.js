const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const notificacionModel = {

  async crear(empresa_id, usuario_id, tipo, mensaje) {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO notificaciones (id, empresa_id, usuario_id, tipo, mensaje)
      VALUES (?, ?, ?, ?, ?)`,
      [id, empresa_id, usuario_id, tipo, mensaje]
    );

    // Retornar con creado_en real de la BD
    const [rows] = await pool.query(
      'SELECT * FROM notificaciones WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async listar(usuario_id) {
    const [rows] = await pool.query(
      `SELECT * FROM notificaciones 
       WHERE usuario_id = ?
       ORDER BY creado_en DESC
       LIMIT 20`,
      [usuario_id]
    );
    return rows;
  },

  async marcarLeido(id, usuario_id) {
    await pool.query(
      'UPDATE notificaciones SET leido = 1 WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );
  },

  async marcarTodosLeidos(usuario_id) {
    await pool.query(
      'UPDATE notificaciones SET leido = 1 WHERE usuario_id = ?',
      [usuario_id]
    );
  },

  async contarNoLeidos(usuario_id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leido = 0',
      [usuario_id]
    );
    return rows[0].total;
  }

};

module.exports = notificacionModel;