import './polyfills';

import { Game, Sprite, Graphics, GameObject } from './core';

declare var global:any;

let Check:any = {
  Game: Game,
  Sprite: Sprite,
  Graphics: Graphics,
  GameObject: GameObject
};

global.Check = Check;