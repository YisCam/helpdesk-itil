const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');
const pool = require('../db');

const authController = {

  async login(req, res) {
    try {
      const { email, password, slug } = req.body;

      let empresa;

      if (slug) {
        // Login con slug explícito (URL de empresa)
        empresa = await empresaModel.buscarPorSlug(slug);
        if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
      } else {
        // Login sin slug — buscar empresa por email
        const [rows] = await pool.query(
          `SELECT e.* FROM empresas e
          JOIN usuarios u ON u.empresa_id = e.id
          WHERE u.email = ? AND e.activo = 1
          LIMIT 1`,
          [email]
        );
        if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
        empresa = rows[0];
      }

      const usuario = await usuarioModel.buscarPorEmail(email, empresa.id);
      if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

      const passwordValida = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordValida) return res.status(401).json({ error: 'Credenciales inválidas' });

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol, empresa_id: usuario.empresa_id, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        usuario: {
          id:         usuario.id,
          nombre:     usuario.nombre,
          email:      usuario.email,
          rol:        usuario.rol,
          empresa_id: usuario.empresa_id,
          slug:       empresa.slug
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;