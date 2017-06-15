import { Sprite } from '../sprites';

/**
 * Contains graphical/drawing related functions.
 */
export class Graphics {

  _drawBatch: Array<any> = [];

  /** Options */

  _width: number;
  _height: number;
  _gameBoard: Array<Array<HTMLInputElement>>;

  /**
   * Initialize the graphics class with game board properties.
   * @param {number} width Width of the game board.
   * @param {number} height Height of the game board.
   * @param {Array<Array<HTMLInputElement>>} gameBoard Game board.
   */
  constructor(width:number, height:number, gameBoard:Array<Array<HTMLInputElement>>) {
    this._width = width;
    this._height = height;
    this._gameBoard = gameBoard;
  }

  /**
   * Processes the draw batch to check/uncheck all checkboxes on the game board.
   */
  draw() {
    this._drawBatch.forEach(call => {
      if ((call.y >= 0) && (call.x >= 0)) {
        if (call.y < this._gameBoard.length) {
          if (call.x < this._gameBoard[call.y].length) {
            this._gameBoard[call.y][call.x].checked = true;
          }
        }
      }
    });
    this._drawBatch = [];
  }

  /**
   * Draws a point on the game board.
   * @param {number} x X coordinate of the point.
   * @param {number} y Y coordinate of the point.
   */
  drawPoint(x:number, y:number) {
    this._drawBatch.push({
      x: x,
      y: y
    });
  }

  /**
   * Draws a sprite on the game board.
   * @param {Sprite} sprite Sprite to draw.
   * @param {number} x X coordinate to draw the sprite.
   * @param {number} y Y coordinate to draw the sprite.
   */
  drawSprite(sprite:Sprite, x:number, y:number) {
    for (let _x = 0; _x < sprite.width; _x++) {
      for (let _y = 0; _y < sprite.height; _y++) {
        let point = sprite.spriteData.points[_y][_x];
        if (point === 1) {
          this._drawBatch.push({
            x: x + _x - sprite.spriteData.origin.x,
            y: y + _y - sprite.spriteData.origin.y
          });
        }
      }
    }
  }
}