export type Settings = {
  board_size: number;
  nb_candies: number;
  candy_size: () => number;
};

export const SETTINGS: Settings = {
  board_size: 500,
  nb_candies: 10,
  candy_size: () => {
    return SETTINGS.board_size / SETTINGS.nb_candies;
  },
};
