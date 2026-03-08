import WebSocket from 'ws';

const trackedClients = new Set<WebSocket>();

export function trackClient(ws: WebSocket) {
  trackedClients.add(ws);
  return ws;
}

export async function closeTrackedClients() {
  const clients = Array.from(trackedClients);
  trackedClients.clear();

  await Promise.all(
    clients.map(
      (ws) =>
        new Promise<void>((resolve) => {
          if (ws.readyState === WebSocket.CLOSED) {
            resolve();
            return;
          }

          ws.once('close', () => resolve());
          ws.close();
        }),
    ),
  );

  await new Promise((resolve) => setTimeout(resolve, 50));
}

export function waitForOpen(ws: WebSocket) {
  return new Promise<void>((resolve, reject) => {
    ws.on('open', () => resolve());
    ws.on('error', (err) => reject(err));
  });
}

export function waitForMessage(ws: WebSocket, timeout = 2000) {
  return new Promise<string>((resolve, reject) => {
    const onError = (error: Error) => {
      clearTimeout(to);
      ws.off('message', onMessage);
      ws.off('error', onError);
      reject(error);
    };

    const onMessage = (data: WebSocket.RawData) => {
      clearTimeout(to);
      ws.off('message', onMessage);
      ws.off('error', onError);
      resolve(data.toString());
    };

    const to = setTimeout(() => {
      ws.off('message', onMessage);
      ws.off('error', onError);
      reject(new Error('Timeout waiting for message'));
    }, timeout);

    ws.on('message', onMessage);
    ws.on('error', onError);
  });
}

export function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}