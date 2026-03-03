import { Colors, makeCandy, type Candy, type CandyIndex } from "./Candy.ts";

import { SETTINGS } from "../settings.ts";

export type Grid = Array<Column>;
export type Column = Array<Candy | null>;

type ToDrop = {
  from: Candy;
  y_dest: number;
};

export default class Model {
  private _grid: Grid;
  private _score: number;
  private _selected_index: CandyIndex | null;

  constructor() {
    this._grid = new Array(SETTINGS.nb_candies);

    for (let i = 0; i < SETTINGS.nb_candies; i++)
      this._grid[i] = new Array(SETTINGS.nb_candies);

    this._score = 0;
    this._selected_index = null;

    // On remplit la grille aléatoirement
    for (let x = 0; x < SETTINGS.nb_candies; x++) {
      for (let y = 0; y < SETTINGS.nb_candies; y++) {
        this._grid[x][y] = makeCandy(
          this.randomColor(),
          x * SETTINGS.candy_size(),
          y * SETTINGS.candy_size(),
          SETTINGS.candy_size(),
        );
      }
    }

    // Puis on boucle en retirant les matchs jusqu'à
    // avoir une grille sans match

    // La aussi j'aurais bien fais une méthode exprès
    // pour ça, mais c'est pas dans le plan de base

    let all_match = this.checkAllMatches();

    while (all_match) {
      this.removeMatches(all_match).forEach((drop) => {
        drop.from.y = drop.y_dest;
      });

      all_match = this.checkAllMatches();
    }

    this._score = 0;
  }

  randomColor(): Colors {
    const array = Object.values(Colors);
    const index = Math.floor(Math.random() * array.length);
    return array[index];
  }

  checkAllMatches(): CandyIndex[] | null {
    let out: CandyIndex[] = [];

    for (let x = 0; x < SETTINGS.nb_candies; x++) {
      for (let y = 0; y < SETTINGS.nb_candies; y++) {
        const matches = this.checkMatches({ x, y });
        if (!matches) continue;
        out = [...out, ...matches];
      }
    }

    return out.length > 0 ? out : null;
  }

  checkMatches(candy: CandyIndex): CandyIndex[] | null {
    const startColor = this.getColor(candy);
    if (startColor === null) {
      throw new Error(`Null color at x=${candy.x} and y=${candy.y} !`);
    }

    // Fonction pour checker les alignement de couleur
    // dans une direction donnée
    // Je l'ai pas mis en méthode classe vu qu'elle est
    // pas utilisé ailleur et qu'elle est pas dans mon plan du tp d'avant

    const checkDirection = (
      x: number,
      y: number,
      dx: number,
      dy: number,
    ): CandyIndex[] => {
      const matches: CandyIndex[] = [];

      while (this.getColor({ x, y }) === startColor) {
        matches.push({ x, y });
        x += dx;
        y += dy;
      }

      return matches;
    };

    // Check Horizontal

    const right = checkDirection(candy.x + 1, candy.y, 1, 0);
    const left = checkDirection(candy.x - 1, candy.y, -1, 0);

    let horizontal = [...left, ...right];

    if (horizontal.length < 2) horizontal = [];

    // Check Vertical

    const down = checkDirection(candy.x, candy.y + 1, 0, 1);
    const up = checkDirection(candy.x, candy.y - 1, 0, -1);

    let vertical = [...up, ...down];

    if (vertical.length < 2) vertical = [];

    // Check final

    if (horizontal.length === 0 && vertical.length === 0) return null;

    return [candy, ...horizontal, ...vertical];
  }

  removeMatches(candies: CandyIndex[]): ToDrop[] {
    this._score += candies.length;

    // On supprime les bonbons à retirer du model

    candies.forEach((index) => {
      this.setCandy(null, index);
    });

    const result: ToDrop[] = [];

    // Pour chaque colonne, on renvoie les bonbons encore
    // présent le plus bas possible, puis on en rajoute

    for (let x = 0; x < SETTINGS.nb_candies; x++) {
      let new_column: Column = new Array(SETTINGS.nb_candies);

      let w_index = SETTINGS.nb_candies - 1;

      // On remets les bonbons restant dans une nouvelle
      // colonne (évite un algo de trie, et pas de copy
      // grace au pointeurs)

      for (let y = SETTINGS.nb_candies - 1; y >= 0; y--) {
        let candy = this.getCandy({ x, y });
        if (!candy) continue;

        new_column[w_index] = candy;

        result.push({
          from: candy,
          y_dest: w_index * SETTINGS.candy_size(),
        });

        w_index--;
      }

      // Puis on remplie la nouvelle colonne avec des
      // nouveaux bonbons de couleur aléatoire

      const higher_y = w_index;

      for (let y = w_index; y >= 0; y--) {
        const candy = makeCandy(
          this.randomColor(),
          x * SETTINGS.candy_size(),
          (y - higher_y - 1) * SETTINGS.candy_size(),
          SETTINGS.candy_size(),
        );
        new_column[y] = candy;
        result.push({
          from: candy,
          y_dest: y * SETTINGS.candy_size(),
        });
      }

      // Et on applique la nouvelle colonne dans la grille
      // du modèle

      this._grid[x] = new_column;
    }

    return result;
  }

  // ======================================================= //
  //                    Getters / Setters                    //
  // ======================================================= //

  get score(): number {
    return this._score;
  }

  get selectedIndex(): CandyIndex | null {
    return this._selected_index;
  }

  get selectedCandy(): Candy | null {
    return this._selected_index ? this.getCandy(this._selected_index) : null;
  }

  get grid(): Grid {
    return this._grid;
  }

  getCandy(index: CandyIndex): Candy | null {
    if (
      index.x >= 0 &&
      index.x < SETTINGS.nb_candies &&
      index.y >= 0 &&
      index.y < SETTINGS.nb_candies
    )
      return this._grid[index.x][index.y];
    return null;
  }

  getColor(index: CandyIndex): Colors | null {
    if (index.y == undefined) return null;
    const candy = this.getCandy(index);
    if (!candy) return null;
    return candy.color;
  }

  setSelectedIndex(index: CandyIndex): void {
    this._selected_index = index;
  }

  unsetSelectedCandy(): void {
    this._selected_index = null;
  }

  setCandy(candy: Candy | null, index: CandyIndex): void {
    if (
      index.x >= 0 &&
      index.x < SETTINGS.nb_candies &&
      index.y >= 0 &&
      index.y < SETTINGS.nb_candies
    )
      this._grid[index.x][index.y] = candy;
    return;
  }

  // ======================================================= //
  //                          Debug                          //
  // ======================================================= //

  print(): void {
    console.log("=== GRID ===");

    for (let y = 0; y < SETTINGS.nb_candies; y++) {
      let line = "";

      for (let x = 0; x < SETTINGS.nb_candies; x++) {
        const color = this.getColor({ x, y });
        line += color ? `${color}\t` : "·\t";
      }

      console.log(line);
    }

    console.log("============");
  }
}
