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
      this._gameBoard[call.y][call.x].checked = true;
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
}