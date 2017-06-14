import { defaultOptions } from './defaultOptions';

/**
 * This class is responsible for setting up and maintaining
 * the game and all assets.
 */
export class Check {

  /** Options */
  element: Element;
  width: number;
  height: number;
  collapse: boolean;

  /** Game board control */
  gameBoard: Array<any>;
  gameBoardContainer: Element;

  /**
   * Initializes the game and appends game board to the DOM.
   * @param {Element} element Existing element to append the game board to.
   * @param {Object} options Game setup information. 
   * @param {number} options.width How many checkboxes wide the game board should be.
   * @param {number} options.height How many checkboxes high the game board should be.
   */
  constructor(element: Element, options: any = defaultOptions) {
    if (!element) { throw new TypeError("Check: You must provide an element."); }

    this.element = element;
    this.width = options.width || defaultOptions.width;
    this.height = options.height || defaultOptions.height;

    this.gameBoard = this.createGameBoard(this.width, this.height);
    this.gameBoardContainer = this.bootstrapGameBoard(this.element, this.gameBoard);
  }

  /**
   * Returns a grid of checkboxes.
   * @param {number} width How many checkboxes wide the game board should be.
   * @param {number} height How many checkboxes high the game board should be.
   * @returns {Array} The game board array of checkbox elements.
   */
  createGameBoard(width:number, height:number):Array<any> {
    let gameBoard = [];
    let currentRow = [];

    for (let x = 0; x < height; x++) {
      currentRow = [];

      for (let y = 0; y < width; y++) {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${x}${y}`;
        currentRow.push(checkbox);
      }

      gameBoard.push(currentRow);
    }

    return gameBoard;
  }

  /**
   * Appends a board to an element on the DOM.
   * @param {Element} element DOM element to append game board to.
   * @param {Array} gameBoard Valid game board grid.
   * @returns {Element} The containing game board div.
   */
  bootstrapGameBoard(element: Element, gameBoard: Array<any>):Element {
    let gameBoardElement = document.createElement('div');

    gameBoard.forEach(row => {
      let gameBoardRowElement = document.createElement('div');

      row.forEach((checkbox:Element) => {
        gameBoardRowElement.appendChild(checkbox);
      });
      
      gameBoardElement.appendChild(gameBoardRowElement);
    });

    element.appendChild(gameBoardElement);

    return gameBoardElement;
  }

  /**
   * Define a custom update function that triggers every game tick.
   * @param {Function} callback Function to be called every game tick.
   */
  set update(callback:Function) {
    this.update = callback;
  }
}