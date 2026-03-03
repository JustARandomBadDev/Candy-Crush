import type { Candy } from "../model/Candy.ts";
import { candy_images } from "../model/CandyImages.ts";
import type Model from "../model/Model.ts";
import type { Column } from "../model/Model.ts";

import { SETTINGS } from "../settings.ts";

export default class View {
  private _board: HTMLCanvasElement;
  private _board_ctx: CanvasRenderingContext2D;
  private _model: Model;

  private _run: boolean;

  private _score_render: HTMLSpanElement;

  constructor(model: Model) {
    const board = document.querySelector<HTMLCanvasElement>("#board");
    if (!board) throw new Error("Null canvas !");

    this._board = board;
    this._board.width = SETTINGS.board_size;
    this._board.height = SETTINGS.board_size;

    const board_ctx = this._board.getContext("2d");
    if (!board_ctx) throw new Error("Null canvas's context !");

    this._model = model;

    this._board_ctx = board_ctx;

    this._run = true;

    const span = document.querySelector<HTMLSpanElement>("#score");
    if (!span) throw new Error("Cannot find HTMLSpanElement with id : score !");
    this._score_render = span;
  }

  start(): void {
    this._run = true;
    const loop = () => {
      this.drawCandies();
      if (this._run) requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  drawCandies(): void {
    this._score_render.textContent = this._model.score.toString();

    this._board_ctx.clearRect(0, 0, SETTINGS.board_size, SETTINGS.board_size);
    this._model.grid.forEach((line: Column) => {
      line.forEach((candy: Candy | null) => {
        if (candy) {
          const image = candy_images.get(candy.color);
          if (!image) throw new Error("Null image !");
          this._board_ctx.drawImage(
            image,
            candy.x,
            candy.y,
            candy.size,
            candy.size,
          );
        }
      });
    });

    const selected_candy = this._model.selectedCandy;

    if (selected_candy) {
      this._board_ctx.beginPath();
      this._board_ctx.strokeStyle = "#ff2e91";
      this._board_ctx.lineWidth = 5;

      this._board_ctx.rect(
        selected_candy.x,
        selected_candy.y,
        selected_candy.size,
        selected_candy.size,
      );

      this._board_ctx.stroke();
    }
  }

  stop(): void {
    this._run = false;
  }

  get board(): HTMLCanvasElement {
    return this._board;
  }
}
