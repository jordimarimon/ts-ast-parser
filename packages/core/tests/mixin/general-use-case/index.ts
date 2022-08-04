// Needed for all mixins
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
type Constructor<T = {}> = new (...args: any[]) => T;

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

// Simple class
class User {
    name = '';
}

// User that is Timestamped
export class TimestampedUser extends Timestamped(User) {}

// User that is Timestamped and Activable
export class TimestampedActivableUser extends Timestamped(Activable(User)) {}

////////////////////
// Using the composed classes
////////////////////

const timestampedUserExample = new TimestampedUser();
console.log(timestampedUserExample.timestamp);

const timestampedActivableUserExample = new TimestampedActivableUser();
console.log(timestampedActivableUserExample.timestamp);
console.log(timestampedActivableUserExample.isActivated);
