import { DeclarationKind, is, JSDocTagName, parseFromGlob } from '@ts-ast-parser/core';
import { markedSmartypants } from 'marked-smartypants';
import Handlebars from 'handlebars';
import { marked } from 'marked';
import path from 'path';
import fs from 'fs';

marked.use(markedSmartypants());
marked.use({
    breaks: false,
    gfm: true,
    headerIds: false,
    mangle: false,
});

// Handlebars Helpers
Handlebars.registerHelper('firstLetter', str => str[0].toUpperCase());
Handlebars.registerHelper('markdownToHTML', (str, inline) => {
    let html = inline ? marked.parseInline(str ?? '') : marked.parse(str ?? '');
    html = html.replaceAll(/<a/g, '<a class="prose" target="_blank"');
    html = html.replaceAll(/<code/g, '<code class="code"');

    return new Handlebars.SafeString(html);
});
Handlebars.registerHelper('typeWithReference', type => {
    let text = type.text ?? '';
    text = text.replaceAll('<', '&lt;');
    text = text.replaceAll('>', '&gt;');

    return new Handlebars.SafeString(`<code class="code code-accent">${text}</code>`);
});

// Obtain the reflected modules
const { result: reflectedModules } = await parseFromGlob('packages/core/src/**/*.ts');

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

const indexPath = path.join('packages', 'core', 'src', 'index.ts');
const indexModule = reflectedModules.find(mod => mod.getSourcePath() === indexPath);

if (!indexModule) {
    console.error("Couldn't found the index file of the package.");
    process.exit(1);
}

const publicFiles = indexModule
    .getExports()
    .filter(exp => is.ReExportNode(exp))
    .map(exp => {
        const modulePath = exp.getModule().replace(/'/g, '');
        return path.join('packages', 'core', 'src', modulePath);
    });

// Loop through each reflected module and create the data for the templates
for (const module of reflectedModules) {
    const modulePath = module.getSourcePath();

    if (!publicFiles.includes(modulePath.replace('.ts', '.js'))) {
        continue;
    }

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
            models.push({ name, href, type });
        } else if (
            normalizedCategory === 'utils' ||
            (normalizedCategory === 'parsers' && !fileBaseName.startsWith('parse-from'))
        ) {
            utils.push({ name, href, type });
        } else if (normalizedCategory === 'nodes') {
            nodes.push({ name, href, type });
        } else if (fileBaseName.startsWith('parse-from')) {
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
        description: jsDoc.getTag(JSDocTagName.description)?.getValue() ?? '',
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
        description: jsDoc.getTag(JSDocTagName.description)?.getValue() ?? '',
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
        description: jsDoc.getTag(JSDocTagName.description)?.getValue() ?? '',
        members: enumerable.getMembers().map(member => ({
            name: member.getName(),
            value: member.getValue(),
            description: member.getJSDoc().getTag(JSDocTagName.description)?.getValue() ?? '',
        })),
    };

    const content = templateEnum(context);
    const fileName = toDashCase(enumerable.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createVariable(variable, category, filePath) {
    const jsDoc = variable.getJSDoc();
    const context = {
        name: variable.getName(),
        path: filePath,
        line: variable.getLine(),
        description: jsDoc.getTag(JSDocTagName.description)?.getValue() ?? '',
        value: variable.getValue(),
    };

    const content = templateVariable(context);
    const fileName = toDashCase(variable.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createTypeAlias(typeAlias, category, filePath) {
    const jsDoc = typeAlias.getJSDoc();
    const context = {
        name: typeAlias.getName(),
        path: filePath,
        line: typeAlias.getLine(),
        description: jsDoc.getTag(JSDocTagName.description)?.getValue() ?? '',
        value: typeAlias.getValue(),
    };

    const content = templateTypeAlias(context);
    const fileName = toDashCase(typeAlias.getName());

    fs.writeFileSync(path.join(cwd, 'docs', 'api-reference', category, `${fileName}.njk`), content);
}

function createFunctionContext(func, filePath) {
    const signature = func.getSignatures()[0];
    const funcJsDoc = func.isArrowFunctionOrFunctionExpression() ? func.getJSDoc() : signature.getJSDoc();
    const returnType = signature.getReturnType();
    const returnTypeDescription = funcJsDoc.getTag(JSDocTagName.returns)?.getValue() ?? '';
    const parameters = signature.getParameters().map(p => ({
        name: p.getName(),
        description:
            funcJsDoc
                .getAllTags(JSDocTagName.param)
                ?.find(t => t.getName() === p.getName())
                ?.getDescription() ?? '',
        type: {
            text: p.getType().getText(),
        },
        default: p.getDefault(),
    }));

    return {
        name: func.getName(),
        path: filePath,
        line: signature.getLine(),
        description: funcJsDoc.getTag(JSDocTagName.description)?.getValue() ?? '',
        signature: `${func.getName()}(${parameters
            .map(p => `${p.name}: ${p.type.text}`)
            .join(', ')}): ${returnType.getText()}`,
        parameters,
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
        description: property.getJSDoc().getTag(JSDocTagName.description)?.getValue() ?? '',
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
