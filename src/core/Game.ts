import { defaultOptions } from './utils/defaultOptions';

/**
 * This class is responsible for setting up and maintaining
 * the game and all assets.
 */
export class Game {

  /** Options */
  _element: Element;
  _width: number;
  _height: number;
  _collapse: boolean;
  _hideCursor: boolean;

  /** Game board control */
  _gameBoard: Array<any>;
  _gameBoardContainer: Element;

  /**
   * Initializes the game and appends game board to the DOM.
   * @param {Element} element Existing element to append the game board to.
   * @param {Object} [options] Game setup information. 
   * @param {number} [options.width=15] How many checkboxes wide the game board should be.
   * @param {number} [options.height=15] How many checkboxes high the game board should be.
   * @param {boolean} [options.collapse=false] Whether the checkboxes should have margins.
   * @param {boolean} [options.hideCursor=false] Hide the cursor over the game board.
   */
  constructor(element: Element, options: any = defaultOptions) {
    if (!element) { throw new TypeError("You must provide an element to a Check Game."); }

    /** Assign options */
    this._element = element;
    this._width = options.width || defaultOptions.width;
    this._height = options.height || defaultOptions.height;
    this._collapse = options.collapse || defaultOptions.collapse;
    this._hideCursor = options.hideCursor || defaultOptions.hideCursor;

    /** Set up the game board */
    this._gameBoard = this.createGameBoard(this._width, this._height);
    this._gameBoardContainer = this.bootstrapGameBoard(this._element, this._gameBoard);
  }

  /**
   * Creates a checkbox element ready to be used by Check.
   * @param {string} [id=''] ID to assign to the element.
   * @param {string} [css=''] CSS text to assign to the element.
   * @returns {Element} Checkbox element.
   */
  createCheckboxElement(id:string = '', css:string = ''):Element {
    let checkbox = document.createElement('input');
    
    /** Set up element properties */
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.style.cssText = css;

    /** Prevent default user interactions */
    checkbox.addEventListener('click', e => {
      e.preventDefault();
    });
    checkbox.addEventListener('keydown', e => {
      e.preventDefault();
    });

    return checkbox;
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
        let checkboxStyle = (this._hideCursor ? 'cursor:none;' : '') + (this._collapse ? 'padding:0;margin:0;' : '');
        let checkbox = this.createCheckboxElement(`${x}${y}`, checkboxStyle);
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
    gameBoardElement.style.cssText = 'display:inline-block;' + (this._hideCursor ? 'cursor:none;' : '');

    /** Create the game board rows */
    gameBoard.forEach(row => {
      let gameBoardRowElement = document.createElement('div');
      gameBoardRowElement.style.cssText = this._collapse ? 'line-height: 0.5em;' : '';

      row.forEach((checkbox:Element) => {
        gameBoardRowElement.appendChild(checkbox);
      });
      
      gameBoardElement.appendChild(gameBoardRowElement);
    });

    /** Add the game board to the DOM */
    element.appendChild(gameBoardElement);

    return gameBoardElement;
  }
}