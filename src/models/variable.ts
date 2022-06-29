import { SourceReference } from './reference';
import { PropertyLike } from './property';


export interface VariableDeclaration extends PropertyLike {
    kind: 'variable';
    source?: SourceReference;
}
