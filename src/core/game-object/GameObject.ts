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
   * @param {Function} [init] // Function to call when the game object is first added to the game board.
   * @param {Function} [update] // Function to call every game frame.
   * @param {Function} [draw=selfDrawFunction(id, graphics)] // Function that is called at the end of every game frame, and is passed a reference to the graphics class.
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
  }

  /**
   * Tests for a collision with another game object.
   * @param {GameObject|number} object Game object or object ID to check collision with.
   * @returns {boolean} Whether or not there is a collision.
   */
  checkCollision(object:any):boolean {
    let otherObject:any;

    /** If an ID is provided, find the object */
    if (typeof(object) === 'number') {
      let found = this._game.getObjectById(object);
      if (found === -1) {
        return false;
      } else {
        otherObject = found;
      }
    } else {
      otherObject = object;
    }

    if (!otherObject.sprite.precise) {
      return this._checkRectanglesIntersecting({
        x: this.x - this.sprite.spriteData.origin.x,
        y: this.y - this.sprite.spriteData.origin.y,
        width: this.sprite.width,
        height: this.sprite.height
      }, {
        x: otherObject.x - otherObject.sprite.spriteData.origin.x,
        y: otherObject.y - otherObject.sprite.spriteData.origin.y,
        width: otherObject.sprite.width,
        height: otherObject.sprite.height
      });
    }
  }

  /**
   * Tests for a collision with another game object if the current game object was in a different position.
   * @param {GameObject|number} object Game object or object ID to check collision with.
   * @param {number} x X position.
   * @param {number} y Y position.
   * @returns {boolean} Whether or not there is a collision.
   */
  checkCollisionPoint(object:any, x:number, y:number) {
    let otherObject:any;

    /** If an ID is provided, find the object */
    if (typeof(object) === 'number') {
      let found = this._game.getObjectById(object);
      if (found === -1) {
        return false;
      } else {
        otherObject = found;
      }
    } else {
      otherObject = object;
    }

    if (!otherObject.sprite.precise) {
      return this._checkRectanglesIntersecting({
        x: x - this.sprite.spriteData.origin.x,
        y: y - this.sprite.spriteData.origin.y,
        width: this.sprite.width,
        height: this.sprite.height
      }, {
        x: otherObject.x - otherObject.sprite.spriteData.origin.x,
        y: otherObject.y - otherObject.sprite.spriteData.origin.y,
        width: otherObject.sprite.width,
        height: otherObject.sprite.height
      });
    }
  }

  /**
   * Tests for collision between two rectangles.
   * @param {Object} rect1 The first rectangle.
   * @param {number} rect1.x rect1 X position.
   * @param {number} rect1.y rect1 Y position.
   * @param {number} rect1.width rect1 width.
   * @param {number} rect1.height rect1 height.
   * @param {Object} rect2 The second rectangle.
   * @param {number} rect2.x rect2 X position.
   * @param {number} rect2.y rect2 Y position.
   * @param {number} rect2.width rect2 width.
   * @param {number} rect2.height rect2 height.
   * @returns {boolean} If there is a collision.
   */
  _checkRectanglesIntersecting(rect1:any, rect2:any):boolean {
    if (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.height + rect1.y > rect2.y) {
        return true;
    } else {
      return false;
    }
  }

  /** Property getters/setters */

  set x(x:number) { this._x = x; }
  get x() { return this._x; }
  set y(y:number) { this._y = y; }
  get y() { return this._y; }
  set sprite(sprite:Sprite) { this._sprite = sprite; }
  get sprite() { return this._sprite; }
}