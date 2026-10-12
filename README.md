<p align="center">
  <img src=".github/assets/social-preview.jpg" alt="Luma - Real-Time Spatial Hangout & Virtual World Engine" width="100%" />
</p>

# Luma

> **Real-Time Spatial Hangout & Virtual World Engine**  
> A 2D multiplayer virtual space built with **Phaser 3**, **React**, **NestJS**, and **WebSockets**.

## 📖 Project Documentation & Dev Journey

The complete development journey, architecture diagrams, and technical deep-dives are documented in the [`docs/`](./docs) folder (structured as an Obsidian vault):

- **[Project Story & Overview (`docs/luma.md`)](./docs/luma.md)**: Origins, motivations, core stack choices, and development diary.
- **[Architecture & Evolution (`docs/architecture/`)](./docs/architecture/)**:
  - **[v1 Architecture](./docs/architecture/v1/)**: Initial prototype architecture, design notes, and Excalidraw canvas.
  - **[v2 Architecture](./docs/architecture/v2/)**: Spatial features, canvas diagrams, and testing notes.
  - **[v3 Architecture](./docs/architecture/v3/)**: Scale testing, socket optimization plans, and real-time multiplayer flows.
- **[Topic Deep-Dives (`docs/Topics/`)](./docs/Topics/)**: Research into Phaser 3, game loops, WebSockets, and state sync.
- **[Engineering & Setup Notes (`docs/notes/`)](./docs/notes/)**: Project setup guide, monorepo configuration, and development notes.

---

## What's inside?

This Turborepo includes the following packages & apps:

### Apps and Packages

```shell
.
├── apps
│   ├── api                       # NestJS WebSocket & REST API
│   └── web                       # React + Vite + Phaser 3 frontend
├── packages
│   ├── @repo/database            # Prisma schema, client, and migrations
│   ├── @repo/types               # Shared TypeScript models and binary protocol types
│   ├── @repo/eslint-config       # ESLint configurations
│   └── @repo/typescript-config   # Base TypeScript configurations
├── tools
│   └── bot-simulator             # Headless high-concurrency bot simulator
└── docs                          # Architecture notes, Excalidraw diagrams & dev diary
```

Each package and application are mostly written in [TypeScript](https://www.typescriptlang.org/).

### Utilities

This `Turborepo` has some additional tools already set for you:

- [TypeScript](https://www.typescriptlang.org/) for static type-safety
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Jest](https://prettier.io) & [Playwright](https://playwright.dev/) for testing

### Commands

This `Turborepo` already configured useful commands for all your apps and packages.

#### Build

```bash
# Will build all the app & packages with the supported `build` script.
pnpm run build

# ℹ️ If you plan to only build apps individually,
# Please make sure you've built the packages first.
```

#### Develop

```bash
# Will run the development server for all the app & packages with the supported `dev` script.
pnpm run dev
```

#### test

```bash
# Will launch a test suites for all the app & packages with the supported `test` script.
pnpm run test

# You can launch e2e testes with `test:e2e`
pnpm run test:e2e

# See `@repo/jest-config` to customize the behavior.
```

#### Lint

```bash
# Will lint all the app & packages with the supported `lint` script.
# See `@repo/eslint-config` to customize the behavior.
pnpm run lint
```

#### Format

```bash
# Will format all the supported `.ts,.js,json,.tsx,.jsx` files.
# See `@repo/eslint-config/prettier-base.js` to customize the behavior.
pnpm format
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```bash
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```bash
npx turbo link
```

## Useful Links

This example take some inspiration the [with-nextjs](https://github.com/vercel/turborepo/tree/main/examples/with-nextjs) `Turbo` example and [01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app) `NestJs` sample.

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
