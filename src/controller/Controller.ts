import type { CandyIndex } from "../model/Candy";
import Model from "../model/Model";
import { SETTINGS } from "../settings";
import View from "../view/View";
import Animator from "./Animator";

export default class Controller {
  private _model: Model;
  private _view: View;

  // private _selected_candy: CandyIndex | null;

  private _swap_in_progress: boolean;

  constructor() {
    this._model = new Model();
    this._view = new View(this._model);
    this._view.drawCandies();

    this._view.board.addEventListener("click", (ev: PointerEvent) =>
      this.handleClick(ev),
    );

    // this._selected_candy = null;

    this._swap_in_progress = false;
  }

  // Fonction callback passé au canvas, récupère l'index du candy clicker
  async handleClick(ev: PointerEvent): Promise<void> {
    if (this._swap_in_progress) return;

    const rect = this._view.board.getBoundingClientRect();

    const x = Math.floor((ev.clientX - rect.left) / SETTINGS.candy_size());
    const y = Math.floor((ev.clientY - rect.top) / SETTINGS.candy_size());

    await this.selectCandy({ x, y });
  }

  // Gère le fait de selectionné 2 candies, et de les swap si y'en à déjà un séléctionner
  async selectCandy(index: CandyIndex): Promise<void> {
    if (!this._model.selectedIndex) {
      this._model.setSelectedIndex(index);
      this._view.drawCandies();
      return;
    }

    const selected_index = this._model.selectedIndex

    this._model.unsetSelectedCandy();
    this._view.drawCandies();

    if (selected_index)
      await this.swapCandies(selected_index, index);
  }

  // Gère le swap de 2 candies
  async swapCandies(index_1: CandyIndex, index_2: CandyIndex): Promise<void> {
    // On check si ils sont cote à cote
    if (
      !(
        (Math.abs(index_1.x - index_2.x) == 1 &&
          Math.abs(index_1.y - index_2.y) == 0) ||
        (Math.abs(index_1.y - index_2.y) == 1 &&
          Math.abs(index_1.x - index_2.x) == 0)
      )
    )
      return;

    this._swap_in_progress = true;

    // On check si les 2 index passé en arg sont bien dans la grille
    const candy_1 = this._model.getCandy(index_1);
    if (!candy_1)
      throw new Error(`Null candy at x=${index_1.x} and y=${index_1.y}`);
    const candy_2 = this._model.getCandy(index_2);
    if (!candy_2)
      throw new Error(`Null candy at x=${index_2.x} and y=${index_2.y}`);

    this._view.start();

    // On swap les 2 candies
    const swap_anim = Animator.animateSwap(candy_1, candy_2);
    this._model.setCandy(candy_2, index_1);
    this._model.setCandy(candy_1, index_2);

    // On check les matchs des 2 candies uniquement
    let matches: CandyIndex[] = [];

    const check_1 = this._model.checkMatches(index_1);
    if (check_1) matches = check_1;
    const check_2 = this._model.checkMatches(index_2);
    if (check_2) matches = [...matches, ...check_2];

    await swap_anim;

    this._view.stop();

    if (matches.length === 0) {
      // Si pas de match avec les 2 candies, on fait un reverse
      // swap pour les remettre sur leur position d'origine
      this._view.start();

      const reverse_swap_anim = Animator.animateSwap(candy_2, candy_1);

      this._model.setCandy(candy_1, index_1);
      this._model.setCandy(candy_2, index_2);

      await reverse_swap_anim;

      this._view.stop();
    } else {
      // Si il y a match, on check en boucle tout les matchs
      // jusqu'à ce qu'il y en ait plus, tant qu'il y en a on fait :
      let all_match = this._model.checkAllMatches();

      while (all_match) {
        let to_wait: Promise<void>[] = [];

        // On détruit les candies qui sont en matchs
        this._view.start();

        all_match.forEach((candy_index) => {
          const candy = this._model.getCandy(candy_index);
          if (candy) to_wait.push(Animator.animateDestroy(candy));
        });

        await Promise.all(to_wait);

        this._view.stop();

        // Et ensuite on drop ceux qui doivent "tomber", et les nouveaux pour remplir (géré par le model)
        let to_drop = this._model.removeMatches(all_match);

        to_wait = [];

        this._view.start();

        to_drop.forEach((drop) => {
          to_wait.push(Animator.animateDrop(drop.from, drop.y_dest));
        });

        all_match = this._model.checkAllMatches();

        await Promise.all(to_wait);

        this._view.stop();
      }
    }

    this._swap_in_progress = false;
  }
}
