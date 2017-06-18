import { Game } from '../';
import { Sprite } from '../sprites';
import { defaultGameObjectOptions } from '../utils';

/**
 * This class represents an in game "object" or "entity".
 */
export class GameObject {

  /** Options */

  _game: Game;
  _x: number;
  _y: number;
  _sprite: Sprite;
  _init: Function;
  _update: Function;
  _draw: Function;
  _destroy: Function;

  /**
   * Instantiates a new game object with a Game class reference.
   * @param {Game} game Reference to the Game class.
   * @param {Object} [options] Game options object.
   * @param {number} [options.x=0] // The starting X position of the game object on the board.
   * @param {number} [options.y=0] // The starting Y position of the game object on the board.
   * @param {Sprite} [sprite] // The sprite that belongs to the game object.
   * @param {boolean} [autoAddToGameBoard=false] // Add the game object to the board on creation.
   * @param {Function} [init] // Function to call when the game object is first added to the game board.
   * @param {Function} [update] // Function to call every game frame.
   * @param {Function} [draw=selfDrawFunction(graphics)] // Function that is called at the end of every game frame, and is passed a reference to the graphics class.
   * @param {Function} [destroy] // Function to call when the game object is removed from the board.
   */
  constructor(game: Game, options:any = defaultGameObjectOptions) {
    if (!game) { throw new TypeError('You must provide a Game reference.'); }

    /** Assign options */
    this._game = game;
    this._x = options.x || defaultGameObjectOptions.x;
    this._y = options.y || defaultGameObjectOptions.y;
    this._sprite = options.sprite || defaultGameObjectOptions.sprite;
    this._init = options.init || defaultGameObjectOptions.init;
    this._update = options.update || defaultGameObjectOptions.update;
    this._draw = options.draw || defaultGameObjectOptions.draw;
    this._destroy = options.destroy || defaultGameObjectOptions.destroy;
    
    /** Auto add to game board */
    if (options.autoAddToGameBoard || defaultGameObjectOptions.autoAddToGameBoard) {
      game.addObjectToBoard(this);
    }
  }
}