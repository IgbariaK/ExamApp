import http from 'node:http';

const port = Number(process.env.PORT) || 4001;
const receivedEvents = [];

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
};

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'notification-service',
      eventsReceived: receivedEvents.length,
    });
    return;
  }

  if (request.method === 'POST' && request.url === '/notifications') {
    try {
      const event = await readJsonBody(request);
      const storedEvent = {
        ...event,
        receivedAt: new Date().toISOString(),
      };

      receivedEvents.push(storedEvent);
      console.log('Notification event received:', JSON.stringify(storedEvent));

      sendJson(response, 202, {
        accepted: true,
        eventCount: receivedEvents.length,
      });
    } catch {
      sendJson(response, 400, { message: 'Invalid JSON payload.' });
    }
    return;
  }

  if (request.method === 'GET' && request.url === '/notifications') {
    sendJson(response, 200, receivedEvents);
    return;
  }

  sendJson(response, 404, { message: 'Route not found.' });
});

server.listen(port, () => {
  console.log(`Notification service listening on http://localhost:${port}`);
});
