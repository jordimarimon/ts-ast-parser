import { Module } from '../models/index.js';
import ts from 'typescript';


export interface NodeFactory<T extends ts.Node = ts.Node> {

    isNode: (node: ts.Node) => node is T;

    create: (node: T, moduleDoc: Module) => void;

}
