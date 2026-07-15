const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const empresaModel = {

  async buscarPorSlug(slug) {
    const [rows] = await pool.query(
      'SELECT * FROM empresas WHERE slug = ? AND activo = 1',
      [slug]
    );
    return rows[0];
  },

  async listar() {
    const [rows] = await pool.query(
      `SELECT e.*, 
        (SELECT COUNT(*) FROM usuarios u WHERE u.empresa_id = e.id) AS total_usuarios,
        (SELECT COUNT(*) FROM tickets t WHERE t.empresa_id = e.id) AS total_tickets
       FROM empresas e
       ORDER BY e.creado_en DESC`
    );
    return rows;
  },

  async crear({ nombre, slug, ruc, email, plan }) {
    const id = `emp-${Date.now().toString().slice(-6)}`;
    await pool.query(
      `INSERT INTO empresas (id, nombre, slug, ruc, email, plan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, nombre, slug, ruc, email, plan]
    );

    // Crear SLA por defecto
    await pool.query(
      `INSERT INTO sla_config (id, empresa_id, prioridad, horas_resolucion) VALUES
       (UUID(), ?, 'Critica', 4),
       (UUID(), ?, 'Alta', 8),
       (UUID(), ?, 'Media', 24),
       (UUID(), ?, 'Baja', 72)`,
      [id, id, id, id]
    );

    return { id, nombre, slug, ruc, email, plan };
  },

  async actualizar(id, { nombre, slug, ruc, email, plan }) {
    await pool.query(
      `UPDATE empresas SET nombre = ?, slug = ?, ruc = ?, email = ?, plan = ?
       WHERE id = ?`,
      [nombre, slug, ruc, email, plan, id]
    );
  },

  async desactivar(id) {
    await pool.query('UPDATE empresas SET activo = 0 WHERE id = ?', [id]);
  },

  async activar(id) {
    await pool.query('UPDATE empresas SET activo = 1 WHERE id = ?', [id]);
  }

};

module.exports = empresaModel;