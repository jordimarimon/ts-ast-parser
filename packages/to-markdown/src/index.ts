import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { root, Children } from 'mdast-builder';
import { Root } from 'mdast';


/**
 *
 *
 * @param tree
 *
 * @return {string}
 */
export function createMarkdown(tree?: Children): string {
    if (!tree) {
        return '';
    }

    return toMarkdown(root(tree) as Root, {
        // Needed so we can have support for creating table nodes and inlineCode nodes
        // See: https://github.com/syntax-tree/mdast#gfm
        extensions: [gfmToMarkdown()],

        handlers: {
            // We want to be able to write raw text without escaping it
            raw: node => node.value || '',

            // To be able to write markdown code blocks
            multiLineCode: node => `\`\`\`typescript\n${  node.value || ''  }\n\`\`\``,
        },
    });
}
