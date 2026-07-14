const notificacionModel = require('../models/notificacionModel');
const { agregarCliente } = require('../sse');

const notificacionController = {

  async suscribir(req, res) {
    agregarCliente(req.usuario.id, res);
  },

  async listar(req, res) {
    try {
      const notificaciones = await notificacionModel.listar(req.usuario.id);
      res.json(notificaciones);
    } catch (error) {
      console.error('Error al listar notificaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async marcarLeido(req, res) {
    try {
      await notificacionModel.marcarLeido(req.params.id, req.usuario.id);
      res.json({ mensaje: 'Notificación marcada como leída' });
    } catch (error) {
      console.error('Error al marcar notificación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async marcarTodosLeidos(req, res) {
    try {
      await notificacionModel.marcarTodosLeidos(req.usuario.id);
      res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async contarNoLeidos(req, res) {
    try {
      const total = await notificacionModel.contarNoLeidos(req.usuario.id);
      res.json({ total });
    } catch (error) {
      console.error('Error al contar notificaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = notificacionController;