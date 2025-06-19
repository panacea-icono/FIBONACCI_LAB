const crypto = require('crypto');
require('dotenv').config();

/**
 * Verifica la firma enviada por Vercel usando tu webhook secret
 * @param {IncomingMessage} req - Request entrante (req de http.createServer o Express)
 * @param {string} payload - Cuerpo crudo de la petición (req.text() si usas Fetch)
 * @returns {boolean}
 */
async function verifySignature(req) {
  const payload = await req.text();
  const signature = crypto
    .createHmac('sha1', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return signature === req.headers['x-vercel-signature'];
}

// Exportar si deseas usarlo en otros módulos
module.exports = verifySignature;
