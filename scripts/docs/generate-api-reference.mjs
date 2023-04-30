import { parseFromGlob } from '@ts-ast-parser/core';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';


const reflectedModules = parseFromGlob('packages/core/src/**/*.ts');

const {pathname: cwd} = new URL('../..', import.meta.url);

const templateIndexStr = fs.readFileSync(path.join(cwd, 'scripts', 'docs', 'api-reference-index.hbs'), 'utf8');
const templateIndex = Handlebars.compile(templateIndexStr, {noEscape: true});

const models = [];
const utils = [];
const nodes = [];
const parsers = [];

for (const module of reflectedModules) {
    const modulePath = module.getPath();
    const segments = modulePath.split(path.sep);
    const declarations = module.getDeclarations();

    const fileBaseName = segments[segments.length - 1].replace('.ts', '');
    const href = `${segments[segments.length - 2]}/${fileBaseName}`;
    const category = segments[segments.length - 2];

    for (const declaration of declarations) {
        const name = declaration.getName();

        if (category === 'models') {
            models.push({name, href});
        } else if (category === 'utils') {
            utils.push({name, href});
        } else if (category === 'nodes') {
            nodes.push({name, href});
        } else if (fileBaseName.startsWith('parse-from')) {
            parsers.push({name, href: fileBaseName});
        }
    }
}

const indexContent = templateIndex({
    categories: [
        {
            name: 'Parsers',
            items: parsers,
        },
        {
            name: 'Models',
            items: models,
        },
        {
            name: 'Nodes',
            items: nodes,
        },
        {
            name: 'Utils',
            items: utils,
        },
    ],
});
fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', 'index.njk'), indexContent);

//////////////////////////////////////////////////////////////////////////////
/////////// FUNCTIONS
//////////////////////////////////////////////////////////////////////////////
