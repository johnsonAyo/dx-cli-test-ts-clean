# AGENTS.md

## Project Overview

This repository contains a TypeScript CLI tool that scaffolds new project directories for Pion engineers.

The main package lives in `cli-tool/`. The CLI creates a project directory containing a starter `README.md`.

## Useful Commands

Run commands from `cli-tool/` unless noted otherwise.

```bash
npm install
npm run build
npm test
npm start -- my-project
npm start -- my-project --dry-run
npm start -- my-project --force
npm start -- --help
npm start -- --version
```

## Architecture

- `index.ts` — CLI entrypoint. Orchestrates: parse arguments, call domain logic, print output, map errors to exit codes.
- `lib/constants.ts` — usage string exported as `USAGE`; imported by `index.ts`.
- `lib/parser.ts` — argument parsing and flag validation.
- `lib/project.ts` — filesystem scaffold logic. All disk writes live here.
- `lib/errors.ts` — `CliError` with typed exit codes.
- `test/` — Node test runner tests compiled by `tsc`.

## Expected Behavior

- `--help` / `-h` print usage to stdout and exit `0`.
- `--version` / `-v` print the version and exit `0`.
- `--dry-run` must not write to disk.
- `--force` allows an existing project directory to be updated.
- `--dry-run --force` shows what would be updated without writing anything.
- Unknown flags, missing names, multiple names, path-like names, and unsafe targets fail with a clear message and exit `1`.

## Development Guidance

- Prefer small, typed modules over adding logic to `index.ts`.
- Keep filesystem side effects inside `lib/project.ts`.
- Add or update tests for every behavior change. When adding CLI behavior, cover both the parser and the filesystem impact.
- Use Node built-ins where they are enough; avoid new dependencies unless they clearly improve the CLI.
- Do not commit generated `dist/` output.
- Keep `package-lock.json` committed so installs are reproducible.
- `--force` should remain explicit, documented, and tested — it modifies existing files.
