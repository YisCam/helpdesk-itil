const pool = require('../db');

const usuarioModel = {

  async buscarPorEmail(email, empresa_id) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND empresa_id = ? AND activo = 1',
      [email, empresa_id]
    );
    return rows[0];
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT id, empresa_id, nombre, email, rol FROM usuarios WHERE id = ? AND activo = 1',
      [id]
    );
    return rows[0];
  }

};

module.exports = usuarioModel;