import { parseFromSource } from '../../../packages/core/dist/parse-from-source.js';

import { CLASS_CODE } from './sample-codes/class.js';
import { DECORATOR_CODE } from './sample-codes/decorator.js';
import { ENUM_CODE } from './sample-codes/enum.js';
import { FUNCTION_CODE } from './sample-codes/function.js';
import { INTERFACE_CODE } from './sample-codes/interface.js';
import { VARIABLE_CODE } from './sample-codes/variable.js';

import * as ace from 'ace-builds/src-noconflict/ace';
import * as aceTypeScript from 'ace-builds/src-noconflict/mode-typescript';
import * as aceTheme from 'ace-builds/src-noconflict/theme-monokai';

import JSONEditor from 'jsoneditor';

const exampleCodes = {
    class: CLASS_CODE,
    decorator: DECORATOR_CODE,
    enum: ENUM_CODE,
    function: FUNCTION_CODE,
    interface: INTERFACE_CODE,
    variable: VARIABLE_CODE,
};

const CODE_EDITOR_VIEW = 'code-editor';
const JSON_EDITOR_VIEW = 'json-editor';

const selectCodeExampleEl = document.getElementById('select-code-example');

const codeEditorEl = document.getElementById('code-editor');
const jsonEditorEl = document.getElementById('json-editor');

const parseButton = document.getElementById('parse-button');
const changeViewButton = document.getElementById('change-view-button');

const dialogEl = document.getElementById('dialog');
const dialogElCloseButton = document.getElementById('dialog-button-close');

const parseCode = async code => {
    try {
        return (await parseFromSource(code)).result.serialize();
    } catch (error) {
        console.error(error);
        return {};
    }
};

let view = CODE_EDITOR_VIEW;

dialogEl?.showModal();
dialogElCloseButton?.addEventListener('click', () => dialogEl?.close(), { once: true });

const jsonEditor = new JSONEditor(jsonEditorEl, { mode: 'text' });
jsonEditor.set(await parseCode(CLASS_CODE));

const codeEditor = ace.edit(codeEditorEl);
const TypeScriptMode = aceTypeScript.Mode;
codeEditor.session.setMode(new TypeScriptMode());
codeEditor.setTheme(aceTheme);
codeEditor.setOptions({ fontSize: '14pt' });
codeEditor.setValue(CLASS_CODE);
codeEditor.session.selection.clearSelection();

const parse = async () => {
    const code = codeEditor.getValue();
    const metadata = await parseCode(code);

    jsonEditor?.set(metadata);
};

const change = async code => {
    const metadata = await parseCode(code);

    codeEditor.setValue(code);
    codeEditor.session.selection.clearSelection();
    jsonEditor.set(metadata);
};

selectCodeExampleEl?.addEventListener('change', async () => {
    const value = selectCodeExampleEl?.value;
    await change(exampleCodes[value]);
});

parseButton?.addEventListener('click', async () => await parse());

changeViewButton?.addEventListener('click', async () => {
    if (view === CODE_EDITOR_VIEW) {
        view = JSON_EDITOR_VIEW;
        await parse();
    } else {
        view = CODE_EDITOR_VIEW;
    }

    codeEditorEl?.classList.toggle('hidden');
    jsonEditorEl?.classList.toggle('hidden');
});

codeEditorEl?.classList.remove('skeleton');
jsonEditorEl?.classList.remove('skeleton');
changeViewButton?.classList.remove('hidden');
