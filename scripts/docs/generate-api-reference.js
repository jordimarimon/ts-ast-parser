import { DeclarationKind, is, parseFromGlob } from '@ts-ast-parser/core';
import MarkdownIt from 'markdown-it';
import Handlebars from 'handlebars';
import * as path from 'node:path';
import * as fs from 'node:fs';


const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
});

// Handlebars Helpers
Handlebars.registerHelper('firstLetter', str => str[0].toUpperCase());
Handlebars.registerHelper('markdownToHTML', commentPart => {
    const parts = Array.isArray(commentPart)
        ? commentPart
        : typeof commentPart === 'string'
            ? [{kind: 'text', text: commentPart}]
            : [commentPart];

    const markdown = [];
    for (const part of parts) {
        let partMd = '';

        if (part.kind === 'text') {
            partMd = part.text;
        } else {
            partMd = `[${part.targetText || part.target}](${part.target})`;
        }

        markdown.push(partMd);
    }

    let html = md.render(markdown.join(' '));
    html = html.replaceAll(/<a/g, '<a class="prose" target="_blank"');
    html = html.replaceAll(/<code/g, '<code class="code"');
    html = html.replaceAll(/<ul/g, '<ul class="disc"');

    return new Handlebars.SafeString(html);
});
Handlebars.registerHelper('typeWithReference', type => {
    let text = type.text ?? '';
    text = text.replaceAll('<', '&lt;');
    text = text.replaceAll('>', '&gt;');

    return new Handlebars.SafeString(`<code class="code code-accent">${text}</code>`);
});

// Handlebars templates
const { pathname: cwd } = new URL('../..', import.meta.url);
const templatesDir = path.join(cwd, 'scripts', 'docs');
const templateIndexFile = fs.readFileSync(path.join(templatesDir, 'api-reference-index.hbs'), 'utf8');
const templateIndex = Handlebars.compile(templateIndexFile, { noEscape: true });
const templateFunctionFile = fs.readFileSync(path.join(templatesDir, 'function.hbs'), 'utf8');
const templateFunction = Handlebars.compile(templateFunctionFile, { noEscape: true });
const templateClassFile = fs.readFileSync(path.join(templatesDir, 'class.hbs'), 'utf8');
const templateClass = Handlebars.compile(templateClassFile, { noEscape: true });
const templateInterfaceFile = fs.readFileSync(path.join(templatesDir, 'interface.hbs'), 'utf8');
const templateInterface = Handlebars.compile(templateInterfaceFile, { noEscape: true });
const templateEnumFile = fs.readFileSync(path.join(templatesDir, 'enum.hbs'), 'utf8');
const templateEnum = Handlebars.compile(templateEnumFile, { noEscape: true });
const templateVariableFile = fs.readFileSync(path.join(templatesDir, 'variable.hbs'), 'utf8');
const templateVariable = Handlebars.compile(templateVariableFile, { noEscape: true });
const templateTypeAliasFile = fs.readFileSync(path.join(templatesDir, 'type-alias.hbs'), 'utf8');
const templateTypeAlias = Handlebars.compile(templateTypeAliasFile, { noEscape: true });

// Obtain the reflected modules
const indexPath = path.join('packages', 'core', 'src', 'index.ts');
const {project} = await parseFromGlob('packages/core/src/**/*.ts');
const reflectedModules = project?.getModules() ?? [];
const indexModule = reflectedModules.find(mod => mod.getSourcePath() === indexPath);

if (!indexModule) {
    console.error("Couldn't found the index file of the package.");
    process.exit(1);
}

