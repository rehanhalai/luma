# Agent Guidelines

## Communication

- Speak in plain, simple English.
- Avoid buzzwords, jargon, and corporate fluff.
- Be direct and concise.

## Coding Style & Changes

- Keep solutions as simple as possible. Avoid over-engineering.
- Make only the minimal changes needed to complete the task.
- Follow DRY (Don't Repeat Yourself).
- Always check if a utility function or method already exists before writing a new one.

## Project Rules

- This is a monorepo: always use `pnpm` (never `npm` or `yarn`).
- Keep game logic decoupled and maintain existing conventions.

## Verification & CI

- Always run `pnpm format` and `pnpm lint` after completing any feature or change.
- Ensure TypeScript builds cleanly without unresolved type errors.
