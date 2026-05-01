#!/usr/bin/env node

import { createProject } from './lib/helpers';

const args = process.argv.slice(2);

if (!args[0] || args.includes('--help')) {
    console.error("Usage: dxcli <project-name>");
    console.error("Options: --dry-run, --force, --help");
    process.exit(1);
}

const name = args[0];

try {
    createProject(name);
    console.log(`Project '${name}' created successfully.`);
} catch (err: any) {
    console.error("Error:", err.message);
    process.exit(1);
}
