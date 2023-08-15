import { parseFromSource } from '../../../packages/core/dist/parse-from-source.js';
import Prism from 'prismjs';

import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-json.js';

Prism.manual = true;

const origin = window.location.origin;
const pathName = window.location.pathname.startsWith('/ts-ast-parser/') ? '/ts-ast-parser' : '';

class Preview extends HTMLElement {
    #isRendered = false;

    #outputEl = null;

    #sourceEl = null;

    static get observedAttributes() {
        return ['src'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.#isRendered) {
            this.innerHTML = `
                <section class="container">
                    <p class="text-md my-2">
                        Given the following code:
                    </p>

                    <div class="source-code"></div>

                    <p class="text-md my-2">
                        The output information in JSON format will look like:
                    </p>

                    <div class="reflected-output"></div>
                </section>
            `;

            this.#sourceEl = this.querySelector('.source-code');
            this.#outputEl = this.querySelector('.reflected-output');

            this.#render();
            this.#isRendered = true;
        }
    }

    attributeChangedCallback() {
        if (!this.#isRendered) {
            return;
        }

        this.#render();
    }

    #render() {
        const src = this.getAttribute('src');

        this.setAttribute('loading', '');

        fetch(`${origin}${pathName}/assets/previews/${src}`)
            .then(response => response.text())
            .then(async code => {
                const { project } = await parseFromSource(code);
                return [code, project];
            })
            .then(([code, project]) => {
                const serializedNodes = JSON.stringify(project.getModules().map(m => m.serialize()), null, 4);
                const sourceCode = Prism.highlight(code, Prism.languages.typescript, 'typescript');
                const json = Prism.highlight(serializedNodes, Prism.languages.json, 'json');

                this.#sourceEl.innerHTML = `<pre class="language-ts"><code class="language-ts">${sourceCode}</code></pre>`;
                this.#outputEl.innerHTML = `<pre class="language-json"><code class="language-json">${json}</code></pre>`;

                this.removeAttribute('loading');
            })
            .catch(error => {
                console.error(error);
            });
    }
}

window.customElements.define('preview-component', Preview);
