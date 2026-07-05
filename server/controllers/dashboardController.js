const dashboardModel = require('../models/dashboardModel');

const dashboardController = {

  async getMetricas(req, res) {
    try {
      const metricas = await dashboardModel.getMetricas(req.usuario.empresa_id, req.usuario);
      res.json(metricas);
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getTicketsRecientes(req, res) {
    try {
      const tickets = await dashboardModel.getTicketsRecientes(req.usuario.empresa_id, req.usuario);
      res.json(tickets);
    } catch (error) {
      console.error('Error al obtener tickets recientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getSLAPorPrioridad(req, res) {
    try {
      const sla = await dashboardModel.getSLAPorPrioridad(req.usuario.empresa_id);
      res.json(sla);
    } catch (error) {
      console.error('Error al obtener SLA por prioridad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getTiempoPromedioRespuesta(req, res) {
    try {
      const minutos = await dashboardModel.getTiempoPromedioRespuesta(req.usuario.empresa_id);
      res.json({ minutos_promedio: minutos });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = dashboardController;