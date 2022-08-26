import { exportAssignmentFactory, exportDeclarationFactory, exportKeywordFactory } from './create-export.js';
import { typeAliasFactory } from './create-type-alias.js';
import { interfaceFactory } from './create-interface.js';
import { variableFactory } from './create-variable.js';
import { functionFactory } from './create-function.js';
import { importFactory } from './create-import.js';
import { classFactory } from './create-class.js';
import { enumFactory } from './create-enum.js';


export default [
    importFactory,
    functionFactory,
    variableFactory,
    enumFactory,
    typeAliasFactory,
    classFactory,
    interfaceFactory,
    exportKeywordFactory,
    exportDeclarationFactory,
    exportAssignmentFactory,
];
