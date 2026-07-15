const historialModel = require('../models/historialModel');

const historialController = {

  async listar(req, res) {
    try {
      const historial = await historialModel.listar(req.params.id, req.usuario.empresa_id);
      res.json(historial);
    } catch (error) {
      console.error('Error al listar historial:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = historialController;