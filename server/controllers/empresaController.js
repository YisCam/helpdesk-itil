const empresaModel = require('../models/empresaModel');

const empresaController = {

  async listar(req, res) {
    try {
      const empresas = await empresaModel.listar();
      res.json(empresas);
    } catch (error) {
      console.error('Error al listar empresas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, slug, ruc, email, plan } = req.body;
      if (!nombre || !slug || !email || !plan) {
        return res.status(400).json({ error: 'Nombre, slug, email y plan son obligatorios' });
      }
      const empresa = await empresaModel.crear({ nombre, slug, ruc, email, plan });
      res.status(201).json(empresa);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El slug o RUC ya está registrado' });
      }
      console.error('Error al crear empresa:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async actualizar(req, res) {
    try {
      const { nombre, slug, ruc, email, plan } = req.body;
      if (!nombre || !slug || !email || !plan) {
        return res.status(400).json({ error: 'Nombre, slug, email y plan son obligatorios' });
      }
      await empresaModel.actualizar(req.params.id, { nombre, slug, ruc, email, plan });
      res.json({ mensaje: 'Empresa actualizada correctamente' });
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async desactivar(req, res) {
    try {
      if (req.params.id === 'emp-001') {
        return res.status(400).json({ error: 'No puedes desactivar la empresa proveedora' });
      }
      await empresaModel.desactivar(req.params.id);
      res.json({ mensaje: 'Empresa desactivada correctamente' });
    } catch (error) {
      console.error('Error al desactivar empresa:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async activar(req, res) {
    try {
      await empresaModel.activar(req.params.id);
      res.json({ mensaje: 'Empresa activada correctamente' });
    } catch (error) {
      console.error('Error al activar empresa:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = empresaController;