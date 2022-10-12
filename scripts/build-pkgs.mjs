import { buildSync } from 'esbuild';
import path from 'path';
import fs from 'fs';

const pkgs = fs
    .readdirSync(path.join(process.cwd(), 'packages'), {withFileTypes: true})
    .filter(d => d.isDirectory())
    .map(d => d.name);

for (const pkg of pkgs) {
    const dir = path.join(process.cwd(), 'packages', pkg);

    buildSync({
        entryPoints: [path.join(dir, 'src', 'index.ts')],
        outfile: path.join(dir, 'dist', 'index.cjs'),
        minify: true,
        sourcemap: false,
        bundle: true,
        format: 'cjs',
        target: 'node12.20.0',
        platform: 'node',
    });
}
