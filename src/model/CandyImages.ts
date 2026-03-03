import blue from "../../res/Blue.png";
import green from "../../res/Green.png";
import orange from "../../res/Orange.png";
import red from "../../res/Red.png";
import yellow from "../../res/Yellow.png";
import { Colors } from "./Candy";

export const candy_images = new Map<Colors, HTMLImageElement>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

export async function loadImages(): Promise<void> {
  candy_images.set(Colors.Blue, await loadImage(blue));
  candy_images.set(Colors.Green, await loadImage(green));
  candy_images.set(Colors.Orange, await loadImage(orange));
  candy_images.set(Colors.Red, await loadImage(red));
  candy_images.set(Colors.Yellow, await loadImage(yellow));
}
