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

  async listar(empresa_id, rol) {
    const esProveedora = empresa_id === 'emp-001';
    let query = `
      SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.creado_en,
            e.nombre AS empresa_nombre
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (!esProveedora || rol !== 'superadmin') {
      query += ' AND u.empresa_id = ?';
      params.push(empresa_id);
    }

    query += ' ORDER BY u.creado_en DESC';
    const [rows] = await pool.query(query, params);
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
  },


  async activar(id, empresa_id) {
    await pool.query(
      'UPDATE usuarios SET activo = 1 WHERE id = ? AND empresa_id = ?',
      [id, empresa_id]
    );
  },

  async resetPassword(id, empresa_id, password) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE usuarios SET password_hash = ? WHERE id = ? AND empresa_id = ?',
      [hash, id, empresa_id]
    );
  }

};

module.exports = usuarioModel;