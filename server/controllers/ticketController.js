const ticketModel = require('../models/ticketModel');

const ticketController = {

  async listar(req, res) {
    try {
      const tickets = await ticketModel.listar(req.usuario.empresa_id, req.usuario);
      res.json(tickets);
    } catch (error) {
      console.error('Error al listar tickets:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async obtener(req, res) {
    try {
      const ticket = await ticketModel.buscarPorId(req.params.id, req.usuario.empresa_id);
      if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
      res.json(ticket);
    } catch (error) {
      console.error('Error al obtener ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async crear(req, res) {
    try {
      const { titulo, descripcion, categoria, prioridad, etiquetas } = req.body;

      if (!titulo || !categoria || !prioridad) {
        return res.status(400).json({ error: 'Título, categoría y prioridad son obligatorios' });
      }

      const categorias = ['Hardware', 'Software', 'Red', 'Accesos', 'Otro'];
      const prioridades = ['Critica', 'Alta', 'Media', 'Baja'];

      if (!categorias.includes(categoria)) {
        return res.status(400).json({ error: 'Categoría inválida' });
      }
      if (!prioridades.includes(prioridad)) {
        return res.status(400).json({ error: 'Prioridad inválida' });
      }

      const ticket = await ticketModel.crear(
        req.usuario.empresa_id,
        req.usuario.id,
        { titulo, descripcion, categoria, prioridad, etiquetas }
      );
      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error al crear ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async actualizarEstado(req, res) {
    try {
      const { estado } = req.body;
      const estados = ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'];

      if (!estados.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      await ticketModel.actualizarEstado(req.params.id, req.usuario.empresa_id, estado);
      res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async asignar(req, res) {
    try {
      const { asignado_a } = req.body;

      if (!asignado_a) {
        return res.status(400).json({ error: 'El campo asignado_a es obligatorio' });
      }

      await ticketModel.asignar(req.params.id, req.usuario.empresa_id, asignado_a);
      res.json({ mensaje: 'Ticket asignado correctamente' });
    } catch (error) {
      console.error('Error al asignar ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async resolver(req, res) {
    try {
      const { resolucion } = req.body;

      if (!resolucion) {
        return res.status(400).json({ error: 'La resolución es obligatoria' });
      }

      await ticketModel.resolver(req.params.id, req.usuario.empresa_id, resolucion);
      res.json({ mensaje: 'Ticket resuelto correctamente' });
    } catch (error) {
      console.error('Error al resolver ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = ticketController;