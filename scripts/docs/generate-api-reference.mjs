import { parseFromGlob, DeclarationKind, JSDocTagName } from '@ts-ast-parser/core';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';


// Handlebars Helpers
Handlebars.registerHelper('firstLetter', str => str[0].toUpperCase());

// Obtain the reflected modules
const reflectedModules = parseFromGlob('packages/core/src/**/*.ts');

// Handlebars templates
const {pathname: cwd} = new URL('../..', import.meta.url);
const templatesDir = path.join(cwd, 'scripts', 'docs');
const templateIndexFile = fs.readFileSync(path.join(templatesDir, 'api-reference-index.hbs'), 'utf8');
const templateIndex = Handlebars.compile(templateIndexFile, {noEscape: true});
const templateFunctionFile = fs.readFileSync(path.join(templatesDir, 'function.hbs'), 'utf8');
const templateFunction = Handlebars.compile(templateFunctionFile, {noEscape: true});
const templateClassFile = fs.readFileSync(path.join(templatesDir, 'class.hbs'), 'utf8');
const templateClass = Handlebars.compile(templateClassFile, {noEscape: true});
const templateInterfaceFile = fs.readFileSync(path.join(templatesDir, 'interface.hbs'), 'utf8');
const templateInterface = Handlebars.compile(templateInterfaceFile, {noEscape: true});
const templateEnumFile = fs.readFileSync(path.join(templatesDir, 'enum.hbs'), 'utf8');
const templateEnum = Handlebars.compile(templateEnumFile, {noEscape: true});
const templateVariableFile = fs.readFileSync(path.join(templatesDir, 'variable.hbs'), 'utf8');
const templateVariable = Handlebars.compile(templateVariableFile, {noEscape: true});
const templateTypeAliasFile = fs.readFileSync(path.join(templatesDir, 'type-alias.hbs'), 'utf8');
const templateTypeAlias = Handlebars.compile(templateTypeAliasFile, {noEscape: true});

// Here we will store the data for the templates
const models = [];
const utils = [];
const nodes = [];
const parsers = [];

// Clear the directories
clearDir('models');
clearDir('utils');
clearDir('nodes');
clearDir('parsers');

// Loop through each reflected module and create the data for the templates
for (const module of reflectedModules) {
    const modulePath = module.getPath();
    const segments = modulePath.split(path.sep);
    const declarations = module.getDeclarations();

    const fileBaseName = segments[segments.length - 1].replace('.ts', '');
    const category = segments[segments.length - 2];
    const normalizedCategory = category === 'src' ? 'parsers' : category;

    for (const declaration of declarations) {
        const name = declaration.getName();
        const kind = declaration.getKind();
        const type = kind.toLowerCase();
        const href = `${normalizedCategory}/${toDashCase(name)}`;

        if (normalizedCategory === 'models') {
            models.push({name, href, type});
        } else if (normalizedCategory === 'utils' || fileBaseName === 'context') {
            utils.push({name, href, type});
        } else if (normalizedCategory === 'nodes') {
            nodes.push({name, href, type});
        } else if (fileBaseName.startsWith('parse-from')) {
            parsers.push({name, href, type});
        } else {
            continue;
        }

        if (kind === DeclarationKind.Function) {
            createFunction(declaration, normalizedCategory);
        } else if (kind === DeclarationKind.Interface) {
            createInterface(declaration, normalizedCategory);
        } else if (kind === DeclarationKind.Class) {
            createClass(declaration, normalizedCategory);
        } else if (kind === DeclarationKind.Enum) {
            createEnum(declaration, normalizedCategory);
        } else if (kind === DeclarationKind.Variable) {
            createVariable(declaration, normalizedCategory);
        } else if (kind === DeclarationKind.TypeAlias) {
            createTypeAlias(declaration, normalizedCategory);
        }
    }
}

// Write the index template
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

function clearDir(category) {
    if (fs.existsSync(path.join(cwd, 'docs', 'api-reference', category))) {
        fs.rmSync(path.join(cwd, 'docs', 'api-reference', category), {recursive: true});
    }

    fs.mkdirSync(path.join(cwd, 'docs', 'api-reference', category));
}

function createFunction(func, category) {
    const context = {
        name: func.getName(),
    };

    const content = templateFunction(context);
    const fileName = toDashCase(func.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createInterface(inter, category) {
    const context = {
        name: inter.getName(),
    };

    const content = templateInterface(context);
    const fileName = toDashCase(inter.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createClass(clazz, category) {
    const context = {
        name: clazz.getName(),
    };

    const content = templateClass(context);
    const fileName = toDashCase(clazz.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createEnum(enumerable, category) {
    const context = {
        name: enumerable.getName(),
    };

    const content = templateEnum(context);
    const fileName = toDashCase(enumerable.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createVariable(variable, category) {
    const jsDoc = variable.getJSDoc();
    const context = {
        name: variable.getName(),
        description: jsDoc.getTag(JSDocTagName.description) ?? '',
    };

    const content = templateVariable(context);
    const fileName = toDashCase(variable.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createTypeAlias(typeAlias, category) {
    const context = {
        name: typeAlias.getName(),
    };

    const content = templateTypeAlias(context);
    const fileName = toDashCase(typeAlias.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function toDashCase(str) {
    const replaceFunc = (match, offset) => {
        const prevChar = str[offset - 1];

        // Don't add a dash between 'TS' or 'JS'
        if (match === 'S' && (prevChar === 'J') || prevChar === 'T') {
            return match.toLowerCase();
        }

        return (offset > 0 ? '-' : '') + match.toLowerCase();
    };

    return str.replace(/[A-Z]/g, replaceFunc);
}
