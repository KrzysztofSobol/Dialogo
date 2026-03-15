import { performance } from 'node:perf_hooks';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { getWebSocketPort, sendMessageToChannel, sendServerNotifications, wss } from '../websocket';
import { average, closeTrackedClients, trackClient, waitForMessage, waitForOpen } from './websocketTestUtils';

describe('WebSocket performance', () => {
  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    await closeTrackedClients();
  });

  afterAll(() => {
    try {
      wss.close();
    } catch (error) {}
  });

  it('keeps average call relay latency below 40 ms for 30 signaling messages', async () => {
    const caller = 'caller-perf-1';
    const callee = 'callee-perf-1';
    const url = `ws://localhost:${getWebSocketPort()}?CallerId=${caller}&CalleeID=${callee}`;

    const clientA = trackClient(new WebSocket(url));
    const clientB = trackClient(new WebSocket(url));

    await Promise.all([waitForOpen(clientA), waitForOpen(clientB)]);

    const samples: number[] = [];

    for (let index = 0; index < 30; index += 1) {
      const receivePromise = waitForMessage(clientB, 3000);
      const startedAt = performance.now();

      clientA.send(
        JSON.stringify({
          type: 'offer',
          sdp: `fake-offer-${index}`,
        }),
      );

      await receivePromise;
      samples.push(performance.now() - startedAt);
    }

    expect(average(samples)).toBeLessThan(40);
    expect(Math.max(...samples)).toBeLessThan(120);
  });

  it('broadcasts a channel message to 24 clients in under 1200 ms', async () => {
    const channelId = 'channel-perf-1';
    const clients = Array.from({ length: 24 }, (_, index) => {
      const url = `ws://localhost:${getWebSocketPort()}?userId=channel-user-${index}&channelId=${channelId}`;
      return trackClient(new WebSocket(url));
    });

    await Promise.all(clients.map((client) => waitForOpen(client)));

    const deliveries = clients.map((client) => waitForMessage(client, 4000));
    const startedAt = performance.now();

    sendMessageToChannel({
      id: 'perf-message-1',
      channelId,
      publishDate: new Date(),
      author: 'Perf User',
      authorId: 'channel-user-0',
      content: 'Broadcast payload',
    });

    const received = await Promise.all(deliveries);
    const elapsed = performance.now() - startedAt;

    expect(received).toHaveLength(24);
    expect(elapsed).toBeLessThan(1200);
  });

  it('sends server notifications to 39 recipients in under 1200 ms', async () => {
    const authorId = 'notification-author';
    const recipients = Array.from({ length: 39 }, (_, index) => `notification-user-${index}`);
    const allUsers = [authorId, ...recipients];

    const clients = allUsers.map((userId) =>
      trackClient(new WebSocket(`ws://localhost:${getWebSocketPort()}?userId=${userId}`)),
    );

    await Promise.all(clients.map((client) => waitForOpen(client)));

    const deliveries = clients.slice(1).map((client) => waitForMessage(client, 4000));
    const startedAt = performance.now();

    sendServerNotifications(
      {
        id: 'perf-message-2',
        channelId: 'server-channel-perf',
        publishDate: new Date(),
        author: 'Perf User',
        authorId,
        content: 'Notification payload',
      },
      'Perf Server',
      'server-perf-1',
      'general',
      allUsers,
    );

    const received = await Promise.all(deliveries);
    const elapsed = performance.now() - startedAt;

    expect(received).toHaveLength(39);
    expect(elapsed).toBeLessThan(1200);
  });
});