# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Tests

Run the performance test suite:

```bash
npm test
```

Run the same performance suite explicitly:

```bash
npm run test:perf
```

Run the default full test command:

```bash
npm run test:all
```

## Project Docs

- Performance test instructions and result interpretation are documented in [docs/performance-testing-instructions.md](docs/performance-testing-instructions.md).
- Data reading rules and examples for this project are documented in [docs/data-reading-instructions.md](docs/data-reading-instructions.md).

## Performance Result Summary

The current performance suite checks three websocket scenarios:

- call signaling relay latency,
- channel broadcast fan-out,
- server notification fan-out.

To review the exact thresholds, see [docs/performance-testing-instructions.md](docs/performance-testing-instructions.md).

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
