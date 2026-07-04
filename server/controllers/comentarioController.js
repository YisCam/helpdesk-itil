const comentarioModel = require('../models/comentarioModel');

const comentarioController = {

  async listar(req, res) {
    try {
      const comentarios = await comentarioModel.listar(
        req.params.ticketId,
        req.usuario.empresa_id
      );
      res.json(comentarios);
    } catch (error) {
      console.error('Error al listar comentarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async crear(req, res) {
    try {
      const { contenido } = req.body;

      if (!contenido || contenido.trim() === '') {
        return res.status(400).json({ error: 'El comentario no puede estar vacío' });
      }

      const comentario = await comentarioModel.crear(
        req.params.ticketId,
        req.usuario.empresa_id,
        req.usuario.id,
        contenido.trim()
      );
      res.status(201).json(comentario);
    } catch (error) {
      console.error('Error al crear comentario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async eliminar(req, res) {
    try {
      await comentarioModel.eliminar(
        req.params.id,
        req.usuario.empresa_id,
        req.usuario.id
      );
      res.json({ mensaje: 'Comentario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async editar(req, res) {
    try {
      const { contenido } = req.body;
      if (!contenido || contenido.trim() === '') {
        return res.status(400).json({ error: 'El comentario no puede estar vacío' });
      }
      await comentarioModel.editar(req.params.id, req.usuario.empresa_id, req.usuario.id, contenido.trim());
      res.json({ mensaje: 'Comentario editado correctamente' });
    } catch (error) {
      console.error('Error al editar comentario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = comentarioController;