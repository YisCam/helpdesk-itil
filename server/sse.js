const clientes = new Map();

const agregarCliente = (usuarioId, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Heartbeat cada 30 segundos para mantener conexión viva
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  clientes.set(usuarioId, res);

  res.on('close', () => {
    clearInterval(heartbeat);
    clientes.delete(usuarioId);
  });
};

const notificarUsuario = (usuarioId, data) => {
  const cliente = clientes.get(usuarioId);
  if (cliente) {
    cliente.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

const notificarTodos = (data) => {
  clientes.forEach(cliente => {
    cliente.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

module.exports = { agregarCliente, notificarUsuario, notificarTodos };