import { PropertyLike } from './property';


export interface Parameter extends PropertyLike {
    optional?: boolean;
    rest?: boolean;
}
