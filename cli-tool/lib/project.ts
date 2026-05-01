import * as fs from 'fs';
import * as path from 'path';
import { CliError } from './errors';

export interface CreateProjectOptions {
    cwd?: string;
    dryRun?: boolean;
    force?: boolean;
}

export enum ProjectActionType {
    CreateDirectory = 'create-directory',
    WriteFile = 'write-file',
    ReplaceFile = 'replace-file'
}

export interface ProjectAction {
    type: ProjectActionType;
    path: string;
}

export interface CreateProjectResult {
    projectName: string;
    projectPath: string;
    dryRun: boolean;
    projectExisted: boolean;
    actions: ProjectAction[];
}

export function createProject(
    name: string,
    options: CreateProjectOptions = {}
): CreateProjectResult {
    const cwd = options.cwd ?? process.cwd();
    const dryRun = options.dryRun ?? false;
    const force = options.force ?? false;
    const projectPath = path.resolve(cwd, name);
    const readmePath = path.join(projectPath, 'README.md');

    validateProjectName(name);
    validateProjectPath(cwd, projectPath);

    const projectExists = fs.existsSync(projectPath);
    if (projectExists) {
        const stat = fs.statSync(projectPath);
        if (!stat.isDirectory()) {
            throw new CliError(
                `Cannot create project because '${projectPath}' exists and is not a directory.`
            );
        }

        if (!force) {
            throw new CliError(
                `Directory '${projectPath}' already exists. Re-run with --force to update it.`
            );
        }
    }

    const actions: ProjectAction[] = [];
    if (!projectExists) {
        actions.push({ type: ProjectActionType.CreateDirectory, path: projectPath });
    }

    actions.push({
        type: projectExists && force && fs.existsSync(readmePath) ? ProjectActionType.ReplaceFile : ProjectActionType.WriteFile,
        path: readmePath
    });

    if (!dryRun) {
        if (!projectExists) {
            fs.mkdirSync(projectPath, { recursive: true });
        }

        fs.writeFileSync(readmePath, renderReadme(name), 'utf8');
    }

    return {
        projectName: name,
        projectPath,
        dryRun,
        projectExisted: projectExists,
        actions
    };
}

function validateProjectName(name: string): void {
    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new CliError('Project name cannot be empty.');
    }

    if (name !== trimmedName) {
        throw new CliError('Project name cannot start or end with whitespace.');
    }

    if (path.isAbsolute(name) || name.includes('/') || name.includes('\\')) {
        throw new CliError(
            'Project name must be a simple directory name, not a path.'
        );
    }

    if (name === '.' || name === '..') {
        throw new CliError("Project name cannot be '.' or '..'.");
    }
}

function validateProjectPath(cwd: string, projectPath: string): void {
    const relativePath = path.relative(cwd, projectPath);

    if (relativePath === '..' || relativePath.startsWith('..' + path.sep) || path.isAbsolute(relativePath)) {
        throw new CliError('Project path must stay inside the current working directory.');
    }
}

function renderReadme(projectName: string): string {
    return `# ${projectName}

Generated with the Pion DX CLI.
`;
}
