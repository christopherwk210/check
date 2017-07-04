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
  _internalBoard: Array<Array<number>>;

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

    /** Create internal board reference for diffing against the real one */
    this._internalBoard = this._createInternalBoard(gameBoard[0].length, gameBoard.length);
  }

  /**
   * Creates an internal board of the provided size.
   * @param {number} width Board width.
   * @param {number} height Board height.
   */
  _createInternalBoard(width: number, height: number):Array<Array<number>> {
    let internalBoard:Array<Array<number>> = [];

    for (let i = 0; i < height; i++) {
      let boardRow:Array<number> = [];
      for (let y = 0; y < width; y++) {
        boardRow.push(0); // Prefill with 0's
      }
      internalBoard.push(boardRow);
    }

    return internalBoard;
  }

  /**
   * Resets the internal board reference to all 0's again.
   */
  _clearBoard() {
    this._internalBoard.forEach(boardRow => {
      for (let i = 0; i < boardRow.length; i ++) {
        boardRow[i] = 0;
      }
    });
  }

  /**
   * Processes the draw batch to check/uncheck all checkboxes on the game board.
   */
  draw() {
    /** Clear the internal board */
    this._clearBoard();

    /** Set up internal board with which spaces need to be checked */
    this._drawBatch.forEach(call => {
      if ((call.y >= 0) && (call.x >= 0)) {
        if ((call.y < this._internalBoard.length) && (call.x < this._internalBoard[call.y].length)) {
          this._internalBoard[call.y][call.x] = 1;
        }
      }
    });

    /** Loop through the actual board and apply diff */
    for (let y = 0; y < this._gameBoard.length; y++) {
      for (let x = 0; x < this._gameBoard[0].length; x++) {
        if (this._internalBoard[y][x] === 1) {
          this._gameBoard[y][x].checked = this._gameBoard[y][x].checked || true;
        } else {
          this._gameBoard[y][x].checked = false;
        }
      }
    }

    this._drawBatch = [];
  }

  /**
   * Draws a point on the game board.
   * @param {number} x X coordinate of the point.
   * @param {number} y Y coordinate of the point.
   */
  drawPoint(x:number, y:number) {
    x = Math.floor(x);
    y = Math.floor(y);

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
    x = Math.floor(x);
    y = Math.floor(y);

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