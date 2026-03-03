export enum Colors {
  Blue = "blue",
  Green = "green",
  Orange = "orange",
  Red = "red",
  Yellow = "yellow",
}

export type Candy = {
  readonly color: Colors;
  x: number;
  y: number;
  size: number
};

export type CandyIndex = {
  x: number;
  y: number;
};

export function makeCandy(color: Colors, x: number, y: number, size: number): Candy {
  return {
    color,
    x,
    y,
    size
  };
}
