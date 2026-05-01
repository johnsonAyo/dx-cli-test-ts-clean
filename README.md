# DX CLI Tool

A small TypeScript CLI for scaffolding new project directories for Pion engineers.

The current scaffold creates a project folder with a starter `README.md`. The code is intentionally structured so future templates or commands can be added without rewriting the CLI entrypoint.

## Requirements

- Node.js 18 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Build the CLI:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run locally:

```bash
npm start -- my-project
```

## Usage

```bash
dxcli <project-name> [options]
```

When running through npm during local development, pass arguments after `--`:

```bash
npm start -- my-project --dry-run
```

## Options

| Option | Description |
| --- | --- |
| `--dry-run` | Prints the filesystem changes that would happen without creating or changing files. |
| `--force` | Allows the CLI to update an existing project directory. Existing scaffold-owned files may be replaced, but unrelated files are left in place. |
| `--help`, `-h` | Prints usage information and exits successfully. |
| `--version`, `-v` | Prints the current version number and exits. |

## Examples

Create a project:

```bash
npm start -- my-project
```

Preview a project without writing files:

```bash
npm start -- my-project --dry-run
```

Update an existing project directory:

```bash
npm start -- my-project --force
```

Preview what `--force` would do:

```bash
npm start -- my-project --force --dry-run
```

Show help:

```bash
npm start -- --help
```

## Error Handling

The CLI exits with a non-zero status and a clear message when:

- no project name is provided;
- an unknown flag is used;
- more than one project name is provided;
- the project name is path-like, such as `../app` or `apps/app`;
- the target directory already exists and `--force` is not provided;
- the target path exists but is not a directory.

## Project Structure

```text
cli-tool/
  index.ts            CLI entrypoint: parse input, call project creation, print output
  lib/
    errors.ts         CLI-specific error type
    parser.ts         Argument parsing and flag validation
    project.ts        Filesystem scaffold logic
  test/               Node test runner tests
```

## Future Direction

If this grew into a broader internal DX tool, the next step would be a command registry, for example `dxcli create`, `dxcli doctor`, and `dxcli upgrade`. Each command should own its parser, validation, and handler while sharing common logging, error handling, and filesystem utilities.
