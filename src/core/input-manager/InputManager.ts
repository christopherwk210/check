import { getElementPosition } from '../utils';

/**
 * InputManager class, handles all user input.
 */
export class InputManager {

  /** Board control */

  _gameBoardElement: Element;
  _boardWidth: number;
  _boardHeight: number;
  _checkboxDimens: any;

  /** Mouse control */

  _currentMouseCoords:any = { x: 0, y: 0 };

  /** Keyboard control */

  _currentKeys:any = {};

  /**
   * Set up the input manager to listen to user input.
   * @param {Element} gameBoardElement A reference to the game board container.
   * @param {number} boardWidth Width of the game board.
   * @param {number} boardHeight Height of the game board.
   * @param {any} checkboxDimens Object that represents the dimensions in pixels of a checkbox.
   */
  constructor(gameBoardElement: Element, boardWidth: number, boardHeight: number, checkboxDimens: any) {
    this._gameBoardElement = gameBoardElement;
    this._boardHeight = boardHeight;
    this._boardWidth = boardWidth;
    this._checkboxDimens = checkboxDimens;

    /** Set up mouse tracking */
    this._bindMouseMovement();

    /** Set up keboard tracking */
    this._bindKeyboardInput();
  }

  /**
   * Adds an event listener to the game board that tracks mouse movement.
   */
  _bindMouseMovement() {
    /** Listen for mouse movements */
    this._gameBoardElement.addEventListener('mousemove', (e:MouseEvent) => {
      let elementPosition = getElementPosition(this._gameBoardElement);

      //** Convert mouse position to grid position */
      let roundedX = Math.round((e.pageX - elementPosition.left) / this._checkboxDimens.width);
      let roundedY = Math.round((e.pageY - elementPosition.top) / this._checkboxDimens.height);

      //** Clamp position to be within the board */
      this._currentMouseCoords.x = Math.max(0, Math.min(roundedX, this._boardWidth - 1));
      this._currentMouseCoords.y = Math.max(0, Math.min(roundedY, this._boardHeight - 1));
    });
  }

  /**
   * Binds keyboard input to the body object and keeps track of what
   * keys are being pressed.
   */
  _bindKeyboardInput() {
    /** Add keydown listener */
    document.body.addEventListener('keydown', e => {
      this._currentKeys[e.which] = this._currentKeys[e.which] || {};
      this._currentKeys[e.which].down = true;
    });

    /** Add keyup listener */
    document.body.addEventListener('keyup', e => {
      this._currentKeys[e.which] = this._currentKeys[e.which] || {};
      this._currentKeys[e.which].down = false;
    });
  }

  /**
   * Returns if a key with the provided code is currently being held.
   * @param {number} keycode Keycode of the key you want to check.
   */
  isKeyDown(keycode:number) {
    return this._currentKeys[keycode] ? this._currentKeys[keycode].down : false;
  }

  /**
   * Returns the position of the mouse.
   */
  get mousePosition():any {
    return this._currentMouseCoords;
  }
}