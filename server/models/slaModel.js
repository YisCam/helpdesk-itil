const pool = require('../db');

const slaModel = {

  async obtenerPorPrioridad(empresa_id, prioridad) {
    const [rows] = await pool.query(
      'SELECT * FROM sla_config WHERE empresa_id = ? AND prioridad = ? AND activo = 1',
      [empresa_id, prioridad]
    );
    return rows[0];
  },

  async listar(empresa_id) {
    const [rows] = await pool.query(
      'SELECT * FROM sla_config WHERE empresa_id = ? ORDER BY FIELD(prioridad, "Critica","Alta","Media","Baja")',
      [empresa_id]
    );
    return rows;
  },

  async actualizar(empresa_id, prioridad, horas_resolucion) {
    await pool.query(
      'UPDATE sla_config SET horas_resolucion = ? WHERE empresa_id = ? AND prioridad = ?',
      [horas_resolucion, empresa_id, prioridad]
    );
  }

};

module.exports = slaModel;