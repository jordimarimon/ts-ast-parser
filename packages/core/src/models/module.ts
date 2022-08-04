import { Declaration } from './declaration';
import { Export } from './export';
import { Import } from './import';


export interface Module {
    path: string;
    declarations: Declaration[];
    imports: Import[];
    exports: Export[];
}
