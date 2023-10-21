import type { TypeA } from './type-a.js';
import { type TypeB } from './type-b.js';


const x: TypeA = { foo: 'bar' };

export default x;
export const y: TypeB = {bar: 'foo'};
