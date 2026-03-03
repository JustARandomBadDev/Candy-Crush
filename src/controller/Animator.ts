import type { Candy } from "../model/Candy";
import { SETTINGS } from "../settings";

export default class Animator {
  private static _duration: number = 200;

  // Méthode générique pour les animations (gère la boucle d'animation
  // pas la logique elle même, celle ci sera passer en argument)
  static anim(
    duration: number,
    onUpdate: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();

      const step = (time: number) => {
        let progress = (time - start) / duration;
        if (progress >= 1) progress = 1;

        onUpdate(progress);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }

  // Pour les 3 animations suivantes j'utilise juste de l'interpolation linéaire

  // Méthode d'animation pour swap 2 candies
  static async animateSwap(candy_1: Candy, candy_2: Candy): Promise<void> {
    const start_1 = { x: candy_1.x, y: candy_1.y };
    const start_2 = { x: candy_2.x, y: candy_2.y };

    const end_1 = { x: candy_2.x, y: candy_2.y };
    const end_2 = { x: candy_1.x, y: candy_1.y };

    await this.anim(this._duration, (progress) => {
      candy_1.x = start_1.x + (end_1.x - start_1.x) * progress;
      candy_1.y = start_1.y + (end_1.y - start_1.y) * progress;

      candy_2.x = start_2.x + (end_2.x - start_2.x) * progress;
      candy_2.y = start_2.y + (end_2.y - start_2.y) * progress;
    });

    return new Promise((resolve) => {
      candy_1.x = end_1.x;
      candy_1.y = end_1.y;

      candy_2.x = end_2.x;
      candy_2.y = end_2.y;

      resolve();
    });
  }

  // Méthode d'animation pour détruire un candy
  static async animateDestroy(candy: Candy): Promise<void> {
    const start_size = candy.size;
    const start_pos = { x: candy.x, y: candy.y };

    await this.anim(this._duration, (progress) => {
      candy.size = start_size * (1 - progress);

      candy.x = start_pos.x + (SETTINGS.candy_size() - candy.size) / 2;

      candy.y = start_pos.y + (SETTINGS.candy_size() - candy.size) / 2;
    });

    return new Promise((resolve) => {
      candy.size = 0;

      resolve();
    });
  }

  // Méthode d'animation pour drop un candy
  static async animateDrop(candy: Candy, y_dest: number): Promise<void> {
    const start_y = candy.y;
    const delta = y_dest - start_y;

    await this.anim(this._duration, (progress) => {
      candy.y = start_y + delta * progress;
    });

    return new Promise((resolve) => {
      candy.y = y_dest;

      resolve();
    });
  }
}
