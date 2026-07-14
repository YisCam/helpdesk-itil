const comentarioModel = require('../models/comentarioModel');
const pool = require('../db');

const comentarioController = {

  async listar(req, res) {
    try {
      const [ticket] = await pool.query('SELECT empresa_id FROM tickets WHERE id = ?', [req.params.ticketId]);
      if (!ticket[0]) return res.status(404).json({ error: 'Ticket no encontrado' });

      const comentarios = await comentarioModel.listar(req.params.ticketId, ticket[0].empresa_id);
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

      const [ticketRows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [req.params.ticketId]);
      if (!ticketRows[0]) return res.status(404).json({ error: 'Ticket no encontrado' });
      const ticket = ticketRows[0];

      const comentario = await comentarioModel.crear(
        req.params.ticketId,
        ticket.empresa_id,
        req.usuario.id,
        contenido.trim()
      );

      // Notificar al creador si el comentario es de técnico/admin/superadmin
      if (
        ['tecnico', 'admin', 'superadmin'].includes(req.usuario.rol) &&
        ticket.creado_por !== req.usuario.id
      ) {
        const notificacionModel = require('../models/notificacionModel');
        const { notificarUsuario } = require('../sse');
        const notif = await notificacionModel.crear(
          ticket.empresa_id,
          ticket.creado_por,
          'comentario',
          `Nuevo comentario en tu ticket ${ticket.codigo}: ${ticket.titulo}`
        );
        notificarUsuario(ticket.creado_por, notif);
      }

      res.status(201).json(comentario);
    } catch (error) {
      console.error('Error al crear comentario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async eliminar(req, res) {
    try {
      const [ticket] = await pool.query('SELECT empresa_id FROM tickets WHERE id = ?', [req.params.ticketId]);
      if (!ticket[0]) return res.status(404).json({ error: 'Ticket no encontrado' });

      await comentarioModel.eliminar(req.params.id, ticket[0].empresa_id, req.usuario.id);
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

      const [ticket] = await pool.query('SELECT empresa_id FROM tickets WHERE id = ?', [req.params.ticketId]);
      if (!ticket[0]) return res.status(404).json({ error: 'Ticket no encontrado' });

      await comentarioModel.editar(req.params.id, ticket[0].empresa_id, req.usuario.id, contenido.trim());
      res.json({ mensaje: 'Comentario editado correctamente' });
    } catch (error) {
      console.error('Error al editar comentario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = comentarioController;