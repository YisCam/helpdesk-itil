const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const comentarioModel = {

  async listar(ticket_id, empresa_id) {
    const [rows] = await pool.query(
      `SELECT c.id, c.contenido, c.creado_en, c.usuario_id,
              u.nombre AS usuario_nombre, u.rol AS usuario_rol
      FROM ticket_comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.ticket_id = ? AND c.empresa_id = ?
      ORDER BY c.creado_en ASC`,
      [ticket_id, empresa_id]
    );
    return rows;
  },

  async crear(ticket_id, empresa_id, usuario_id, contenido) {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO ticket_comentarios (id, empresa_id, ticket_id, usuario_id, contenido)
      VALUES (?, ?, ?, ?, ?)`,
      [id, empresa_id, ticket_id, usuario_id, contenido]
    );

    // Registrar primera respuesta si es técnico, admin o superadmin y aún no hay una
    const [usuarios] = await pool.query(
      'SELECT rol FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (
      usuarios[0]?.rol === 'tecnico' ||
      usuarios[0]?.rol === 'admin' ||
      usuarios[0]?.rol === 'superadmin'
    ) {
      await pool.query(
        `UPDATE tickets SET primera_respuesta_en = NOW()
         WHERE id = ? AND primera_respuesta_en IS NULL`,
        [ticket_id]
      );
    }

    return { id, contenido };
  },

  async eliminar(id, empresa_id, usuario_id) {
    await pool.query(
      'DELETE FROM ticket_comentarios WHERE id = ? AND empresa_id = ? AND usuario_id = ?',
      [id, empresa_id, usuario_id]
    );
  },

  async editar(id, empresa_id, usuario_id, contenido) {
    await pool.query(
      'UPDATE ticket_comentarios SET contenido = ? WHERE id = ? AND empresa_id = ? AND usuario_id = ?',
      [contenido, id, empresa_id, usuario_id]
    );
  }

};

module.exports = comentarioModel;