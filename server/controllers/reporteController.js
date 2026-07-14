const reporteModel = require('../models/reporteModel');

const reporteController = {

  async getReporte(req, res) {
    try {
      const esProveedora = req.usuario.empresa_id === 'emp-001';
      const empresa_id = req.usuario.empresa_id;

      // Fechas por defecto: último mes
      const hasta = req.query.hasta ? new Date(req.query.hasta) : new Date();
      const desde = req.query.desde
        ? new Date(req.query.desde)
        : new Date(hasta.getFullYear(), hasta.getMonth() - 1, hasta.getDate());

      hasta.setHours(23, 59, 59);
      desde.setHours(0, 0, 0);

      const [porEstado, porPrioridad, porCategoria, tecnicoss, csat] = await Promise.all([
        reporteModel.getTicketsPorEstado(empresa_id, esProveedora, desde, hasta),
        reporteModel.getTicketsPorPrioridad(empresa_id, esProveedora, desde, hasta),
        reporteModel.getTicketsPorCategoria(empresa_id, esProveedora, desde, hasta),
        reporteModel.getRendimientoTecnicos(empresa_id, esProveedora, desde, hasta),
        reporteModel.getCSATPromedio(empresa_id, esProveedora, desde, hasta),
      ]);

      res.json({ porEstado, porPrioridad, porCategoria, tecnicos: tecnicoss, csat });
    } catch (error) {
      console.error('Error al obtener reporte:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = reporteController;