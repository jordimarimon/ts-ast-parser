import { TypeParameter } from '../models/type-parameter.js';
import { tryAddProperty } from './try-add-property.js';
import { NodeWithTypeParameter } from './types.js';


export function getTypeParameters(node: NodeWithTypeParameter): TypeParameter[] {
    return node?.typeParameters?.map(t => {
        const tmpl: TypeParameter = {
            name: t.name?.getText() || '',
        };

        tryAddProperty(tmpl, 'default', t.default?.getText() || '');

        return tmpl;
    }) ?? [];
}
