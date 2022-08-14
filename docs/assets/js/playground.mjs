import { parseFromSource } from '../../../packages/core/dist/parse-from-source.js';

import { SAMPLE_CODE } from './sample-code.js';

import * as ace from 'ace-builds/src-noconflict/ace';
import * as aceTypeScript from 'ace-builds/src-noconflict/mode-typescript';
import * as aceTheme from 'ace-builds/src-noconflict/theme-monokai';

import JSONEditor from 'jsoneditor';


function main() {
    const CODE_EDITOR_VIEW = 'code-editor';
    const JSON_EDITOR_VIEW = 'json-editor';

    const codeEditorEl = document.getElementById('code-editor');
    const jsonEditorEl = document.getElementById('json-editor');

    const parseButton = document.getElementById('parse-button');
    const changeViewButton = document.getElementById('change-view-button');

    const dialogEl = document.getElementById('dialog');
    const dialogElCloseButton = document.getElementById('dialog-button-close');

    let view = CODE_EDITOR_VIEW;

    if (dialogEl) {
        dialogEl.showModal();
    }

    if (dialogElCloseButton) {
        const cb = () => {
            dialogEl?.close();
            dialogElCloseButton?.removeEventListener('click', cb);
        };

        dialogElCloseButton.addEventListener('click', cb);
    }

    if (!codeEditorEl || !jsonEditorEl || !parseButton || !changeViewButton) {
        return;
    }

    const jsonEditor = new JSONEditor(jsonEditorEl, {
        mode: 'view',
    });
    const codeEditor = ace.edit(codeEditorEl);
    const TypeScriptMode = aceTypeScript.Mode;

    codeEditor.session.setMode(new TypeScriptMode());
    codeEditor.setTheme(aceTheme);
    codeEditor.setOptions({
        fontSize: '16pt',
    });

    codeEditor.setValue(SAMPLE_CODE);
    codeEditor.session.selection.clearSelection();
    jsonEditor.set(parseFromSource(SAMPLE_CODE));

    const parse = () => {
        const code = codeEditor.getValue();
        const metadata = parseFromSource(code);

        jsonEditor.set(metadata);
    };

    parseButton.addEventListener('click', parse);

    changeViewButton.addEventListener('click', () => {
        if (view === CODE_EDITOR_VIEW) {
            view = JSON_EDITOR_VIEW;
            parse();
        } else {
            view = CODE_EDITOR_VIEW;
        }

        codeEditorEl.classList.toggle('hidden');
        jsonEditorEl.classList.toggle('hidden');
    });

    codeEditorEl.classList.remove('skeleton');
    jsonEditorEl.classList.remove('skeleton');
}

main();
