/* eslint-disable */
import ts from 'typescript';


// We need this, to compile in older versions of TS when we execute the tests in CI
export namespace ts4_8 {
    function canHaveModifiers(node: ts.Node): boolean;
    function canHaveDecorators(node: ts.Node): boolean;
    function getDecorators(node: ts.Node): readonly ts.Decorator[] | undefined;
    function getModifiers(node: ts.Node): readonly ts.Modifier[] | undefined;
}
