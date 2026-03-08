import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import WebSocket from 'ws';
import { wss } from '../websocket';

function waitForOpen(ws: WebSocket) {
  return new Promise<void>((resolve, reject) => {
    ws.on('open', () => resolve());
    ws.on('error', (err) => reject(err));
  });
}

function waitForMessage(ws: WebSocket, timeout = 2000) {
  return new Promise<string>((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('Timeout waiting for message')), timeout);
    ws.on('message', (data) => {
      clearTimeout(to);
      resolve(data.toString());
    });
  });
}

describe('P2P signaling (integration)', () => {
  let clientA: WebSocket;
  let clientB: WebSocket;

  beforeAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
  });

  afterAll(() => {
    try {
      clientA?.close();
      clientB?.close();
    } catch (e) {}
    try {
      wss.close();
    } catch (e) {}
  });

  it('forwards signaling messages between two peers in the same call', async () => {
    const caller = 'caller-test-1';
    const callee = 'callee-test-1';
    const url = `ws://localhost:3001?CallerId=${caller}&CalleeID=${callee}`;

    clientA = new WebSocket(url);
    clientB = new WebSocket(url);

    await Promise.all([waitForOpen(clientA), waitForOpen(clientB)]);

    const msgPromise = waitForMessage(clientB);

    const payload = { type: 'offer', sdp: 'fake-offer' };
    clientA.send(JSON.stringify(payload));

    const raw = await msgPromise;
    const parsed = JSON.parse(raw);

    expect(parsed).toEqual(payload);
  });
});
