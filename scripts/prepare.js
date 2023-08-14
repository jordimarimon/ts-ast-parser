import * as cp from 'child_process';
import * as fs from 'fs';


// Execute Git command
const git = args => cp.spawnSync('git', args, { stdio: 'inherit' });

// Ensure that we're inside a Git repository
// If git command is not found, status is null and we should return
// That's why status value needs to be checked explicitly
if (git(['rev-parse']).status !== 0) {
    throw new Error('git command not found, skipping install');
}

// Ensure that cwd is git top level
if (!fs.existsSync('.git')) {
    throw new Error('.git can\'t be found');
}

const { error } = git(['config', 'core.hooksPath', '.hooks']);

if (error) {
    throw error;
}
