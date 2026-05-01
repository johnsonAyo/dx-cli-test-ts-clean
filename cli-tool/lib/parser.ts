import { CliError } from './errors';

export interface CliOptions {
    projectName?: string;
    dryRun: boolean;
    force: boolean;
    help: boolean;
    version: boolean;
}

export function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {
        dryRun: false,
        force: false,
        help: false,
        version: false
    };

    for (const arg of args) {
        if (arg === '--help' || arg === '-h') {
            options.help = true;
            continue;
        }

        if (arg === '--version' || arg === '-v') {
            options.version = true;
            continue;
        }

        if (arg === '--dry-run') {
            options.dryRun = true;
            continue;
        }

        if (arg === '--force') {
            options.force = true;
            continue;
        }

        if (arg.startsWith('-')) {
            throw new CliError(`Unknown option '${arg}'. Run 'dxcli --help' for usage.`);
        }

        if (options.projectName) {
            throw new CliError(
                `Unexpected argument '${arg}'. Provide a single project name.`
            );
        }

        options.projectName = arg;
    }

    if (options.help || options.version) {
        return options;
    }

    if (!options.projectName) {
        throw new CliError("Missing project name. Run 'dxcli --help' for usage.");
    }

    return options;
}
