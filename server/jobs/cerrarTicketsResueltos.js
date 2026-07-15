const cron = require('node-cron');
const pool = require('../db');

const cerrarTicketsResueltos = () => {
  // Ejecuta todos los días a las 00:00
  cron.schedule('0 0 * * *', async () => {
    try {
      const [result] = await pool.query(
        `UPDATE tickets 
         SET estado = 'Cerrado'
         WHERE estado = 'Resuelto'
         AND actualizado_en <= DATE_SUB(NOW(), INTERVAL 3 DAY)`
      );
      if (result.affectedRows > 0) {
        console.log(`✓ ${result.affectedRows} tickets cerrados automáticamente`);
      }
    } catch (error) {
      console.error('Error en cron cerrarTicketsResueltos:', error);
    }
  });

  console.log('✓ Cron job cerrarTicketsResueltos iniciado');
};

module.exports = cerrarTicketsResueltos;