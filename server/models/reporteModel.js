const pool = require('../db');

const reporteModel = {

  async getTicketsPorEstado(empresa_id, esProveedora, desde, hasta) {
    const filtroEmpresa = esProveedora ? '' : 'AND t.empresa_id = ?';
    const params = esProveedora ? [desde, hasta] : [empresa_id, desde, hasta];

    const [rows] = await pool.query(
      `SELECT t.estado, COUNT(*) AS total
       FROM tickets t
       WHERE t.creado_en BETWEEN ? AND ?
       ${filtroEmpresa}
       GROUP BY t.estado
       ORDER BY FIELD(t.estado, 'Abierto', 'En Progreso', 'Resuelto', 'Cerrado')`,
      esProveedora ? [desde, hasta] : [desde, hasta, empresa_id]
    );
    return rows;
  },

  async getTicketsPorPrioridad(empresa_id, esProveedora, desde, hasta) {
    const [rows] = await pool.query(
      `SELECT t.prioridad, COUNT(*) AS total
       FROM tickets t
       WHERE t.creado_en BETWEEN ? AND ?
       ${esProveedora ? '' : 'AND t.empresa_id = ?'}
       GROUP BY t.prioridad
       ORDER BY FIELD(t.prioridad, 'Critica', 'Alta', 'Media', 'Baja')`,
      esProveedora ? [desde, hasta] : [desde, hasta, empresa_id]
    );
    return rows;
  },

  async getRendimientoTecnicos(empresa_id, esProveedora, desde, hasta) {
    const [rows] = await pool.query(
      `SELECT 
        u.nombre AS tecnico,
        COUNT(t.id) AS total_asignados,
        SUM(CASE WHEN t.estado IN ('Resuelto', 'Cerrado') THEN 1 ELSE 0 END) AS resueltos,
        ROUND(SUM(CASE WHEN t.sla_cumplido = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(CASE WHEN t.sla_cumplido IS NOT NULL THEN 1 END), 0), 1) AS sla_cumplido_pct,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.creado_en, t.primera_respuesta_en)), 0) AS avg_primera_respuesta_min
       FROM usuarios u
       LEFT JOIN tickets t ON t.asignado_a = u.id AND t.creado_en BETWEEN ? AND ?
       WHERE u.rol = 'tecnico' AND u.empresa_id = 'emp-001'
       GROUP BY u.id, u.nombre
       ORDER BY resueltos DESC`,
      [desde, hasta]
    );
    return rows;
  },

  async getTicketsPorCategoria(empresa_id, esProveedora, desde, hasta) {
    const [rows] = await pool.query(
      `SELECT t.categoria, COUNT(*) AS total
       FROM tickets t
       WHERE t.creado_en BETWEEN ? AND ?
       ${esProveedora ? '' : 'AND t.empresa_id = ?'}
       GROUP BY t.categoria
       ORDER BY total DESC`,
      esProveedora ? [desde, hasta] : [desde, hasta, empresa_id]
    );
    return rows;
  },

  async getCSATPromedio(empresa_id, esProveedora, desde, hasta) {
    const [rows] = await pool.query(
      `SELECT 
        ROUND(AVG(c.puntuacion), 1) AS promedio,
        COUNT(*) AS total_respuestas
       FROM csat c
       JOIN tickets t ON c.ticket_id = t.id
       WHERE c.creado_en BETWEEN ? AND ?
       ${esProveedora ? '' : 'AND t.empresa_id = ?'}`,
      esProveedora ? [desde, hasta] : [desde, hasta, empresa_id]
    );
    return rows[0];
  }

};

module.exports = reporteModel;