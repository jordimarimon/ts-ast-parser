import { PropertyLike } from './property.js';


export interface Parameter extends PropertyLike {
    rest?: boolean;
}
