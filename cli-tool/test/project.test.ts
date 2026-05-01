import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createProject } from '../lib/project';

function withTempDir(run: (dir: string) => void): void {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dxcli-'));

    try {
        run(dir);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

test('creates a project directory with a README', () => {
    withTempDir((dir) => {
        const result = createProject('web-app', { cwd: dir });
        const readmePath = path.join(dir, 'web-app', 'README.md');

        assert.equal(result.projectName, 'web-app');
        assert.equal(result.projectExisted, false);
        assert.equal(fs.existsSync(readmePath), true);
        assert.match(fs.readFileSync(readmePath, 'utf8'), /^# web-app/);
    });
});

test('dry run reports actions without writing to disk', () => {
    withTempDir((dir) => {
        const result = createProject('web-app', { cwd: dir, dryRun: true });

        assert.equal(result.dryRun, true);
        assert.deepEqual(
            result.actions.map((action) => action.type),
            ['create-directory', 'write-file']
        );
        assert.equal(fs.existsSync(path.join(dir, 'web-app')), false);
    });
});

test('fails when the project directory exists without force', () => {
    withTempDir((dir) => {
        fs.mkdirSync(path.join(dir, 'web-app'));

        assert.throws(
            () => createProject('web-app', { cwd: dir }),
            /already exists/
        );
    });
});

test('force updates an existing project directory', () => {
    withTempDir((dir) => {
        const projectPath = path.join(dir, 'web-app');
        const readmePath = path.join(projectPath, 'README.md');
        fs.mkdirSync(projectPath);
        fs.writeFileSync(readmePath, 'old content', 'utf8');

        const result = createProject('web-app', { cwd: dir, force: true });

        assert.equal(result.projectExisted, true);
        assert.deepEqual(
            result.actions.map((action) => action.type),
            ['replace-file']
        );
        assert.match(fs.readFileSync(readmePath, 'utf8'), /^# web-app/);
    });
});

test('dry run with force on existing project reports update without writing', () => {
    withTempDir((dir) => {
        const projectPath = path.join(dir, 'web-app');
        fs.mkdirSync(projectPath);

        const result = createProject('web-app', { cwd: dir, dryRun: true, force: true });

        assert.equal(result.dryRun, true);
        assert.equal(result.projectExisted, true);
        assert.deepEqual(
            result.actions.map((a) => a.type),
            ['write-file']
        );
        assert.equal(fs.existsSync(path.join(projectPath, 'README.md')), false);
    });
});

test('rejects path-like project names', () => {
    withTempDir((dir) => {
        assert.throws(
            () => createProject('../web-app', { cwd: dir }),
            /simple directory name/
        );
    });
});

test('allows names that start with dots but are not traversal', () => {
    withTempDir((dir) => {
        const result = createProject('...', { cwd: dir, dryRun: true });
        assert.equal(result.projectName, '...');
    });
});
