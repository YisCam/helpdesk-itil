const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

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
      'SELECT id, empresa_id, nombre, email, rol, activo, creado_en FROM usuarios WHERE id = ? AND activo = 1',
      [id]
    );
    return rows[0];
  },

  async listar(empresa_id) {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, activo, creado_en FROM usuarios WHERE empresa_id = ? ORDER BY creado_en DESC',
      [empresa_id]
    );
    return rows;
  },

  async crear(empresa_id, { nombre, email, password, rol }) {
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (id, empresa_id, nombre, email, password_hash, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [id, empresa_id, nombre, email, password_hash, rol]
    );
    return { id, nombre, email, rol };
  },

  async actualizar(id, empresa_id, { nombre, email, rol }) {
    await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ? AND empresa_id = ?',
      [nombre, email, rol, id, empresa_id]
    );
    return { id, nombre, email, rol };
  },

  async desactivar(id, empresa_id) {
    await pool.query(
      'UPDATE usuarios SET activo = 0 WHERE id = ? AND empresa_id = ?',
      [id, empresa_id]
    );
  }

};

module.exports = usuarioModel;