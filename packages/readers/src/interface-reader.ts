import { DeclarationKind, InterfaceDeclaration } from '@ts-ast-parser/core';
import { TypeParameterReader } from './type-parameter-reader.js';
import { PropertyReader } from './property-reader.js';
import { FunctionReader } from './function-reader.js';
import { JSDocReader } from './jsdoc-reader.js';


export class InterfaceReader extends JSDocReader {

    private readonly _decl: InterfaceDeclaration;

    private readonly _members: (PropertyReader | FunctionReader)[];

    private readonly _typeParams: TypeParameterReader[];

    constructor(decl: InterfaceDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
        this._typeParams = (decl.typeParameters ?? []).map(t => new TypeParameterReader(t));
        this._members = (decl.members || []).map(m => {
            return m.kind === DeclarationKind.method ? new FunctionReader(m) : new PropertyReader(m);
        });
    }

    getKind(): DeclarationKind {
        return DeclarationKind.interface;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

    getAllMembers(): (PropertyReader | FunctionReader)[] {
        return this._members;
    }

    getAllProperties(): PropertyReader[] {
        return this._members.filter(m => m.getKind() === DeclarationKind.field) as PropertyReader[];
    }

    getAllMethods(): FunctionReader[] {
        return this._members.filter(m => m.getKind() === DeclarationKind.method) as FunctionReader[];
    }

    getMemberWithName(name: string): PropertyReader | FunctionReader | undefined {
        return this._members.find(m => m.getName() === name);
    }

    getPropertyWithName(name: string): PropertyReader | undefined {
        return this._members.find(m => {
            return m.getName() === name && m.getKind() === DeclarationKind.field;
        }) as PropertyReader;
    }

    getMethodWithName(name: string): FunctionReader | undefined {
        return this._members.find(m => {
            return m.getName() === name && m.getKind() === DeclarationKind.method;
        }) as FunctionReader;
    }

    getTypeParameters(): TypeParameterReader[] {
        return this._typeParams;
    }

    hasHeritage(): boolean {
        return !!this._decl.heritage?.length;
    }

    getParentInterfaceName(): string {
        return this._decl.heritage?.[0]?.name ?? '';
    }

    getParentInterfaceSourceReference(): string {
        return this._decl.heritage?.[0]?.source?.path ?? '';
    }

}
