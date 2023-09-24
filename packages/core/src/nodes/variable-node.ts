import { createTypeFromDeclaration } from '../factories/create-type.js';
import { resolveExpression } from '../utils/resolve-expression.js';
import type { VariableDeclaration } from '../models/variable.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import type { DeclarationNode } from './declaration-node.js';
import type { ReflectedNode } from '../reflected-node.js';
import { getDecorators } from '../utils/decorator.js';
import { getNamespace } from '../utils/namespace.js';
import { DecoratorNode } from './decorator-node.js';
import { RootNodeType } from '../models/node.js';
import { CommentNode } from './comment-node.js';
import type { Type } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of a variable declaration
 */
export class VariableNode implements DeclarationNode<VariableDeclaration, ts.VariableDeclaration> {

    private readonly _node: ts.VariableStatement;

    private readonly _declaration: ts.VariableDeclaration;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode;

    constructor(node: ts.VariableStatement, declaration: ts.VariableDeclaration, context: ProjectContext) {
        this._node = node;
        this._declaration = declaration;
        this._context = context;
        this._jsDoc = new CommentNode(this._node);
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getName(): string {
        return this._declaration.name.getText() ?? '';
    }

    getTSNode(): ts.VariableDeclaration {
        return this._declaration;
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Declaration;
    }

    getKind(): DeclarationKind.Variable {
        return DeclarationKind.Variable;
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    getType(): ReflectedNode<Type> {
        return createTypeFromDeclaration(this._declaration, this._context);
    }

    getValue(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getTag('default')?.text;
        return jsDocDefaultValue ?? resolveExpression(this._declaration.initializer, this._context);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): VariableDeclaration {
        const defaultValue = this.getValue();
        const tmpl: VariableDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            type: this.getType().serialize(),
        };

        if (defaultValue !== '') {
            tmpl.default = defaultValue;
        }

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'namespace', this.getNamespace());

        return tmpl;
    }
}
