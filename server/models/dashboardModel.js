const pool = require('../db');

const dashboardModel = {

  async getMetricas(empresa_id, usuario) {
    const esProveedora = empresa_id === 'emp-001';
    let filtro = '';
    let params = [];

    if (usuario.rol === 'usuario') {
      filtro = 'WHERE t.empresa_id = ? AND t.creado_por = ?';
      params = [empresa_id, usuario.id];
    } else if (usuario.rol === 'tecnico') {
      filtro = 'WHERE t.asignado_a = ?';
      params = [usuario.id];
    } else if (!esProveedora) {
      filtro = 'WHERE t.empresa_id = ?';
      params = [empresa_id];
    }
    // admin/superadmin de Aurogal ven todo

    const [abiertos] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets t ${filtro} ${filtro ? 'AND' : 'WHERE'} t.estado = 'Abierto'`,
      [...params]
    );
    const [enProgreso] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets t ${filtro} ${filtro ? 'AND' : 'WHERE'} t.estado = 'En Progreso'`,
      [...params]
    );
    const [resueltosHoy] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets t ${filtro} ${filtro ? 'AND' : 'WHERE'} t.estado = 'Resuelto' AND DATE(t.actualizado_en) = CURDATE()`,
      [...params]
    );
    const [slaCumplido] = await pool.query(
      `SELECT ROUND(SUM(CASE WHEN t.sla_cumplido = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
       FROM tickets t ${filtro} ${filtro ? 'AND' : 'WHERE'} t.sla_cumplido IS NOT NULL`,
      [...params]
    );

    return {
      abiertos:     abiertos[0].total,
      enProgreso:   enProgreso[0].total,
      resueltosHoy: resueltosHoy[0].total,
      slaCumplido:  slaCumplido[0].porcentaje || 0,
    };
  },

  async getTicketsRecientes(empresa_id, usuario) {
    const esProveedora = empresa_id === 'emp-001';
    let filtro = '';
    let params = [];

    if (usuario.rol === 'usuario') {
      filtro = 'WHERE t.empresa_id = ? AND t.creado_por = ?';
      params = [empresa_id, usuario.id];
    } else if (usuario.rol === 'tecnico') {
      filtro = 'WHERE t.asignado_a = ?';
      params = [usuario.id];
    } else if (!esProveedora) {
      filtro = 'WHERE t.empresa_id = ?';
      params = [empresa_id];
    }

    const [rows] = await pool.query(
      `SELECT t.id, t.codigo, t.titulo, t.prioridad, t.estado, t.creado_en,
              u.nombre AS asignado_a_nombre,
              e.nombre AS empresa_nombre
       FROM tickets t
       LEFT JOIN usuarios u ON t.asignado_a = u.id
       LEFT JOIN empresas e ON t.empresa_id = e.id
       ${filtro}
       ORDER BY t.creado_en DESC
       LIMIT 5`,
      params
    );
    return rows;
  },

  async getSLAPorPrioridad(empresa_id, usuario) {
    const esProveedora = empresa_id === 'emp-001';
    let filtro = '';
    let params = [];

    if (usuario.rol === 'usuario') {
      filtro = 'WHERE t.empresa_id = ? AND t.creado_por = ?';
      params = [empresa_id, usuario.id];
    } else if (usuario.rol === 'tecnico') {
      filtro = 'WHERE t.asignado_a = ?';
      params = [usuario.id];
    } else if (!esProveedora) {
      filtro = 'WHERE t.empresa_id = ?';
      params = [empresa_id];
    }

    const [rows] = await pool.query(
      `SELECT t.prioridad,
              ROUND(SUM(CASE WHEN t.sla_cumplido = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
       FROM tickets t
       ${filtro} ${filtro ? 'AND' : 'WHERE'} t.sla_cumplido IS NOT NULL
       GROUP BY t.prioridad`,
      params
    );
    return rows;
  },

  async getTiempoPromedioRespuesta(empresa_id, usuario) {
    const esProveedora = empresa_id === 'emp-001';
    let filtro = '';
    let params = [empresa_id];

    if (!esProveedora) {
      filtro = 'AND t.empresa_id = ?';
    } else {
      params = [];
    }

    const [rows] = await pool.query(
      `SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.creado_en, primera.primera_en)), 0) AS minutos_promedio
       FROM tickets t
       JOIN (
         SELECT c.ticket_id, MIN(c.creado_en) AS primera_en
         FROM ticket_comentarios c
         JOIN usuarios u ON c.usuario_id = u.id
         WHERE u.rol IN ('admin', 'tecnico')
         GROUP BY c.ticket_id
       ) primera ON t.id = primera.ticket_id
       ${filtro ? 'WHERE 1=1 ' + filtro : ''}`,
      params
    );
    return rows[0]?.minutos_promedio || null;
  }
};

module.exports = dashboardModel;