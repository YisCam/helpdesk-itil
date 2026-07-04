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
  }

};

module.exports = dashboardModel;