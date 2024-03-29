import { globbySync } from 'globby';
import * as path from 'node:path';
import * as fs from 'node:fs';
import chalk from 'chalk';


const mainPkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const packages = globbySync(path.join('packages/*', 'package.json'));

for (const pkgPath of packages) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    console.log(chalk.blue(`Checking package ${pkg.name}`));

    let hasChanged = false;
    if (pkg?.dependencies) {
        hasChanged = update(pkg.dependencies);
    }

    if (!hasChanged) {
        continue;
    }

    console.log(`\tWriting new package.json`);

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n', 'utf8');
}

function update(dependencies) {
    const isWorkspacePkg = name => name.startsWith('@ts-ast-parser');

    let hasChanged = false;

    for (const [pkg, oldVersion] of Object.entries(dependencies)) {
        const newVersion = isWorkspacePkg(pkg)
            ? oldVersion
            : mainPkg.dependencies?.[pkg] || mainPkg.optionalDependencies?.[pkg] || mainPkg.devDependencies?.[pkg];

        if (oldVersion !== newVersion) {
            dependencies[pkg] = newVersion;
            console.log(chalk.green(`\tUpdating ${pkg} from ${oldVersion} to ${newVersion}`));
            hasChanged = true;
        }
    }

    return hasChanged;
}
