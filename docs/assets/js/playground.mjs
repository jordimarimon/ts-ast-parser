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

const parseCode = code => {
    try {
        return parseFromSource(code).serialize();
    } catch (error) {
        console.error(error);
        return {};
    }
};

let view = CODE_EDITOR_VIEW;

dialogEl?.showModal();
dialogElCloseButton?.addEventListener('click', () => dialogEl?.close(), {once: true});

const jsonEditor = new JSONEditor(jsonEditorEl, {mode: 'view'});
jsonEditor.set(parseCode(CLASS_CODE));

const codeEditor = ace.edit(codeEditorEl);
const TypeScriptMode = aceTypeScript.Mode;
codeEditor.session.setMode(new TypeScriptMode());
codeEditor.setTheme(aceTheme);
codeEditor.setOptions({fontSize: '14pt'});
codeEditor.setValue(CLASS_CODE);
codeEditor.session.selection.clearSelection();

const parse = () => {
    const code = codeEditor.getValue();
    const metadata = parseCode(code);

    jsonEditor?.set(metadata);
};

const change = (code) => {
    const metadata = parseCode(code);

    codeEditor.setValue(code);
    codeEditor.session.selection.clearSelection();
    jsonEditor.set(metadata);
};

selectCodeExampleEl?.addEventListener('change', () => {
    const value = selectCodeExampleEl?.value;
    change(exampleCodes[value]);
});

parseButton?.addEventListener('click', parse);

changeViewButton?.addEventListener('click', () => {
    if (view === CODE_EDITOR_VIEW) {
        view = JSON_EDITOR_VIEW;
        parse();
    } else {
        view = CODE_EDITOR_VIEW;
    }

    codeEditorEl?.classList.toggle('hidden');
    jsonEditorEl?.classList.toggle('hidden');
});

codeEditorEl?.classList.remove('skeleton');
jsonEditorEl?.classList.remove('skeleton');
changeViewButton?.classList.remove('hidden');
