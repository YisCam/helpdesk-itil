const pool = require('../db');

const dashboardModel = {

  async getMetricas(empresa_id, usuario) {
    let filtroUsuario = '';
    let params = [empresa_id];

    if (usuario.rol === 'usuario') {
      filtroUsuario = 'AND creado_por = ?';
      params.push(usuario.id);
    } else if (usuario.rol === 'tecnico') {
      filtroUsuario = 'AND asignado_a = ?';
      params.push(usuario.id);
    }

    const [abiertos] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets WHERE empresa_id = ? AND estado = 'Abierto' ${filtroUsuario}`,
      params
    );
    const [enProgreso] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets WHERE empresa_id = ? AND estado = 'En Progreso' ${filtroUsuario}`,
      params
    );
    const [resueltosHoy] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets WHERE empresa_id = ? AND estado = 'Resuelto' AND DATE(actualizado_en) = CURDATE() ${filtroUsuario}`,
      params
    );
    const [slaCumplido] = await pool.query(
      `SELECT 
        ROUND(SUM(CASE WHEN sla_cumplido = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
       FROM tickets WHERE empresa_id = ? AND sla_cumplido IS NOT NULL ${filtroUsuario}`,
      params
    );

    return {
      abiertos: abiertos[0].total,
      enProgreso: enProgreso[0].total,
      resueltosHoy: resueltosHoy[0].total,
      slaCumplido: slaCumplido[0].porcentaje || 0,
    };
  },

  async getTicketsRecientes(empresa_id, usuario) {
    let filtroUsuario = '';
    let params = [empresa_id];

    if (usuario.rol === 'usuario') {
      filtroUsuario = 'AND t.creado_por = ?';
      params.push(usuario.id);
    } else if (usuario.rol === 'tecnico') {
      filtroUsuario = 'AND t.asignado_a = ?';
      params.push(usuario.id);
    }

    const [rows] = await pool.query(
      `SELECT t.id, t.codigo, t.titulo, t.prioridad, t.estado, t.creado_en,
              u.nombre AS asignado_a_nombre
       FROM tickets t
       LEFT JOIN usuarios u ON t.asignado_a = u.id
       WHERE t.empresa_id = ? ${filtroUsuario}
       ORDER BY t.creado_en DESC
       LIMIT 5`,
      params
    );
    return rows;
  },

  async getSLAPorPrioridad(empresa_id) {
    const [rows] = await pool.query(
      `SELECT 
        prioridad,
        ROUND(SUM(CASE WHEN sla_cumplido = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
       FROM tickets
       WHERE empresa_id = ? AND sla_cumplido IS NOT NULL
       GROUP BY prioridad`,
      [empresa_id]
    );
    return rows;
  },


  async getSLADetalle(empresa_id, ticket_id) {
    const [primeraRespuesta] = await pool.query(
      `SELECT MIN(c.creado_en) AS primera_respuesta_en
      FROM ticket_comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.ticket_id = ? AND c.empresa_id = ?
      AND u.rol IN ('admin', 'tecnico')`,
      [ticket_id, empresa_id]
    );
    return primeraRespuesta[0];
  },

  async getTiempoPromedioRespuesta(empresa_id) {
    const [rows] = await pool.query(
      `SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.creado_en, primera.primera_en)), 0) AS minutos_promedio
      FROM tickets t
      JOIN (
        SELECT c.ticket_id, MIN(c.creado_en) AS primera_en
        FROM ticket_comentarios c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.empresa_id = ? AND u.rol IN ('admin', 'tecnico')
        GROUP BY c.ticket_id
      ) primera ON t.id = primera.ticket_id
      WHERE t.empresa_id = ?`,
      [empresa_id, empresa_id]
    );
    return rows[0]?.minutos_promedio || null;
  }

};

module.exports = dashboardModel;