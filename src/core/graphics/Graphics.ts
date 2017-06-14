/**
 * Contains graphical/drawing related functions.
 */
export class Graphics {

  /** Options */

  _width: number;
  _height: number;
  _gameBoard: Array<Array<Element>>;

  /**
   * Initialize the graphics class with game board properties.
   * @param {number} width Width of the game board.
   * @param {number} height Height of the game board.
   * @param {Array<Array<Element>>} gameBoard Game board.
   */
  constructor(width:number, height:number, gameBoard:Array<Array<Element>>) {
    this._width = width;
    this._height = height;
    this._gameBoard = gameBoard;
  }
}