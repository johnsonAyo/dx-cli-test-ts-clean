export const USAGE = `Usage: dxcli <project-name> [options]

Scaffold a new project directory for Pion engineers.

Options:
  --dry-run      Show the planned filesystem changes without writing anything.
  --force        Update an existing project directory instead of failing.
  --help, -h     Show this help message.
  --version, -v  Print the version number and exit.

Examples:
  dxcli api-service
  dxcli api-service --dry-run
  dxcli api-service --force`;
