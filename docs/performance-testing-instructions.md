# Performance Testing Instructions

This document explains how to run performance tests in Dialogo and how to read their results correctly.

## 1. Purpose

The current performance tests validate the responsiveness of the WebSocket layer.

They do not measure browser rendering, CPU profiling, Lighthouse metrics, or database engine performance.

They currently cover:

1. call signaling relay latency,
2. message broadcast to channel clients,
3. notification delivery to connected users.

Implementation file:

- [server/tests/websocket.performance.spec.ts](../server/tests/websocket.performance.spec.ts)

## 2. How To Run The Tests

Install dependencies first:

```bash
npm install
```

Run only performance tests:

```bash
npm run test:perf
```

Run the default test command:

```bash
npm test
```

Run the alias for the full current test set:

```bash
npm run test:all
```

At the moment, all available automated tests are performance-oriented WebSocket tests.

## 3. What The Tests Measure

### 3.1 Call Relay Latency

Test name:

- [server/tests/websocket.performance.spec.ts](../server/tests/websocket.performance.spec.ts#L19)

What it does:

1. opens two WebSocket clients in one call session,
2. sends 30 signaling messages,
3. measures how long it takes for each message to arrive at the second client,
4. calculates the average latency.

Thresholds:

- average latency must be lower than `40 ms`,
- worst single sample must be lower than `120 ms`.

Important detail:

This test measures the message relay window only, not the full Vitest file runtime.

### 3.2 Channel Broadcast Fan-Out

Test name:

- [server/tests/websocket.performance.spec.ts](../server/tests/websocket.performance.spec.ts#L49)

What it does:

1. opens `24` clients subscribed to one channel,
2. triggers `sendMessageToChannel(...)`,
3. waits until every client receives the payload,
4. measures the total broadcast time.

Threshold:

- all `24` deliveries must complete in less than `1200 ms`.

### 3.3 Server Notification Fan-Out

Test name:

- [server/tests/websocket.performance.spec.ts](../server/tests/websocket.performance.spec.ts#L75)

What it does:

1. opens `40` notification clients,
2. treats one client as the author,
3. sends notifications to the remaining `39` recipients,
4. measures how long the full delivery takes.

Threshold:

- all `39` deliveries must complete in less than `1200 ms`.

## 4. How To Read The Output

Example command:

```bash
npm run test:perf
```

Typical output structure:

```text
✓ server/tests/websocket.performance.spec.ts (3) 1300ms
  ✓ WebSocket performance (3) 1294ms
    ✓ keeps average call relay latency below 40 ms for 30 signaling messages 464ms
    ✓ broadcasts a channel message to 24 clients in under 1200 ms 386ms
    ✓ sends server notifications to 39 recipients in under 1200 ms 329ms
```

How to interpret it:

1. `✓` means the assertion passed.
2. The number at the end of each test line is the runtime of the whole Vitest test case, including setup, connection establishment, waiting, and cleanup.
3. The assertion inside the test may measure a smaller time window than the visible Vitest runtime.

This distinction is important.

Example:

- a test line may show `1424ms`,
- but the internal measured relay average may still be below `40 ms`,
- therefore the test still passes correctly.

## 5. Pass vs Fail Rules

The suite should be treated as successful when:

1. all three performance tests pass,
2. there are no unhandled errors in Vitest output,
3. there is no `EADDRINUSE` or socket startup failure.

The suite should be treated as suspicious when:

1. tests pass but runtime grows sharply across repeated runs,
2. disconnect counts do not return to zero in notification logs,
3. the machine is under unusual load during execution.

The suite fails when:

1. any threshold assertion fails,
2. a client does not receive a message before timeout,
3. the WebSocket server cannot start.

## 6. How To Compare Results Between Runs

Use the same machine conditions when comparing runs.

Recommended comparison method:

1. close unnecessary applications,
2. run `npm run test:perf` at least 3 times,
3. compare whether failures are consistent,
4. watch for regressions in broadcast and notification scenarios first.

Do not treat a single slightly slower Vitest runtime line as a regression unless the assertion thresholds fail or repeated runs confirm slowdown.

## 7. Logs You Will See During Execution

The current server prints connection and disconnection logs from:

- [server/websocket.ts](../server/websocket.ts)

Examples:

- `connected to call clients`
- `connected to channel`
- `connected to notifications clients`
- `disconnected from notifications clients`

These logs are useful for checking whether clients are cleaned up correctly.

For notification tests, the final disconnect log should return the count to `0`.

## 8. Common Problems And Meaning

### `EADDRINUSE`

Meaning:

- another process is already using the WebSocket port.

Current status:

- the test setup already avoids this in Vitest by using a dynamic test port from [server/websocket.ts](../server/websocket.ts#L3).

### Timeout waiting for message

Meaning:

- a client did not receive data within the expected time window,
- this may indicate a regression in broadcast/relay logic,
- it may also happen under heavy local machine load.

### Passed test but high visible runtime

Meaning:

- the Vitest case includes setup and teardown,
- the assertion likely measured only the internal delivery window.

Check the threshold logic in the test file before deciding that performance regressed.

## 9. Where To Change Thresholds

If the team wants stricter or looser limits, update the assertions in:

- [server/tests/websocket.performance.spec.ts](../server/tests/websocket.performance.spec.ts)

Current limits:

- relay average: `< 40 ms`,
- relay max sample: `< 120 ms`,
- channel broadcast total: `< 1200 ms`,
- server notification total: `< 1200 ms`.

Thresholds should only be changed with a clear reason, for example:

1. intentional architecture change,
2. measured regression confirmed on multiple runs,
3. increased scenario size such as more clients per test.

## 10. Recommended Review Process

When someone changes WebSocket behavior, use this order:

1. run `npm test`,
2. if needed, rerun `npm run test:perf`,
3. inspect failing scenario name,
4. compare current behavior with [server/websocket.ts](../server/websocket.ts),
5. rerun the suite to confirm whether the failure is stable.

## 11. Quick Reference

- Run performance tests: `npm run test:perf`
- Run default tests: `npm test`
- Run all tests: `npm run test:all`
- Performance test file: [server/tests/websocket.performance.spec.ts](../server/tests/websocket.performance.spec.ts)
- WebSocket implementation: [server/websocket.ts](../server/websocket.ts)