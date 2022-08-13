import { parseFromSource } from '../../../packages/core/dist/parse-from-source.js';

import * as ace from 'ace-builds/src-noconflict/ace';
import * as aceTypeScript from 'ace-builds/src-noconflict/mode-typescript';
import * as aceTheme from 'ace-builds/src-noconflict/theme-monokai';

import JSONEditor from 'jsoneditor';

function main() {
    const codeEditorEl = document.getElementById('code-editor');
    const jsonEditorEl = document.getElementById('json-editor');
    const parseButton = document.getElementById('parse-button');

    if (!codeEditorEl || !jsonEditorEl || !parseButton) {
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

    parseButton.addEventListener('click', () => {
        const code = codeEditor.getValue();
        const metadata = parseFromSource(code);

        jsonEditor.set(metadata);
    });
}

main();
