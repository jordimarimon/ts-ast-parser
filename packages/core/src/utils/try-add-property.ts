export function tryAddProperty<T extends {}, K extends keyof T>(
    obj: T,
    key: K,
    value: T[K] | undefined | null,
): void {
    if (obj == null || value == null) {
        return;
    }

    if (typeof value === 'boolean') {
        if (value) {
            obj[key] = value;
        }
    } else if (typeof value === 'string') {
        if (value !== '') {
            obj[key] = value;
        }
    } else if (Array.isArray(value)) {
        if (value.length) {
            obj[key] = value;
        }
    } else if (isObject(value)) {
        if (Object.keys(value).length) {
            obj[key] = value;
        }
    } else { // number
        obj[key] = value;
    }
}

function isObject<T = Record<string, unknown>>(obj: unknown): obj is T {
    return obj != null && Object.prototype.toString.call(obj) === '[object Object]';
}
