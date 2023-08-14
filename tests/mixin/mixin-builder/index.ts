// Needed for all mixins
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin builder to be able to concatenate multiple mixins in a nice readable way
export const mix = <TBase extends Constructor>(superclass: TBase): MixinBuilder<TBase> => {
    return new MixinBuilder<TBase>(superclass);
};

// Definition of what a Mixin really is (a function that receives a base class
// that will be extended with some added functionality/behaviour).
export type Mixin = <TBase extends Constructor>(base: TBase) => any;

// The following type defines the "returning type" of a mixin.
// A mixin is defined as a function that expects a base class
// and returns a new class that implements the mixin functionality and extends the base class provided.
export type MixinReturnType<T> = T extends (base: any) => infer R ? R : unknown;

// The following type, receives a collection of N mixins and returns the UNION
// of "the mixins returning types".
// See https://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
export type MixinReturnTypesUnion<Mixins extends Mixin[]> = MixinReturnType<Mixins[number]>;

// The following type converts the UNION of "the mixins returning types"
// into an INTERSECTION of "the mixins returning types"
// See https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-inference-in-conditional-types
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// The following type creates the intersections of all the mixins and the base class.
export type ConcatTypes<Base, Mixins extends Mixin[]> = Base & UnionToIntersection<MixinReturnTypesUnion<Mixins>>;

class MixinBuilder<Base extends Constructor> {
    private readonly _superclass: Base;

    constructor(superclass: Base) {
        this._superclass = superclass;
    }

    with<Mixins extends Mixin[]>(...mixins: [...Mixins]): ConcatTypes<Base, Mixins> {
        return mixins.reduce((c: any, mixin: Mixin) => mixin(c), this._superclass);
    }
}

////////////////////
// Example mixins
////////////////////

// A mixin that adds a property
function Timestamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        timestamp = Date.now();
    };
}

// a mixin that adds a property and methods
function Activable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        isActivated = false;

        activate() {
            this.isActivated = true;
        }

        deactivate() {
            this.isActivated = false;
        }
    };
}

////////////////////
// Usage to compose classes
////////////////////

// Simple User Class
class User {
    name = '';
}

export class TimestampedActivableUser extends mix(User).with(Timestamped, Activable) {
    log(): void {
        console.log('Name: ', this.name);
        console.log('Is Activated: ', this.isActivated);
        console.log('Timestamp: ', this.timestamp);
    }
}

////////////////////
// Using the composed classes
////////////////////

const timestampedActivableUserExample = new TimestampedActivableUser();
timestampedActivableUserExample.activate();
timestampedActivableUserExample.log();