// The modules that are explicitly exported in the entry point of the package
const publicModules = indexModule
    .getExports()
    .filter(is.ReExportNode)
    .map(exp => {
        // Modern ESM imports include the ".js" extension
        const modulePath = exp.getModule().replace(/'/g, '').replace('.js', '.ts');
        return path.join('packages', 'core', 'src', modulePath);
    });

// Here we will store the data for the templates
const models = [];
const utils = [];
const nodes = [];
const types = [];
const parsers = [];

// Clear the directories
clearDir('models');
clearDir('utils');
clearDir('nodes');
clearDir('types');
clearDir('parsers');

// Loop through each reflected module and create the data for the templates
for (const module of reflectedModules) {
    const modulePath = module.getSourcePath();

    if (!publicModules.includes(modulePath)) {
        continue;
    }

    const segments = modulePath.split(path.sep);
    const declarations = module.getDeclarations();
    const fileBaseName = segments[segments.length - 1].replace('.ts', '');
    const category = segments[segments.length - 2];
    const normalizedCategory = category === 'src'
        ? fileBaseName.startsWith('parse-from') ? 'parsers' : 'utils'
        : category;

    for (const declaration of declarations) {
        const name = declaration.getName();
        const kind = declaration.getKind();
        const type = kind.toLowerCase();
        const isConstant = declaration.getName().toUpperCase() === declaration.getName();
        const href = `${normalizedCategory}/${isConstant ? name : toDashCase(name)}`;

        if (normalizedCategory === 'models') {
            models.push({ name, href, type });
        } else if (normalizedCategory === 'utils') {
            utils.push({ name, href, type });
        } else if (normalizedCategory === 'nodes') {
            nodes.push({ name, href, type });
        } else if (normalizedCategory === 'types') {
            types.push({ name, href, type });
        } else if (normalizedCategory === 'parsers') {
            parsers.push({ name, href, type });
        } else {
            continue;
        }

        if (kind === DeclarationKind.Function) {
            createFunction(declaration, normalizedCategory, modulePath);
        } else if (kind === DeclarationKind.Interface) {
            createInterface(declaration, normalizedCategory, modulePath);
        } else if (kind === DeclarationKind.Class) {
            createClass(declaration, normalizedCategory, modulePath);
        } else if (kind === DeclarationKind.Enum) {
            createEnum(declaration, normalizedCategory, modulePath);
        } else if (kind === DeclarationKind.Variable) {
            createVariable(declaration, normalizedCategory, modulePath);
        } else if (kind === DeclarationKind.TypeAlias) {
            createTypeAlias(declaration, normalizedCategory, modulePath);
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
            name: 'Types',
            items: types,
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
        fs.rmSync(path.join(cwd, 'docs', 'api-reference', category), { recursive: true });
    }

    fs.mkdirSync(path.join(cwd, 'docs', 'api-reference', category));
}

function createFunction(func, category, filePath) {
    const context = createFunctionContext(func, filePath);
    const content = templateFunction(context);
    const fileName = toDashCase(func.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createInterface(inter, category, filePath) {
    const jsDoc = inter.getJSDoc();
    const context = {
        name: inter.getName(),
        path: filePath,
        line: inter.getLine(),
        description: jsDoc.getTag('description')?.text ?? '',
        properties: inter.getProperties().map(p => createPropertyContext(p, filePath)),
        methods: inter.getMethods().map(m => createFunctionContext(m, filePath)),
    };

    const content = templateInterface(context);
    const fileName = toDashCase(inter.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createClass(clazz, category, filePath) {
    const jsDoc = clazz.getJSDoc();
    const context = {
        name: clazz.getName(),
        path: filePath,
        line: clazz.getLine(),
        description: jsDoc.getTag('description')?.text ?? '',
        methods: clazz.getMethods().map(m => createFunctionContext(m, filePath)),
    };

    const content = templateClass(context);
    const fileName = toDashCase(clazz.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createEnum(enumerable, category, filePath) {
    const jsDoc = enumerable.getJSDoc();
    const context = {
        name: enumerable.getName(),
        path: filePath,
        line: enumerable.getLine(),
        description: jsDoc.getTag('description')?.text ?? '',
        members: enumerable.getMembers().map(member => ({
            name: member.getName(),
            value: member.getValue(),
            description: member.getJSDoc().getTag('description')?.text ?? '',
        })),
    };

    const content = templateEnum(context);
    const fileName = toDashCase(enumerable.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createVariable(variable, category, filePath) {
    const jsDoc = variable.getJSDoc();
    const isConstant = variable.getName().toUpperCase() === variable.getName();
    const context = {
        name: variable.getName(),
        path: filePath,
        line: variable.getLine(),
        description: jsDoc.getTag('description')?.text ?? '',
        value: variable.getValue(),
    };

    const content = templateVariable(context);
    const fileName = isConstant ? variable.getName() : toDashCase(variable.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createTypeAlias(typeAlias, category, filePath) {
    const jsDoc = typeAlias.getJSDoc();
    const context = {
        name: typeAlias.getName(),
        path: filePath,
        line: typeAlias.getLine(),
        description: jsDoc.getTag('description')?.text ?? '',
        value: typeAlias.getValue().getText(),
    };

    const content = templateTypeAlias(context);
    const fileName = toDashCase(typeAlias.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createFunctionContext(func, filePath) {
    const signature = func.getSignatures()[0];
    const funcJsDoc = func.isArrowFunctionOrFunctionExpression() ? func.getJSDoc() : signature.getJSDoc();
    const returnType = signature.getReturnType();
    const returnTypeDescription = funcJsDoc.getTag('returns')?.text ?? '';
    const typeParameters = signature.getTypeParameters().map(t => {
        return {
            name: t.getName(),
            default: t.getDefault()?.getText() ?? '',
            constraint: t.getConstraint()?.getText() ?? '',
        };
    });
    const parameters = signature.getParameters().map(p => ({
        name: p.getName(),
        description: funcJsDoc.getAllTags('param')?.find(t => t.name === p.getName())?.text ?? '',
        type: {text: p.getType().getText()},
        default: p.getDefault(),
    }));

    const typeParametersStringify = typeParameters.map(t => {
        let result = `${t.name}`;
        if (t.constraint) {
            result += ` extends ${t.constraint}`;
        }
        if (t.default) {
            result += ` = ${t.default}`;
        }
        return result;
    });
    const typeParametersJoined = typeParameters.length ? `<${typeParametersStringify.join(', ')}>` : '';
    const parametersStringify = parameters.map(p => `${p.name}: ${p.type.text}`).join(', ');

    return {
        name: func.getName(),
        path: filePath,
        line: signature.getLine(),
        description: funcJsDoc.getTag('description')?.text ?? '',
        see: funcJsDoc.getAllTags('see'),
        signature: `${func.getName()}${typeParametersJoined}(${parametersStringify}): ${returnType.getText()}`,
        parameters,
        typeParameters,
        returnType: {
            text: returnType.getText(),
            description: returnTypeDescription,
        },
    };
}

function createPropertyContext(property, filePath) {
    return {
        name: property.getName(),
        path: filePath,
        line: property.getLine(),
        description: property.getJSDoc().getTag('description')?.text ?? '',
        see: property.getJSDoc().getAllTags('see'),
        type: {
            text: property.getType().getText(),
        },
        default: property.getDefault(),
        optional: property.isOptional(),
    };
}

function toDashCase(str) {
    const replaceFunc = (match, offset) => {
        const prevChar = str[offset - 1];

        // Don't add a dash between 'TS' or 'JS'
        if ((match === 'S' && prevChar === 'J') || prevChar === 'T') {
            return match.toLowerCase();
        }

        return (offset > 0 ? '-' : '') + match.toLowerCase();
    };

    return str.replace(/[A-Z]/g, replaceFunc);
}
