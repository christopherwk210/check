import { Game, Sprite } from './core';

let Check:any = {
  Game: Game,
  Sprite: Sprite
};

(<any>window).Check = Check;