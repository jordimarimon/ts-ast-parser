import { TypeAliasReader } from './type-alias-reader.js';
import { InterfaceReader } from './interface-reader.js';
import { FunctionReader } from './function-reader.js';
import { VariableReader } from './variable-reader.js';
import { ClassReader } from './class-reader.js';
import { MixinReader } from './mixin-reader.js';
import { EnumReader } from './enum-reader.js';


export type DeclarationReader = ClassReader |
    FunctionReader |
    EnumReader |
    InterfaceReader |
    TypeAliasReader |
    VariableReader |
    MixinReader;
