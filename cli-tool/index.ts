#!/usr/bin/env node

import { CliError } from './lib/errors';
import { parseArgs } from './lib/parser';
import { createProject, CreateProjectResult, ProjectAction, ProjectActionType } from './lib/project';
import { version } from './package.json';

import { USAGE } from './lib/constants';

try {
    const options = parseArgs(process.argv.slice(2));

    if (options.version) {
        console.log(version);
        process.exit(0);
    }

    if (options.help) {
        console.log(USAGE);
        process.exit(0);
    }

    const result = createProject(options.projectName!, {
        dryRun: options.dryRun,
        force: options.force
    });

    printSuccess(result);
} catch (err: unknown) {
    if (err instanceof CliError) {
        console.error(`Error: ${err.message}`);
        process.exit(err.exitCode);
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Unexpected error: ${message}`);
    process.exit(1);
}

function printSuccess(result: CreateProjectResult): void {
    const prefix = result.dryRun ? '[dry-run] ' : '';
    const verb = result.projectExisted
        ? result.dryRun ? 'would be updated at' : 'updated at'
        : result.dryRun ? 'would be created at' : 'created at';

    console.log(`${prefix}Project '${result.projectName}' ${verb} ${result.projectPath}`);

    for (const action of result.actions) {
        console.log(`${prefix}- ${formatAction(action)}`);
    }
}

function formatAction(action: ProjectAction): string {
    switch (action.type) {
        case ProjectActionType.CreateDirectory:
            return `create directory ${action.path}`;
        case ProjectActionType.ReplaceFile:
            return `replace file ${action.path}`;
        case ProjectActionType.WriteFile:
            return `write file ${action.path}`;
    }
}
