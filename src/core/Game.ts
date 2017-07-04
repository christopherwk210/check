import { defaultGameOptions } from './utils';
import { Graphics } from './graphics';
import { GameObject } from './game-object';
import { InputManager } from './input-manager';

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
  _gameBoardObjects: Array<any> = [];
  _checkboxDimens: any = { width: 0, height: 0 };

  /** Instance control */

  _instance_id: number = 0;

  /** Timing control */

  _currentTime: number = (new Date()).getTime();
  _lastTime: number = (new Date()).getTime();
  _deltaTime: number = 0;

  /** Internal class refs */

  _graphics: Graphics;
  _inputManager: InputManager;

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

    /** Make sure we have a good sized board */
    if ((this._width <= 0) || (this._height <= 0)) {
      throw new Error('The game board must have a width and height that are greater than 0!');
    }

    /** Set up the game board */
    this._gameBoard = this._createGameBoard(this._width, this._height);
    this._gameBoardContainer = this._bootstrapGameBoard(this._element, this._gameBoard);

    /** Set up graphics */
    this._graphics = new Graphics(this._width, this._height, this._gameBoard);

    /** Set up input manager */
    this._inputManager = new InputManager(this._gameBoardContainer, this._width, this._height, this._checkboxDimens);
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

    return gameBoardElement;
  }

  /**
   * Main game loop.
   */
  _gameUpdate() {
    /** Calculate delta time */
    this._currentTime = (new Date()).getTime();
    this._deltaTime = (this._currentTime - this._lastTime);
    
    /** Clear the game board */
    this._clearBoard();

    /** Process game object logics */
    this._update();
    this._gameBoardObjects.forEach(instance => instance.object._update(instance.id));

    /** Process drawing */
    this._gameBoardObjects.forEach(instance => instance.object._draw(instance.id, this._graphics));    
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
   * @returns {number} The object instance id.
   */
  addObjectToBoard(object: GameObject) {
    this._instance_id++;

    //** Append it to the board */
    this._gameBoardObjects.push({
      id: this._instance_id,
      object: object
    });

    //** Call the object's init function */
    object._init(this._instance_id);

    return this._instance_id;
  }

  /**
   * Removes a game object from the board.
   * @param {number} id The object instance id to remove.
   */
  removeObjectFromBoard(id: number) {
    let removePosition: number = 0;

    /** Find the instance */
    this._gameBoardObjects.forEach((instance, index) => {
      if (instance.id === id) {

        /** Run destroy code */
        instance.object._destroy();
        removePosition = index;
      }
    });

    /** DELETE ALL PICTURES OF RON */
    this._gameBoardObjects.splice(removePosition, 1);
  }

  /**
   * Returns a game object with the give id, or -1 if none were found.
   * @param {number} id Id of the object to get.
   * @returns {GameObject|number} The found game object or -1.
   */
  getObjectById(id: number):GameObject|number {
    let found:any = -1;

    /** Find the instance */
    this._gameBoardObjects.forEach((instance, index) => {
      if (instance.id === id) {
        found = instance;
      }
    });

    return found;
  }

  /**
   * Kicks off the main game loop!
   */
  get start() {
    return this._gameUpdate;
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

  /**
   * Returns the input manager reference.
   * @returns {InputManager} Input manager object reference.
   */
  get input():InputManager { return this._inputManager; }

  set input(a) { throw new Error('Input is a readonly property.'); }
}