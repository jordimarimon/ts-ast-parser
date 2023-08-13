import { exportAssignmentFactory, exportDeclarationFactory, exportStatementFactory } from './create-export.js';
import { typeAliasFactory } from './create-type-alias.js';
import { interfaceFactory } from './create-interface.js';
import { functionFactory } from './create-function.js';
import { variableFactory } from './create-variable.js';
import { importFactory } from './create-import.js';
import { classFactory } from './create-class.js';
import { enumFactory } from './create-enum.js';


export const declarationFactories = [
    functionFactory,
    classFactory,
    variableFactory,
    enumFactory,
    typeAliasFactory,
    interfaceFactory,
];

export const exportFactories = [exportDeclarationFactory, exportAssignmentFactory, exportStatementFactory];

export { importFactory };
