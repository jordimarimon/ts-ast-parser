import { PropertyLike } from './property.js';


export interface Parameter extends PropertyLike {
    optional?: boolean;
    rest?: boolean;
}
