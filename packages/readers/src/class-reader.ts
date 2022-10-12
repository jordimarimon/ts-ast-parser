import { ClassDeclaration, DeclarationKind } from '@ts-ast-parser/core';
import { TypeParameterReader } from './type-parameter-reader.js';
import { ConstructorReader } from './constructor-reader.js';
import { DecoratorReader } from './decorator-reader.js';
import { PropertyReader } from './property-reader.js';
import { FunctionReader } from './function-reader.js';
import { JSDocReader } from './jsdoc-reader.js';


export class ClassReader extends JSDocReader {

    private readonly _decl: ClassDeclaration;

    private readonly _members: (PropertyReader | FunctionReader)[];

    private readonly _typeParams: TypeParameterReader[];

    private readonly _constructors: ConstructorReader[];

    private readonly _decorators: DecoratorReader[];

    constructor(decl: ClassDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
        this._typeParams = (decl.typeParameters ?? []).map(t => new TypeParameterReader(t));
        this._decorators = (decl.decorators ?? []).map(d => new DecoratorReader(d));
        this._constructors = (decl.constructors ?? []).map(d => new ConstructorReader(d));
        this._members = (decl.members || []).map(m => {
            return m.kind === DeclarationKind.method ? new FunctionReader(m) : new PropertyReader(m);
        });
    }

    getKind(): DeclarationKind {
        return DeclarationKind.class;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

    isAbstract(): boolean {
        return !!this._decl.abstract;
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

    getDecorators(): DecoratorReader[] {
        return this._decorators;
    }

    getDecoratorWithName(name: string): DecoratorReader | undefined {
        return this._decorators.find(d => d.getName() === name);
    }

    getConstructors(): ConstructorReader[] {
        return this._constructors;
    }

}
