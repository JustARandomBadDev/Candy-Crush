import Controller from "./controller/Controller";
import { loadImages } from "./model/CandyImages";
import "./style.css";

async function startGame() {
  await loadImages();
  new Controller();
}

startGame();
