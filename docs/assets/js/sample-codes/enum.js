export const ENUM_CODE = `
export enum StatusCodes {
    OK = 200,
    BadRequest = 400,
    Unauthorized,
    PaymentRequired,
    Forbidden,
    NotFound,
}

export const enum Direction {
    Up = 1,
    Down,
    Left,
    Right,
}

export enum BooleanLikeHeterogeneousEnum {
    No = 0,
    Yes = 'YES',
}
`;
