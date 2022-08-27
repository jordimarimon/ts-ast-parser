export const VARIABLE_CODE = `
export type BirdType = {
    wings: 2;
};

export interface BirdInterface {
    wings: 2;
}

export const bird1: BirdType = { wings: 2 };
export const bird2: BirdInterface = { wings: 2 };

export { bird2 as bird3 };
`;
