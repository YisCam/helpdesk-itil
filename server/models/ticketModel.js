const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const slaModel = require('./slaModel');


const ticketModel = {

  async listar(empresa_id, usuario) {
    let query = `
      SELECT t.id, t.codigo, t.titulo, t.categoria, t.prioridad, t.estado,
             t.creado_en, t.sla_limite, t.sla_cumplido,
             u1.nombre AS creado_por_nombre,
             u2.nombre AS asignado_a_nombre
      FROM tickets t
      LEFT JOIN usuarios u1 ON t.creado_por = u1.id
      LEFT JOIN usuarios u2 ON t.asignado_a = u2.id
      WHERE t.empresa_id = ?
    `;
    const params = [empresa_id];

    if (usuario.rol === 'usuario') {
      query += ' AND t.creado_por = ?';
      params.push(usuario.id);
    } else if (usuario.rol === 'tecnico') {
      query += ' AND t.asignado_a = ?';
      params.push(usuario.id);
    }

    query += ' ORDER BY t.creado_en DESC';

    const [rows] = await pool.query(query, params);
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

    // Calcular SLA según prioridad
    const sla = await slaModel.obtenerPorPrioridad(empresa_id, prioridad);
    let sla_limite = null;
    if (sla) {
      sla_limite = new Date(Date.now() + sla.horas_resolucion * 60 * 60 * 1000);
    }

    await pool.query(
      `INSERT INTO tickets (id, empresa_id, codigo, titulo, descripcion, categoria, prioridad, etiquetas, creado_por, sla_limite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, empresa_id, codigo, titulo, descripcion, categoria, prioridad, etiquetas, usuario_id, sla_limite]
    );
    return { id, codigo, titulo, categoria, prioridad, sla_limite };
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
    const [tickets] = await pool.query(
      'SELECT sla_limite FROM tickets WHERE id = ? AND empresa_id = ?',
      [id, empresa_id]
    );
    const ticket = tickets[0];

    let sla_cumplido = null;
    if (ticket && ticket.sla_limite) {
      sla_cumplido = new Date() <= new Date(ticket.sla_limite) ? 1 : 0;
    }

    await pool.query(
      'UPDATE tickets SET resolucion = ?, estado = "Resuelto", sla_cumplido = ? WHERE id = ? AND empresa_id = ?',
      [resolucion, sla_cumplido, id, empresa_id]
    );
  },

  async actualizar(id, empresa_id, { titulo, descripcion, categoria, prioridad, etiquetas }) {
    await pool.query(
      `UPDATE tickets 
       SET titulo = ?, descripcion = ?, categoria = ?, prioridad = ?, etiquetas = ?
       WHERE id = ? AND empresa_id = ?`,
      [titulo, descripcion, categoria, prioridad, etiquetas, id, empresa_id]
    );
  },

  async getSLADetalle(id, empresa_id) {
    const [rows] = await pool.query(
      'SELECT primera_respuesta_en FROM tickets WHERE id = ? AND empresa_id = ?',
      [id, empresa_id]
    );
    return rows[0];
  }
  

};

module.exports = ticketModel;