export type Colors = 'red' | 'green' | 'blue';

export type RGB = [red: number, green: number, blue: number];

export const palette = {
    red: [255, 0, 0],
    green: '#00ff00',
    blue: [0, 0, 255],
} satisfies Record<Colors, string | RGB>;


export const redComponent = palette.red.at(0);
export const greenNormalized = palette.green.toUpperCase();
