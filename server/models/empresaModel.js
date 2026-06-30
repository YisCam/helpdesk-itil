const pool = require('../db');

const empresaModel = {

  async buscarPorSlug(slug) {
    const [rows] = await pool.query(
      'SELECT * FROM empresas WHERE slug = ? AND activo = 1',
      [slug]
    );
    return rows[0];
  }

};

module.exports = empresaModel;