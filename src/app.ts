import './polyfills';

import { Game, Sprite, Graphics } from './core';

declare var global:any;

let Check:any = {
  Game: Game,
  Sprite: Sprite,
  Graphics: Graphics
};

global.Check = Check;