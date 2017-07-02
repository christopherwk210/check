import './polyfills';

import { Game, Sprite, Graphics, GameObject, InputManager } from './core';

declare var global:any;

let Check:any = {
  Game: Game,
  Sprite: Sprite,
  Graphics: Graphics,
  GameObject: GameObject,
  InputManager: InputManager
};

global.Check = Check;