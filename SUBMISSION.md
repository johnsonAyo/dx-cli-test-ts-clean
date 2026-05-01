# Submission Notes

## Summary

I approached this as a production-hardening task rather than a rewrite — the structure of the original was fine, it just needed to be made reliable, predictable, and something another engineer could actually pick up and extend. So I focused on correctness first, then flag design, then making sure the documentation genuinely helps the people (and tools) that will use it.

## Bug Found and Fixed

The first thing I caught was `--help` exiting with code `1`:

```typescript
if (!args[0] || args.includes('--help')) {
    console.error("Usage: dxcli <project-name>");
    process.exit(1); // wrong — --help should be a successful exit
}
```

This is a quiet but real problem. Any script that checks for the tool's presence with `dxcli --help && echo "available"` would treat it as a failure. It was also writing to `stderr` instead of `stdout`, which breaks piping (`dxcli --help | grep force`). Both fixed: `--help` now exits `0` and writes to `stdout`.

The second issue was that `--dry-run` and `--force` were listed in the help text but completely unimplemented — the original had no argument parsing beyond `args[0]`, so both flags were silently swallowed. A user who ran `dxcli my-project --dry-run` expecting a preview would get a real directory created with no warning. That's the kind of thing that erodes trust in a tool quickly.

## Key Decisions

**Module structure** — I split the original single file into `parser.ts`, `project.ts`, `errors.ts`, and `constants.ts`. The main reason is that `index.ts` should only orchestrate — it should parse, call, print, and handle errors. If someone wants to add a new command later, they shouldn't have to untangle scaffolding logic from argument parsing to do it.

**`--dry-run`** — Implemented as a true no-write mode. It computes the full list of planned actions and returns them, but never touches disk. This matters because dry-run only has value if you can trust it completely. I also made the output explicitly say what would happen (`[dry-run] would be created at`) rather than just echoing back the input.

**`--force`** — Deliberately conservative. It replaces scaffold-owned files like `README.md` but doesn't touch anything else in the directory. A more aggressive "delete and recreate" mode could be useful, but that should be a separate explicit flag — `--force` already has a semantic contract engineers expect, and blowing away local work would violate it.

**Output messaging** — The verb in the success output distinguishes "created at" from "updated at" depending on whether the directory already existed, and this carries through into dry-run mode too. A small detail, but the goal was that a user reading the output should never have to wonder what actually happened.

**`ProjectActionType` enum** — Used a string enum instead of raw string literals for action types. The practical benefit is exhaustiveness checking: TypeScript will error at compile time if a new action type is added to the enum but not handled in the formatter switch. Worth the small overhead.

**`--version` / `-v`** — Added as a standard CLI convention. It's the kind of thing you reach for when scripting or debugging environment issues, and its absence from a tool that has `--help` is always slightly surprising.

**Tests** — Used Node's built-in test runner to avoid adding dependencies for something this size. The project tests use a real temp directory and clean up after themselves — no mocking. I wanted the tests to actually prove the filesystem behaviour, not just that the right functions were called.

## Tradeoffs

The biggest conscious tradeoff was not adding a CLI framework. At this scale it would be over-engineering — the argument surface is small and the parsing is straightforward. If the tool grows to three or four subcommands, I'd revisit that and introduce a command registry.

The scaffold output is also intentionally minimal. It creates a directory and a `README.md`. With more time I'd add template support and a proper ownership model for generated files — some way to track which files the CLI owns versus which files the engineer has customised, so `--force` can be smarter about what it replaces.

## Test Coverage and Known Gaps

The tests cover the core happy paths (create, dry-run, force, dry-run+force), the main guard failures (directory already exists without `--force`, unknown or extra arguments), path traversal prevention, and a regression for a bug I found in the path validation where names like `...` were being falsely rejected because the traversal check used `startsWith('..')` rather than checking for actual `../` traversal.

What isn't covered by automated tests yet: the individual branches inside `validateProjectName` — empty name, whitespace-only, leading/trailing whitespace, absolute paths, `.` and `..`. These all produce clean, actionable `CliError` messages and I verified them manually against the running binary, but they don't have dedicated unit tests. Same for the case where the target path exists as a file rather than a directory. These are the first tests I'd write with more time.

## How I Would Keep This Healthy Over Time

The honest answer is that internal tools like this tend to decay quietly — they stop getting updated, docs go stale, and engineers stop trusting them. So keeping it healthy is as much about process as code.

On the technical side: CI on every push with a smoke-test job that installs the binary and actually runs `dxcli --help` and `dxcli --version`. Unit tests catch logic regressions but they don't catch packaging issues. A `CHANGELOG.md` helps because engineers often copy install commands from onboarding docs that haven't been touched in months — a changelog makes it obvious when the installed version is behind.

On the product side: version the scaffold templates separately from the CLI binary so that when project conventions change, you can ship new templates without forcing everyone to upgrade the tool. Add lightweight opt-in telemetry — just the subcommand name and exit code per invocation. Without any signal from the field, DX improvements are guesswork. And dogfood it deliberately: every new engineer onboarding is a free usability test, and someone should be collecting their first-week friction notes.

The `dxcli doctor` subcommand idea is something I'd prioritise reasonably early too — a tool that fails silently on a misconfigured machine erodes trust fast, and a doctor command that checks prerequisites and tells you what's wrong is much better than an engineer spending an hour debugging their environment.
