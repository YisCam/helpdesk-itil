const usuarioModel = require('../models/usuarioModel');

const usuarioController = {

  async listar(req, res) {
    try {
      const usuarios = await usuarioModel.listar(req.usuario.empresa_id);
      res.json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      const roles = ['admin', 'tecnico', 'usuario'];
      if (!roles.includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      const usuario = await usuarioModel.crear(req.usuario.empresa_id, { nombre, email, password, rol });
      res.status(201).json(usuario);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El email ya está registrado en esta empresa' });
      }
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, rol } = req.body;

      if (!nombre || !email || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      const usuario = await usuarioModel.actualizar(id, req.usuario.empresa_id, { nombre, email, rol });
      res.json(usuario);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async desactivar(req, res) {
    try {
      const { id } = req.params;

      if (id === req.usuario.id) {
        return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
      }

      await usuarioModel.desactivar(id, req.usuario.empresa_id);
      res.json({ mensaje: 'Usuario desactivado correctamente' });
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = usuarioController;