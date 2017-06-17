import { defaultGameOptions } from './utils';
import { Graphics } from './graphics';
import { GameObject } from './game-object';

declare var global:any;

/**
 * Game class, responsible for creating the game and managing draws.
 */
export class Game {

  /** Options */

  _element: Element;
  _width: number;
  _height: number;
  _collapse: boolean;
  _hideCursor: boolean;
  _update: Function;
  _useRadio: boolean;

  /** Game board control */

  _gameBoard: Array<any>;
  _gameBoardContainer: Element;
  _gameBoardObjects: Array<GameObject> = [];

  /** Timing control */

  _currentTime: number;
  _lastTime: number;
  _deltaTime: number = 0;

  /** Mouse control */

  _currentMouseCoords:any = { x: 0, y: 0 };
  _checkboxDimens: any = { width: 0, height: 0 };

  /** Internal class refs */

  _graphics: Graphics;

  /**
   * Initializes the game and appends game board to the DOM.
   * @param {Element} element Existing element to append the game board to.
   * @param {Object} [options] Game setup information. 
   * @param {number} [options.width=15] How many checkboxes wide the game board should be.
   * @param {number} [options.height=15] How many checkboxes high the game board should be.
   * @param {boolean} [options.collapse=false] Whether the checkboxes should have margins.
   * @param {boolean} [options.hideCursor=false] Hide the cursor over the game board.
   * @param {Function} [options.update=function(){}] Function to execute every game frame before all other calculations.
   * @param {boolean} [options.useRadio=false] Use radio buttons instead of checkboxes.
   */
  constructor(element: Element, options: any = defaultGameOptions) {
    if (!element) { throw new TypeError('You must provide an element to a Check Game.'); }

    /** Assign options */
    this._element = element;
    this._width = options.width || defaultGameOptions.width;
    this._height = options.height || defaultGameOptions.height;
    this._collapse = options.collapse || defaultGameOptions.collapse;
    this._hideCursor = options.hideCursor || defaultGameOptions.hideCursor;
    this._update = options.update || defaultGameOptions.update;
    this._useRadio = options.useRadio || defaultGameOptions.useRadio;

    /** Set up the game board */
    this._gameBoard = this._createGameBoard(this._width, this._height);
    this._gameBoardContainer = this._bootstrapGameBoard(this._element, this._gameBoard);

    /** Set up graphics */
    this._graphics = new Graphics(this._width, this._height, this._gameBoard);
  }

  /**
   * Creates a checkbox element ready to be used by Check.
   * @param {string} [id] ID to assign to the element.
   * @param {string} [css] CSS text to assign to the element.
   * @returns {Element} Checkbox element.
   */
  _createCheckboxElement(id:string = '', css:string = ''):Element {
    let checkbox = document.createElement('input');
    
    /** Set up element properties */
    checkbox.type = this._useRadio ? 'radio' : 'checkbox';
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
  _createGameBoard(width:number, height:number):Array<any> {
    let gameBoard = [];
    let currentRow = [];

    for (let x = 0; x < height; x++) {
      currentRow = [];
      for (let y = 0; y < width; y++) {
        let checkboxStyle = (this._hideCursor ? 'cursor:none;' : '') + (this._collapse ? 'padding:0;margin:0;' : '');
        let checkbox = this._createCheckboxElement(`${x}-${y}`, checkboxStyle);
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
  _bootstrapGameBoard(element: Element, gameBoard: Array<any>):Element {
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

    /** Determine checkbox size */
    this._checkboxDimens.width = this._gameBoard[0][0].offsetWidth;
    this._checkboxDimens.height = this._gameBoard[0][0].offsetHeight;

    /** Listen for mouse movements */
    gameBoardElement.addEventListener('mousemove', e => {
      let elementPosition = this._getElementPosition(gameBoardElement);

      //** Convert mouse position to grid position */
      let roundedX = Math.round((e.pageX - elementPosition.left) / this._checkboxDimens.width);
      let roundedY = Math.round((e.pageY - elementPosition.top) / this._checkboxDimens.height);

      //** Clamp position to be within the board */
      this._currentMouseCoords.x = Math.max(0, Math.min(roundedX, this._width - 1));
      this._currentMouseCoords.y = Math.max(0, Math.min(roundedY, this._height - 1));
    });

    return gameBoardElement;
  }

  /**
   * Returns the true position of an element.
   * @param {Element} e Element to get the position of. 
   */
  _getElementPosition(e:any):any {
    let curLeft = 0,
        curTop = 0;

    do {
			curLeft += e.offsetLeft;
			curTop += e.offsetTop;
    } while (e = e.offsetParent);

    return {
      left: curLeft,
      top: curTop
    };
  }

  /**
   * Main game loop.
   */
  _gameUpdate() {
    /** Calculate delta time */
    this._currentTime = (new Date()).getTime();
    this._deltaTime = (this._currentTime - this._lastTime) / 1000;
    
    /** Clear the game board */
    this._clearBoard();

    /** Process game object logics */
    this._update();
    this._gameBoardObjects.forEach(gameObject => gameObject._update());

    /** Process drawing */
    this._gameBoardObjects.forEach(gameObject => gameObject._draw(this._graphics));    
    this._graphics.draw();

    /** Loop */
    this._lastTime = this._currentTime;
    global.requestAnimationFrame(this._gameUpdate.bind(this));
  }

  /**
   * Unchecks all checkboxes on the game board.
   */
  _clearBoard() {
    this._gameBoard.forEach(boardRow => {
      boardRow.forEach((checkbox:any) => {
        checkbox.checked = false;
      });
    });
  }

  /**
   * Adds a game object to the game board!
   * @param {GameObject} object Game object to add to board.
   */
  _addObjectToBoard(object: GameObject) {
    //** Call the object's init function */
    object._init();

    //** Append it to the board */
    this._gameBoardObjects.push(object);
  }

  /**
   * Kicks off the main game loop!
   */
  get start() {
    return this._gameUpdate;
  }

  /**
   * Returns the position of the mouse.
   */
  get mousePosition():any {
    return this._currentMouseCoords;
  }

  /**
   * Returns the delta time of the game loop.
   * @returns {number} Delta time.
   */
  get deltaTime():number { return this._deltaTime; }

  set deltaTime(a) { throw new Error('Delta time is a readonly property.'); }

  /**
   * Returns the width of the game board.
   * @returns {number} Game board width.
   */
  get width():number { return this._width; }

  set width(a) { throw new Error('Width is a readonly property.'); }

  /**
   * Returns the height of the game board.
   * @returns {number} Game board height.
   */
  get height():number { return this._height; }

  set height(a) { throw new Error('Height is a readonly property.'); }

  /**
   * Returns the graphics reference.
   * @returns {Graphics} Graphics object reference.
   */
  get graphics():Graphics { return this._graphics; }

  set graphics(a) { throw new Error('Graphics is a readonly property.'); }
}