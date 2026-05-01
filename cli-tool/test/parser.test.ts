import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../lib/parser';
import { CliError } from '../lib/errors';

test('parses a project name with default options', () => {
    assert.deepEqual(parseArgs(['web-app']), {
        projectName: 'web-app',
        dryRun: false,
        force: false,
        help: false,
        version: false
    });
});

test('parses flags in any position', () => {
    assert.deepEqual(parseArgs(['--dry-run', 'web-app', '--force']), {
        projectName: 'web-app',
        dryRun: true,
        force: true,
        help: false,
        version: false
    });
});

test('allows help without a project name', () => {
    assert.deepEqual(parseArgs(['--help']), {
        dryRun: false,
        force: false,
        help: true,
        version: false
    });
});

test('allows version without a project name', () => {
    assert.deepEqual(parseArgs(['--version']), {
        dryRun: false,
        force: false,
        help: false,
        version: true
    });
});

test('allows -v as short form of --version', () => {
    assert.deepEqual(parseArgs(['-v']), {
        dryRun: false,
        force: false,
        help: false,
        version: true
    });
});

test('rejects missing project names', () => {
    assert.throws(() => parseArgs([]), CliError);
});

test('rejects unknown flags', () => {
    assert.throws(() => parseArgs(['web-app', '--template']), /Unknown option/);
});

test('rejects multiple project names', () => {
    assert.throws(() => parseArgs(['web-app', 'api']), /Unexpected argument/);
});
