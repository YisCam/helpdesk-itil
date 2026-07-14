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
      const esProveedora = req.usuario.empresa_id === 'emp-001';
      const ticket = await ticketModel.buscarPorId(req.params.id, req.usuario.empresa_id, esProveedora);
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

      if (!categorias.includes(categoria)) return res.status(400).json({ error: 'Categoría inválida' });
      if (!prioridades.includes(prioridad)) return res.status(400).json({ error: 'Prioridad inválida' });

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
      const { estado, comentario } = req.body;
      const estados = ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'];

      if (!estados.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });

      const esProveedora = req.usuario.empresa_id === 'emp-001';
      const ticketActual = await ticketModel.buscarPorId(req.params.id, req.usuario.empresa_id, esProveedora);
      if (!ticketActual) return res.status(404).json({ error: 'Ticket no encontrado' });

      if (ticketActual.estado === 'Cerrado') {
        return res.status(400).json({ error: 'Un ticket cerrado no puede cambiar de estado' });
      }

      await ticketModel.actualizarEstado(req.params.id, req.usuario.empresa_id, estado);

      const historialModel = require('../models/historialModel');
      await historialModel.registrar(
        req.params.id,
        ticketActual.empresa_id,
        req.usuario.id,
        `Estado cambiado de "${ticketActual.estado}" a "${estado}"`,
        comentario || null
      );

      if (comentario) {
        const comentarioModel = require('../models/comentarioModel');
        await comentarioModel.crear(req.params.id, ticketActual.empresa_id, req.usuario.id, comentario);
      }

      // Notificar al creador por cambio de estado
      if (ticketActual.creado_por !== req.usuario.id) {
        const notificacionModel = require('../models/notificacionModel');
        const { notificarUsuario } = require('../sse');

        const mensajes = {
          'En Progreso': `Tu ticket ${ticketActual.codigo} está siendo atendido`,
          'Resuelto':    `Tu ticket ${ticketActual.codigo} fue marcado como resuelto`,
          'Cerrado':     `Tu ticket ${ticketActual.codigo} fue cerrado`,
          'Abierto':     `Tu ticket ${ticketActual.codigo} fue reabierto`,
        };

        if (mensajes[estado]) {
          const notif = await notificacionModel.crear(
            ticketActual.empresa_id,
            ticketActual.creado_por,
            'resolucion',
            mensajes[estado]
          );
          notificarUsuario(ticketActual.creado_por, notif);
        }
      }

      res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async asignar(req, res) {
    try {
      const { asignado_a } = req.body;
      if (!asignado_a) return res.status(400).json({ error: 'El campo asignado_a es obligatorio' });

      const esProveedora = req.usuario.empresa_id === 'emp-001';
      const ticketActual = await ticketModel.buscarPorId(req.params.id, req.usuario.empresa_id, esProveedora);
      if (!ticketActual) return res.status(404).json({ error: 'Ticket no encontrado' });

      const pool = require('../db');
      const [tecnicos] = await pool.query('SELECT nombre FROM usuarios WHERE id = ?', [asignado_a]);
      const nombreTecnico = tecnicos[0]?.nombre || 'Sin nombre';

      await ticketModel.asignar(req.params.id, req.usuario.empresa_id, asignado_a);

      const historialModel = require('../models/historialModel');
      await historialModel.registrar(
        req.params.id,
        ticketActual.empresa_id,
        req.usuario.id,
        `Ticket asignado a ${nombreTecnico}`,
        null
      );

      // Notificar al técnico asignado
      const notificacionModel = require('../models/notificacionModel');
      const { notificarUsuario } = require('../sse');
      const notif = await notificacionModel.crear(
        ticketActual.empresa_id,
        asignado_a,
        'asignacion',
        `Se te asignó el ticket ${ticketActual.codigo}: ${ticketActual.titulo}`
      );
      notificarUsuario(asignado_a, notif);

      res.json({ mensaje: 'Ticket asignado correctamente' });
    } catch (error) {
      console.error('Error al asignar ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async resolver(req, res) {
    try {
      const { resolucion } = req.body;
      if (!resolucion) return res.status(400).json({ error: 'La resolución es obligatoria' });

      await ticketModel.resolver(req.params.id, req.usuario.empresa_id, resolucion);
      res.json({ mensaje: 'Ticket resuelto correctamente' });
    } catch (error) {
      console.error('Error al resolver ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async actualizar(req, res) {
    try {
      const { titulo, descripcion, categoria, prioridad, etiquetas } = req.body;

      if (!titulo || !categoria || !prioridad) {
        return res.status(400).json({ error: 'Título, categoría y prioridad son obligatorios' });
      }

      const categorias = ['Hardware', 'Software', 'Red', 'Accesos', 'Otro'];
      const prioridades = ['Critica', 'Alta', 'Media', 'Baja'];

      if (!categorias.includes(categoria)) return res.status(400).json({ error: 'Categoría inválida' });
      if (!prioridades.includes(prioridad)) return res.status(400).json({ error: 'Prioridad inválida' });

      await ticketModel.actualizar(req.params.id, req.usuario.empresa_id, { titulo, descripcion, categoria, prioridad, etiquetas });
      res.json({ mensaje: 'Ticket actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getSLADetalle(req, res) {
    try {
      const esProveedora = req.usuario.empresa_id === 'emp-001';
      const detalle = await ticketModel.getSLADetalle(req.params.id, req.usuario.empresa_id, esProveedora);
      res.json({ primera_respuesta_en: detalle?.primera_respuesta_en || null });
    } catch (error) {
      console.error('Error al obtener SLA detalle:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = ticketController;