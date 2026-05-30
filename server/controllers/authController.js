const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');

const authController = {

  async login(req, res) {
    try {
      const { email, password, slug } = req.body;

      // 1. Buscar empresa por slug
      const empresa = await empresaModel.buscarPorSlug(slug);

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }

      // 2. Buscar usuario por email y empresa
      const usuario = await usuarioModel.buscarPorEmail(email, empresa.id);

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // 3. Verificar contraseña
      const passwordValida = await bcrypt.compare(password, usuario.password_hash);

      if (!passwordValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // 4. Generar token JWT
      const token = jwt.sign(
        {
          id:         usuario.id,
          rol:        usuario.rol,
          empresa_id: usuario.empresa_id,
          nombre:     usuario.nombre
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // 5. Responder
      res.json({
        token,
        usuario: {
          id:         usuario.id,
          nombre:     usuario.nombre,
          email:      usuario.email,
          rol:        usuario.rol,
          empresa_id: usuario.empresa_id
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

};

module.exports = authController;