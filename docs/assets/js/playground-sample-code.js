export const SAMPLE_CODE = `
export enum StatusCodes {
    OK = 200,
    BadRequest = 400,
    Unauthorized,
    PaymentRequired,
    Forbidden,
    NotFound,
}

const enum MouseAction {
    MouseDown,
    MouseUpOutside,
    MouseUpInside,
}

export const handleMouseAction = (action: MouseAction) => {
    switch (action) {
        case MouseAction.MouseDown:
            console.log("Mouse Down");
            break;
    }
};

export type BirdType = {
  wings: 2;
};

export interface BirdInterface {
  wings: 2;
}

export const bird1: BirdType = { wings: 2 };
export const bird2: BirdInterface = { wings: 2 };

// Named function
function add(x: number, y: number): number {
  return x + y;
}

// Anonymous function
let myAdd = function (x: number, y: number) {
  return x + y;
};
`;
