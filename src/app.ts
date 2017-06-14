import './polyfills';

import { Game, Sprite } from './core';

declare var global:any;

let Check:any = {
  Game: Game,
  Sprite: Sprite
};

global.Check = Check;