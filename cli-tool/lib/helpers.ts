
import * as fs from 'fs';
import * as path from 'path';

export function createProject(name: string): void {
    const projectPath = path.join(process.cwd(), name);
    if (fs.existsSync(projectPath)) {
        throw new Error("Directory already exists.");
    }
    fs.mkdirSync(projectPath);
    fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${name}`);
}
