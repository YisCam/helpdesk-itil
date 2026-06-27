const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const ticketModel = {

  async listar(empresa_id) {
    const [rows] = await pool.query(
      `SELECT t.id, t.codigo, t.titulo, t.categoria, t.prioridad, t.estado,
              t.creado_en, t.sla_limite, t.sla_cumplido,
              u1.nombre AS creado_por_nombre,
              u2.nombre AS asignado_a_nombre
       FROM tickets t
       LEFT JOIN usuarios u1 ON t.creado_por = u1.id
       LEFT JOIN usuarios u2 ON t.asignado_a = u2.id
       WHERE t.empresa_id = ?
       ORDER BY t.creado_en DESC`,
      [empresa_id]
    );
    return rows;
  },

  async buscarPorId(id, empresa_id) {
    const [rows] = await pool.query(
      `SELECT t.*, 
              u1.nombre AS creado_por_nombre,
              u2.nombre AS asignado_a_nombre
       FROM tickets t
       LEFT JOIN usuarios u1 ON t.creado_por = u1.id
       LEFT JOIN usuarios u2 ON t.asignado_a = u2.id
       WHERE t.id = ? AND t.empresa_id = ?`,
      [id, empresa_id]
    );
    return rows[0];
  },

  async crear(empresa_id, usuario_id, { titulo, descripcion, categoria, prioridad, etiquetas }) {
    const id = uuidv4();
    const codigo = `TK-${Date.now().toString().slice(-6)}`;
    await pool.query(
      `INSERT INTO tickets (id, empresa_id, codigo, titulo, descripcion, categoria, prioridad, etiquetas, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, empresa_id, codigo, titulo, descripcion, categoria, prioridad, etiquetas, usuario_id]
    );
    return { id, codigo, titulo, categoria, prioridad };
  },

  async actualizarEstado(id, empresa_id, estado) {
    await pool.query(
      'UPDATE tickets SET estado = ? WHERE id = ? AND empresa_id = ?',
      [estado, id, empresa_id]
    );
  },

  async asignar(id, empresa_id, asignado_a) {
    await pool.query(
      'UPDATE tickets SET asignado_a = ?, estado = "En Progreso" WHERE id = ? AND empresa_id = ?',
      [asignado_a, id, empresa_id]
    );
  },

  async resolver(id, empresa_id, resolucion) {
    await pool.query(
      'UPDATE tickets SET resolucion = ?, estado = "Resuelto" WHERE id = ? AND empresa_id = ?',
      [resolucion, id, empresa_id]
    );
  }

};

module.exports = ticketModel;