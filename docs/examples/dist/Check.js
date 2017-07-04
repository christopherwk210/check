(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./polyfills");
var core_1 = require("./core");
var Check = {
    Game: core_1.Game,
    Sprite: core_1.Sprite,
    Graphics: core_1.Graphics,
    GameObject: core_1.GameObject,
    InputManager: core_1.InputManager
};
global.Check = Check;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":7,"./polyfills":17}],2:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var graphics_1 = require("./graphics");
var input_manager_1 = require("./input-manager");
/**
 * Game class, responsible for creating the game and managing draws.
 */
var Game = (function () {
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
    function Game(element, options) {
        if (options === void 0) { options = utils_1.defaultGameOptions; }
        this._gameBoardObjects = [];
        this._checkboxDimens = { width: 0, height: 0 };
        /** Instance control */
        this._instance_id = 0;
        /** Timing control */
        this._currentTime = (new Date()).getTime();
        this._lastTime = (new Date()).getTime();
        this._deltaTime = 0;
        if (!element) {
            throw new TypeError('You must provide an element to a Check Game.');
        }
        /** Assign options */
        this._element = element;
        this._width = options.width || utils_1.defaultGameOptions.width;
        this._height = options.height || utils_1.defaultGameOptions.height;
        this._collapse = options.collapse || utils_1.defaultGameOptions.collapse;
        this._hideCursor = options.hideCursor || utils_1.defaultGameOptions.hideCursor;
        this._update = options.update || utils_1.defaultGameOptions.update;
        this._useRadio = options.useRadio || utils_1.defaultGameOptions.useRadio;
        /** Set up the game board */
        this._gameBoard = this._createGameBoard(this._width, this._height);
        this._gameBoardContainer = this._bootstrapGameBoard(this._element, this._gameBoard);
        /** Set up graphics */
        this._graphics = new graphics_1.Graphics(this._width, this._height, this._gameBoard);
        /** Set up input manager */
        this._inputManager = new input_manager_1.InputManager(this._gameBoardContainer, this._width, this._height, this._checkboxDimens);
    }
    /**
     * Creates a checkbox element ready to be used by Check.
     * @param {string} [id] ID to assign to the element.
     * @param {string} [css] CSS text to assign to the element.
     * @returns {Element} Checkbox element.
     */
    Game.prototype._createCheckboxElement = function (id, css) {
        if (id === void 0) { id = ''; }
        if (css === void 0) { css = ''; }
        var checkbox = document.createElement('input');
        /** Set up element properties */
        checkbox.type = this._useRadio ? 'radio' : 'checkbox';
        checkbox.id = id;
        checkbox.style.cssText = css;
        /** Prevent default user interactions */
        checkbox.addEventListener('click', function (e) {
            e.preventDefault();
        });
        checkbox.addEventListener('keydown', function (e) {
            e.preventDefault();
        });
        return checkbox;
    };
    /**
     * Returns a grid of checkboxes.
     * @param {number} width How many checkboxes wide the game board should be.
     * @param {number} height How many checkboxes high the game board should be.
     * @returns {Array} The game board array of checkbox elements.
     */
    Game.prototype._createGameBoard = function (width, height) {
        var gameBoard = [];
        var currentRow = [];
        for (var x_1 = 0; x_1 < height; x_1++) {
            currentRow = [];
            for (var y = 0; y < width; y++) {
                var checkboxStyle = (this._hideCursor ? 'cursor:none;' : '') + (this._collapse ? 'padding:0;margin:0;' : '');
                var checkbox = this._createCheckboxElement(x_1 + "-" + y, checkboxStyle);
                currentRow.push(checkbox);
            }
            gameBoard.push(currentRow);
        }
        return gameBoard;
    };
    /**
     * Appends a board to an element on the DOM.
     * @param {Element} element DOM element to append game board to.
     * @param {Array} gameBoard Valid game board grid.
     * @returns {Element} The containing game board div.
     */
    Game.prototype._bootstrapGameBoard = function (element, gameBoard) {
        var _this = this;
        var gameBoardElement = document.createElement('div');
        gameBoardElement.style.cssText = 'display:inline-block;' + (this._hideCursor ? 'cursor:none;' : '');
        /** Create the game board rows */
        gameBoard.forEach(function (row) {
            var gameBoardRowElement = document.createElement('div');
            gameBoardRowElement.style.cssText = _this._collapse ? 'line-height: 0.5em;' : '';
            row.forEach(function (checkbox) {
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
    };
    /**
     * Main game loop.
     */
    Game.prototype._gameUpdate = function () {
        var _this = this;
        /** Calculate delta time */
        this._currentTime = (new Date()).getTime();
        this._deltaTime = (this._currentTime - this._lastTime);
        /** Clear the game board */
        this._clearBoard();
        /** Process game object logics */
        this._update();
        this._gameBoardObjects.forEach(function (instance) { return instance.object._update(instance.id); });
        /** Process drawing */
        this._gameBoardObjects.forEach(function (instance) { return instance.object._draw(instance.id, _this._graphics); });
        this._graphics.draw();
        /** Loop */
        this._lastTime = this._currentTime;
        global.requestAnimationFrame(this._gameUpdate.bind(this));
    };
    /**
     * Unchecks all checkboxes on the game board.
     */
    Game.prototype._clearBoard = function () {
        this._gameBoard.forEach(function (boardRow) {
            boardRow.forEach(function (checkbox) {
                checkbox.checked = false;
            });
        });
    };
    /**
     * Adds a game object to the game board!
     * @param {GameObject} object Game object to add to board.
     * @returns {number} The object instance id.
     */
    Game.prototype.addObjectToBoard = function (object) {
        this._instance_id++;
        //** Append it to the board */
        this._gameBoardObjects.push({
            id: this._instance_id,
            object: object
        });
        //** Call the object's init function */
        object._init(this._instance_id);
        return this._instance_id;
    };
    /**
     * Removes a game object from the board.
     * @param {number} id The object instance id to remove.
     */
    Game.prototype.removeObjectFromBoard = function (id) {
        var removePosition = 0;
        /** Find the instance */
        this._gameBoardObjects.forEach(function (instance, index) {
            if (instance.id === id) {
                /** Run destroy code */
                instance.object._destroy();
                removePosition = index;
            }
        });
        /** DELETE ALL PICTURES OF RON */
        this._gameBoardObjects.splice(removePosition, 1);
    };
    /**
     * Returns a game object with the give id, or -1 if none were found.
     * @param {number} id Id of the object to get.
     * @returns {GameObject|number} The found game object or -1.
     */
    Game.prototype.getObjectById = function (id) {
        var found = -1;
        /** Find the instance */
        this._gameBoardObjects.forEach(function (instance, index) {
            if (instance.id === id) {
                found = instance;
            }
        });
        return found;
    };
    Object.defineProperty(Game.prototype, "start", {
        /**
         * Kicks off the main game loop!
         */
        get: function () {
            return this._gameUpdate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "deltaTime", {
        /**
         * Returns the delta time of the game loop.
         * @returns {number} Delta time.
         */
        get: function () { return this._deltaTime; },
        set: function (a) { throw new Error('Delta time is a readonly property.'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "width", {
        /**
         * Returns the width of the game board.
         * @returns {number} Game board width.
         */
        get: function () { return this._width; },
        set: function (a) { throw new Error('Width is a readonly property.'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "height", {
        /**
         * Returns the height of the game board.
         * @returns {number} Game board height.
         */
        get: function () { return this._height; },
        set: function (a) { throw new Error('Height is a readonly property.'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "graphics", {
        /**
         * Returns the graphics reference.
         * @returns {Graphics} Graphics object reference.
         */
        get: function () { return this._graphics; },
        set: function (a) { throw new Error('Graphics is a readonly property.'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "input", {
        /**
         * Returns the input manager reference.
         * @returns {InputManager} Input manager object reference.
         */
        get: function () { return this._inputManager; },
        set: function (a) { throw new Error('Input is a readonly property.'); },
        enumerable: true,
        configurable: true
    });
    return Game;
}());
exports.Game = Game;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./graphics":6,"./input-manager":9,"./utils":16}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * This class represents an in game "object" or "entity".
 */
var GameObject = (function () {
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
    function GameObject(game, options) {
        if (options === void 0) { options = utils_1.defaultGameObjectOptions; }
        if (!game) {
            throw new TypeError('You must provide a Game reference.');
        }
        /** Assign options */
        this._game = game;
        this._x = options.x || utils_1.defaultGameObjectOptions.x;
        this._y = options.y || utils_1.defaultGameObjectOptions.y;
        this._sprite = options.sprite || utils_1.defaultGameObjectOptions.sprite;
        this._init = options.init || utils_1.defaultGameObjectOptions.init;
        this._update = options.update || utils_1.defaultGameObjectOptions.update;
        this._draw = options.draw || utils_1.defaultGameObjectOptions.draw;
        this._destroy = options.destroy || utils_1.defaultGameObjectOptions.destroy;
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
    GameObject.prototype._checkRectanglesIntersecting = function (rect1, rect2) {
        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Tests for a collision with another game object.
     * @param {GameObject|number} object Game object or object ID to check collision with.
     * @returns {boolean} Whether or not there is a collision.
     */
    GameObject.prototype.checkCollision = function (object) {
        return this.checkCollisionPoint(object, this.x, this.y);
    };
    /**
     * Tests for a collision with another game object if the current game object was in a different position.
     * @param {GameObject|number} object Game object or object ID to check collision with.
     * @param {number} x X position.
     * @param {number} y Y position.
     * @returns {boolean} Whether or not there is a collision.
     */
    GameObject.prototype.checkCollisionPoint = function (object, x, y) {
        var otherObject;
        /** If an ID is provided, find the object */
        if (typeof (object) === 'number') {
            var found = this._game.getObjectById(object);
            if (found === -1) {
                return false;
            }
            else {
                otherObject = found;
            }
        }
        else {
            otherObject = object;
        }
        //TODO: Add precise collision checking
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
    };
    Object.defineProperty(GameObject.prototype, "x", {
        get: function () { return this._x; },
        /** Property getters/setters */
        set: function (x) { this._x = x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "y", {
        get: function () { return this._y; },
        set: function (y) { this._y = y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "sprite", {
        get: function () { return this._sprite; },
        set: function (sprite) { this._sprite = sprite; },
        enumerable: true,
        configurable: true
    });
    return GameObject;
}());
exports.GameObject = GameObject;

},{"../utils":16}],4:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./GameObject"));

},{"./GameObject":3}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains graphical/drawing related functions.
 */
var Graphics = (function () {
    /**
     * Initialize the graphics class with game board properties.
     * @param {number} width Width of the game board.
     * @param {number} height Height of the game board.
     * @param {Array<Array<HTMLInputElement>>} gameBoard Game board.
     */
    function Graphics(width, height, gameBoard) {
        this._drawBatch = [];
        this._width = width;
        this._height = height;
        this._gameBoard = gameBoard;
    }
    /**
     * Processes the draw batch to check/uncheck all checkboxes on the game board.
     */
    Graphics.prototype.draw = function () {
        var _this = this;
        this._drawBatch.forEach(function (call) {
            if ((call.y >= 0) && (call.x >= 0)) {
                if (call.y < _this._gameBoard.length) {
                    if (call.x < _this._gameBoard[call.y].length) {
                        _this._gameBoard[call.y][call.x].checked = true;
                    }
                }
            }
        });
        this._drawBatch = [];
    };
    /**
     * Draws a point on the game board.
     * @param {number} x X coordinate of the point.
     * @param {number} y Y coordinate of the point.
     */
    Graphics.prototype.drawPoint = function (x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        this._drawBatch.push({
            x: x,
            y: y
        });
    };
    /**
     * Draws a sprite on the game board.
     * @param {Sprite} sprite Sprite to draw.
     * @param {number} x X coordinate to draw the sprite.
     * @param {number} y Y coordinate to draw the sprite.
     */
    Graphics.prototype.drawSprite = function (sprite, x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        for (var _x = 0; _x < sprite.width; _x++) {
            for (var _y = 0; _y < sprite.height; _y++) {
                var point = sprite.spriteData.points[_y][_x];
                if (point === 1) {
                    this._drawBatch.push({
                        x: x + _x - sprite.spriteData.origin.x,
                        y: y + _y - sprite.spriteData.origin.y
                    });
                }
            }
        }
    };
    return Graphics;
}());
exports.Graphics = Graphics;

},{}],6:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Graphics"));

},{"./Graphics":5}],7:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Game"));
__export(require("./sprites"));
__export(require("./graphics"));
__export(require("./input-manager"));
__export(require("./game-object"));

},{"./Game":2,"./game-object":4,"./graphics":6,"./input-manager":9,"./sprites":12}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * InputManager class, handles all user input.
 */
var InputManager = (function () {
    /**
     * Set up the input manager to listen to user input.
     * @param {Element} gameBoardElement A reference to the game board container.
     * @param {number} boardWidth Width of the game board.
     * @param {number} boardHeight Height of the game board.
     * @param {any} checkboxDimens Object that represents the dimensions in pixels of a checkbox.
     */
    function InputManager(gameBoardElement, boardWidth, boardHeight, checkboxDimens) {
        /** Mouse control */
        this._currentMouseCoords = { x: 0, y: 0 };
        /** Keyboard control */
        this._currentKeys = {};
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
    InputManager.prototype._bindMouseMovement = function () {
        var _this = this;
        /** Listen for mouse movements */
        this._gameBoardElement.addEventListener('mousemove', function (e) {
            var elementPosition = utils_1.getElementPosition(_this._gameBoardElement);
            //** Convert mouse position to grid position */
            var roundedX = Math.round((e.pageX - elementPosition.left) / _this._checkboxDimens.width);
            var roundedY = Math.round((e.pageY - elementPosition.top) / _this._checkboxDimens.height);
            //** Clamp position to be within the board */
            _this._currentMouseCoords.x = Math.max(0, Math.min(roundedX, _this._boardWidth - 1));
            _this._currentMouseCoords.y = Math.max(0, Math.min(roundedY, _this._boardHeight - 1));
        });
    };
    /**
     * Binds keyboard input to the body object and keeps track of what
     * keys are being pressed.
     */
    InputManager.prototype._bindKeyboardInput = function () {
        var _this = this;
        /** Add keydown listener */
        document.body.addEventListener('keydown', function (e) {
            _this._currentKeys[e.which] = _this._currentKeys[e.which] || {};
            _this._currentKeys[e.which].down = true;
        });
        /** Add keyup listener */
        document.body.addEventListener('keyup', function (e) {
            _this._currentKeys[e.which] = _this._currentKeys[e.which] || {};
            _this._currentKeys[e.which].down = false;
        });
    };
    /**
     * Returns the ascii code of the character in the first position of
     * a given string.
     * @param {string} key String containing the character you want the ascii code of.
     */
    InputManager.ascii = function (key) {
        return key.charCodeAt(0);
    };
    /**
     * Returns if a key with the provided code is currently being held.
     * @param {number} keycode Keycode of the key you want to check.
     */
    InputManager.prototype.isKeyDown = function (keycode) {
        return this._currentKeys[keycode] ? this._currentKeys[keycode].down : false;
    };
    Object.defineProperty(InputManager.prototype, "mousePosition", {
        /**
         * Returns the position of the mouse.
         */
        get: function () {
            return this._currentMouseCoords;
        },
        enumerable: true,
        configurable: true
    });
    return InputManager;
}());
exports.InputManager = InputManager;

},{"../utils":16}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./InputManager"));

},{"./InputManager":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultCharacterMap_1 = require("./defaultCharacterMap");
/**
 * Sprite class, represents a graphical asset usable by the game.
 */
var Sprite = (function () {
    /**
     *
     * @param {SpriteData} spriteData Sprite data that defines the appearance of the sprite.
     * @param {boolean} [precise=false] Use precise collision checking.
     */
    function Sprite(spriteData, precise) {
        if (precise === void 0) { precise = false; }
        var _this = this;
        /** Properties */
        this._width = 0;
        this._height = 0;
        this._spriteData = Sprite.normalizeSpriteData(spriteData);
        this._precise = precise;
        /** Assign default origin */
        if (!this._spriteData.origin) {
            this._spriteData.origin = { x: 0, y: 0 };
        }
        /** Calculate the width and height of the sprite */
        this._spriteData.points.forEach(function (pointRow) {
            _this._width = pointRow.length > _this._width ? pointRow.length : _this._width;
            _this._height++;
        });
    }
    /**
     * Returns sprite data of text characters.
     * @param {string} str Text to use.
     * @param {Object} characterMap Character map to use.
     * @returns {SpriteData} Constructed sprite data.
     */
    Sprite.text = function (str, characterMap) {
        if (characterMap === void 0) { characterMap = defaultCharacterMap_1.defaultCharacterMap; }
        var textSpriteData = { points: [] };
        for (var i = 0, len = str.length; i < len; i++) {
            var charPoints = characterMap.characters[str[i]];
            if (charPoints) {
                charPoints.forEach(function (charRow, index) {
                    if (textSpriteData.points[index]) {
                        textSpriteData.points[index] = textSpriteData.points[index].concat([
                            -characterMap.options.spacings
                        ], charRow);
                    }
                    else {
                        textSpriteData.points[index] = charRow.slice();
                    }
                });
            }
        }
        textSpriteData.origin = {
            x: 0,
            y: 0
        };
        return this.normalizeSpriteData(textSpriteData);
    };
    /**
     * Normalizes shorthand sprite data.
     * @param {SpriteData} spriteData Sprite data to normalize
     */
    Sprite.normalizeSpriteData = function (spriteData) {
        var fixedPoints = [];
        spriteData.points.forEach(function (pointRow) {
            var newRow = [];
            pointRow.forEach(function (point, index, arr) {
                if (point < 0) {
                    for (var i = 0; i < (point * -1); i++) {
                        newRow.push(0);
                    }
                }
                else if (point > 1) {
                    for (var i = 0; i < point; i++) {
                        newRow.push(1);
                    }
                }
                else {
                    newRow.push(point);
                }
            });
            fixedPoints.push(newRow);
        });
        var normalizedSprite = {
            points: fixedPoints,
            origin: spriteData.origin
        };
        return normalizedSprite;
    };
    /**
     * Returns the inverse of given sprite data.
     * @param {SpriteData} spriteData The sprite data you wish to inverse.
     */
    Sprite.inverse = function (spriteData) {
        var inverseSpriteData = spriteData;
        inverseSpriteData.points.forEach(function (pointRow) {
            pointRow.forEach(function (point, index, arr) {
                if ((point > 1) || (point < 0)) {
                    arr[index] = point * -1;
                }
                else {
                    arr[index] = point === 1 ? 0 : 1;
                }
            });
        });
        return inverseSpriteData;
    };
    Object.defineProperty(Sprite.prototype, "spriteData", {
        /**
         * Returns the spriteData of the sprite.
         * @returns {SpriteData} spriteData.
         */
        get: function () { return this._spriteData; },
        /**
         * Sets the sprite data of the sprite
         * @param {SpriteData} a New sprite data.
         */
        set: function (a) { this._spriteData = a; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "precise", {
        /**
         * Returns if the sprite is precise.
         * @returns {boolean} Sprite is precise.
         */
        get: function () { return this._precise; },
        set: function (a) { this._precise = a; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "width", {
        /**
         * Returns the width of the sprite.
         * @returns {number} Sprite width.
         */
        get: function () { return this._width; },
        set: function (a) { throw new Error('Width is a readonly property.'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "height", {
        /**
         * Returns the height of the sprite.
         * @returns {number} Sprite height.
         */
        get: function () { return this._height; },
        set: function (a) { throw new Error('Height is a readonly property.'); },
        enumerable: true,
        configurable: true
    });
    return Sprite;
}());
exports.Sprite = Sprite;

},{"./defaultCharacterMap":11}],11:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lowerCaseAlpha = {
    'a': [
        [4],
        [1, -2, 1],
        [4],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'b': [
        [3, 0],
        [1, 0, 1, 0],
        [4],
        [1, -2, 1],
        [4]
    ],
    'c': [
        [4],
        [1, -3],
        [1, -3],
        [1, -3],
        [4]
    ],
    'd': [
        [3, 0],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [3, 0]
    ],
    'e': [
        [4],
        [1, -3],
        [3, 0],
        [1, -3],
        [4]
    ],
    'f': [
        [4],
        [1, -3],
        [3, 0],
        [1, -3],
        [1, -3]
    ],
    'g': [
        [4],
        [1, -3],
        [1, 0, 2],
        [1, -2, 1],
        [4]
    ],
    'h': [
        [1, -2, 1],
        [1, -2, 1],
        [4],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'i': [
        [3],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [3]
    ],
    'j': [
        [0, 3],
        [-2, 1, 0],
        [-2, 1, 0],
        [1, 0, 1, 0],
        [3, 0]
    ],
    'k': [
        [1, -2, 1],
        [1, 0, 1, 0],
        [2, 0, 0],
        [1, 0, 1, 0],
        [1, -2, 1]
    ],
    'l': [
        [1, -3],
        [1, -3],
        [1, -3],
        [1, -3],
        [4]
    ],
    'm': [
        [1, -2, 1],
        [4],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'n': [
        [1, -2, 1],
        [1, -2, 1],
        [2, 0, 1],
        [1, 0, 2],
        [1, -2, 1]
    ],
    'o': [
        [4],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [4]
    ],
    'p': [
        [4],
        [1, -2, 1],
        [4],
        [1, -3],
        [1, -3]
    ],
    'q': [
        [4],
        [1, -2, 1],
        [1, -2, 1],
        [1, 0, 2],
        [4]
    ],
    'r': [
        [4],
        [1, -2, 1],
        [4],
        [1, 0, 1, 0],
        [1, -2, 1]
    ],
    's': [
        [4],
        [1, -3],
        [4],
        [-3, 1],
        [4]
    ],
    't': [
        [3],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ],
    'u': [
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [4]
    ],
    'v': [
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [0, 2, 0],
        [0, 2, 0]
    ],
    'w': [
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [4],
        [1, -2, 1]
    ],
    'x': [
        [1, -2, 1],
        [1, -2, 1],
        [0, 2, 0],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'y': [
        [1, 0, 1],
        [1, 0, 1],
        [3],
        [0, 1, 0],
        [0, 1, 0]
    ],
    'z': [
        [4],
        [-3, 1],
        [-2, 1, 0],
        [0, 1, -2],
        [4]
    ]
};
var upperCaseAlpha = {
    'A': [
        [4],
        [1, -2, 1],
        [4],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'B': [
        [3, 0],
        [1, 0, 1, 0],
        [4],
        [1, -2, 1],
        [4]
    ],
    'C': [
        [4],
        [1, -3],
        [1, -3],
        [1, -3],
        [4]
    ],
    'D': [
        [3, 0],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [3, 0]
    ],
    'E': [
        [4],
        [1, -3],
        [3, 0],
        [1, -3],
        [4]
    ],
    'F': [
        [4],
        [1, -3],
        [3, 0],
        [1, -3],
        [1, -3]
    ],
    'G': [
        [4],
        [1, -3],
        [1, 0, 2],
        [1, -2, 1],
        [4]
    ],
    'H': [
        [1, -2, 1],
        [1, -2, 1],
        [4],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'I': [
        [3],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [3]
    ],
    'J': [
        [0, 3],
        [-2, 1, 0],
        [-2, 1, 0],
        [1, 0, 1, 0],
        [3, 0]
    ],
    'K': [
        [1, -2, 1],
        [1, 0, 1, 0],
        [2, 0, 0],
        [1, 0, 1, 0],
        [1, -2, 1]
    ],
    'L': [
        [1, -3],
        [1, -3],
        [1, -3],
        [1, -3],
        [4]
    ],
    'M': [
        [1, -2, 1],
        [4],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'N': [
        [1, -2, 1],
        [1, -2, 1],
        [2, 0, 1],
        [1, 0, 2],
        [1, -2, 1]
    ],
    'O': [
        [4],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [4]
    ],
    'P': [
        [4],
        [1, -2, 1],
        [4],
        [1, -3],
        [1, -3]
    ],
    'Q': [
        [4],
        [1, -2, 1],
        [1, -2, 1],
        [1, 0, 2],
        [4]
    ],
    'R': [
        [4],
        [1, -2, 1],
        [4],
        [1, 0, 1, 0],
        [1, -2, 1]
    ],
    'S': [
        [4],
        [1, -3],
        [4],
        [-3, 1],
        [4]
    ],
    'T': [
        [3],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ],
    'U': [
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [4]
    ],
    'V': [
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [0, 2, 0],
        [0, 2, 0]
    ],
    'W': [
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [4],
        [1, -2, 1]
    ],
    'X': [
        [1, -2, 1],
        [1, -2, 1],
        [0, 2, 0],
        [1, -2, 1],
        [1, -2, 1]
    ],
    'Y': [
        [1, 0, 1],
        [1, 0, 1],
        [3],
        [0, 1, 0],
        [0, 1, 0]
    ],
    'Z': [
        [4],
        [-3, 1],
        [-2, 1, 0],
        [0, 1, -2],
        [4]
    ]
};
var numbers = {
    '0': [
        [0, 2, 0],
        [1, -2, 1],
        [1, -2, 1],
        [1, -2, 1],
        [0, 2, 0]
    ],
    '1': [
        [0, 1, 0],
        [2, 0],
        [0, 1, 0],
        [0, 1, 0],
        [3]
    ],
    '2': [
        [0, 2, 0],
        [1, -2, 1],
        [-2, 1, 0],
        [0, 1, -2],
        [4]
    ],
    '3': [
        [4],
        [-3, 1],
        [0, 3],
        [-3, 1],
        [4]
    ],
    '4': [
        [1, -2, 1],
        [1, -2, 1],
        [4],
        [-3, 1],
        [-3, 1]
    ],
    '5': [
        [4],
        [1, -3],
        [3, 0],
        [-3, 1],
        [4]
    ],
    '6': [
        [4],
        [1, -3],
        [4],
        [1, -2, 1],
        [4]
    ],
    '7': [
        [4],
        [-3, 1],
        [-3, 1],
        [-3, 1],
        [-3, 1]
    ],
    '8': [
        [4],
        [1, -2, 1],
        [4],
        [1, -2, 1],
        [4]
    ],
    '9': [
        [4],
        [1, -2, 1],
        [4],
        [-3, 1],
        [-3, 1]
    ]
};
var symbols = {
    ' ': [
        [-3],
        [-3],
        [-3],
        [-3],
        [-3]
    ],
    ',': [
        [-2],
        [-2],
        [-2],
        [0, 1],
        [2]
    ],
    '.': [
        [0],
        [0],
        [0],
        [0],
        [1]
    ],
    '/': [
        [-3, 1],
        [-2, 2],
        [0, 2, -1],
        [2, -2],
        [1, -3]
    ],
    ';': [
        [-2],
        [0, 1],
        [-2],
        [0, 1],
        [1, 0]
    ],
    '\'': [
        [1],
        [1],
        [0],
        [0],
        [0]
    ],
    '[': [
        [2],
        [1, 0],
        [1, 0],
        [1, 0],
        [2]
    ],
    ']': [
        [2],
        [0, 1],
        [0, 1],
        [0, 1],
        [2]
    ],
    '\\': [
        [1, -3],
        [2, -2],
        [0, 2, -1],
        [-2, 2],
        [-3, 1]
    ],
    '-': [
        [-3],
        [-3],
        [3],
        [-3],
        [-3]
    ],
    '=': [
        [-3],
        [3],
        [-3],
        [3],
        [-3]
    ],
    '<': [
        [-2, 1],
        [0, 1, 0],
        [1, -2],
        [0, 1, 0],
        [-2, 1]
    ],
    '>': [
        [1, -2],
        [0, 1, 0],
        [-2, 1],
        [0, 1, 0],
        [1, -2]
    ],
    '?': [
        [0, 2, 0],
        [1, -2, 1],
        [-2, 1, 0],
        [-4],
        [-2, 1, 0]
    ],
    ':': [
        [0],
        [1],
        [0],
        [0],
        [1]
    ],
    '"': [
        [1, 0, 1],
        [1, 0, 1],
        [-3],
        [-3],
        [-3]
    ],
    '{': [
        [0, 2],
        [0, 1, 0],
        [1, -2],
        [0, 1, 0],
        [0, 2]
    ],
    '}': [
        [2, 0],
        [0, 1, 0],
        [-2, 1],
        [0, 1, 0],
        [2, 0]
    ],
    '|': [
        [1],
        [1],
        [1],
        [1],
        [1]
    ],
    '!': [
        [1],
        [1],
        [1],
        [0],
        [1]
    ],
    '@': [
        [0, 2, 0],
        [1, -2, 1],
        [1, 0, 2],
        [1, -3],
        [0, 2, 0]
    ],
    '#': [
        [0, 1, 0, 1],
        [4],
        [0, 1, 0, 1],
        [4],
        [0, 1, 0, 1]
    ],
    '$': [
        [0, 1, 0],
        [3],
        [2, 0],
        [0, 2],
        [3]
    ],
    '%': [
        [1, -2, 1],
        [-2, 2],
        [0, 2, -1],
        [2, -2],
        [1, -2, 1]
    ],
    '^': [
        [0, 1, 0],
        [1, 0, 1],
        [-3],
        [-3],
        [-3]
    ],
    '&': [
        [3, 0],
        [1, 0, 1, 0],
        [2, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1]
    ],
    '*': [
        [-3],
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
        [-3]
    ],
    '(': [
        [0, 1],
        [1, 0],
        [1, 0],
        [1, 0],
        [0, 1]
    ],
    ')': [
        [1, 0],
        [0, 1],
        [0, 1],
        [0, 1],
        [1, 0]
    ],
    '_': [
        [-3],
        [-3],
        [-3],
        [-3],
        [3]
    ],
    '+': [
        [-3],
        [0, 1, 0],
        [3],
        [0, 1, 0],
        [-3]
    ],
    '`': [
        [1, 0],
        [0, 1],
        [-2],
        [-2],
        [-2]
    ],
    '~': [
        [-4],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [-4],
        [-4]
    ]
};
exports.defaultCharacterMap = {
    options: {
        spacing: 1
    },
    characters: __assign({}, lowerCaseAlpha, upperCaseAlpha, numbers, symbols)
};

},{}],12:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Sprite"));
__export(require("./defaultCharacterMap"));

},{"./Sprite":10,"./defaultCharacterMap":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the default options for every game object.
 */
exports.defaultGameObjectOptions = {
    x: 0,
    y: 0,
    sprite: undefined,
    init: function () { },
    update: function () { },
    // Function that is called at the end of every game frame, and
    // is passed instance id and a reference to the graphics class.
    draw: function (id, graphics) {
        if (this._sprite) {
            graphics.drawSprite(this._sprite, this._x, this._y);
        }
    },
    destroy: function () { } // Function to call when the game object is removed from the board.
};

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the default options every game has.
 */
exports.defaultGameOptions = {
    width: 15,
    height: 15,
    collapse: false,
    hideCursor: false,
    useRadio: false,
    update: function () { } // Callback function that triggers at the start of every game loop
};

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns the true position of an element.
 * @param {Element} e Element to get the position of.
 */
function getElementPosition(e) {
    var curLeft = 0, curTop = 0;
    do {
        curLeft += e.offsetLeft;
        curTop += e.offsetTop;
    } while (e = e.offsetParent);
    return {
        left: curLeft,
        top: curTop
    };
}
exports.getElementPosition = getElementPosition;

},{}],16:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./defaultGameOptions"));
__export(require("./defaultGameObjectOptions"));
__export(require("./getElementPosition"));

},{"./defaultGameObjectOptions":13,"./defaultGameOptions":14,"./getElementPosition":15}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./requestAnimationFrame");

},{"./requestAnimationFrame":18}],18:[function(require,module,exports){
(function (global){
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame']
        || global[vendors[x] + 'CancelRequestAnimationFrame'];
}
if (!global.requestAnimationFrame)
    global.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = global.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
if (!global.cancelAnimationFrame)
    global.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLnRzIiwic3JjL2NvcmUvR2FtZS50cyIsInNyYy9jb3JlL2dhbWUtb2JqZWN0L0dhbWVPYmplY3QudHMiLCJzcmMvY29yZS9nYW1lLW9iamVjdC9pbmRleC50cyIsInNyYy9jb3JlL2dyYXBoaWNzL0dyYXBoaWNzLnRzIiwic3JjL2NvcmUvZ3JhcGhpY3MvaW5kZXgudHMiLCJzcmMvY29yZS9pbmRleC50cyIsInNyYy9jb3JlL2lucHV0LW1hbmFnZXIvSW5wdXRNYW5hZ2VyLnRzIiwic3JjL2NvcmUvaW5wdXQtbWFuYWdlci9pbmRleC50cyIsInNyYy9jb3JlL3Nwcml0ZXMvU3ByaXRlLnRzIiwic3JjL2NvcmUvc3ByaXRlcy9kZWZhdWx0Q2hhcmFjdGVyTWFwLnRzIiwic3JjL2NvcmUvc3ByaXRlcy9pbmRleC50cyIsInNyYy9jb3JlL3V0aWxzL2RlZmF1bHRHYW1lT2JqZWN0T3B0aW9ucy50cyIsInNyYy9jb3JlL3V0aWxzL2RlZmF1bHRHYW1lT3B0aW9ucy50cyIsInNyYy9jb3JlL3V0aWxzL2dldEVsZW1lbnRQb3NpdGlvbi50cyIsInNyYy9jb3JlL3V0aWxzL2luZGV4LnRzIiwic3JjL3BvbHlmaWxscy9pbmRleC50cyIsInNyYy9wb2x5ZmlsbHMvcmVxdWVzdEFuaW1hdGlvbkZyYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQUEsdUJBQXFCO0FBRXJCLCtCQUEwRTtBQUkxRSxJQUFJLEtBQUssR0FBTztJQUNkLElBQUksRUFBRSxXQUFJO0lBQ1YsTUFBTSxFQUFFLGFBQU07SUFDZCxRQUFRLEVBQUUsZUFBUTtJQUNsQixVQUFVLEVBQUUsaUJBQVU7SUFDdEIsWUFBWSxFQUFFLG1CQUFZO0NBQzNCLENBQUM7QUFFRixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7Ozs7Ozs7QUNkckIsaUNBQTZDO0FBQzdDLHVDQUFzQztBQUV0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QyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ1I7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1g7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ1I7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1g7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDVjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNWO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNWO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0tBQ0o7Q0FDRixDQUFDO0FBRUYsSUFBTSxjQUFjLEdBQU87SUFDekIsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNSO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1A7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1g7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNSO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1Y7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDVjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1g7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1g7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDVjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztLQUNKO0NBQ0YsQ0FBQztBQUVGLElBQU0sT0FBTyxHQUFPO0lBQ2xCLEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1Y7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1I7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUjtDQUNGLENBQUM7QUFFRixJQUFNLE9BQU8sR0FBTztJQUNsQixHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNMO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ1I7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNQO0lBQ0QsSUFBSSxFQUFFO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsSUFBSSxFQUFFO1FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNMO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNMO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ1I7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDTDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1Y7SUFDQSxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ2I7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztLQUNKO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDTDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDYjtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ0w7SUFDRCxHQUFHLEVBQUU7UUFDSixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDUDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNQO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxHQUFHLEVBQUU7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDTDtJQUNELEdBQUcsRUFBRTtRQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNMO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0os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Q0FBQztRQUNwQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6RCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLGNBQWEsUUFBUSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdEUsVUFBVSxDQUFDLENBQUM7UUFDaEIsUUFBUSxHQUFHLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDakMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQztBQUVOLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0lBQzdCLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxVQUFTLEVBQU07UUFDekMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgJy4vcG9seWZpbGxzJztcblxuaW1wb3J0IHsgR2FtZSwgU3ByaXRlLCBHcmFwaGljcywgR2FtZU9iamVjdCwgSW5wdXRNYW5hZ2VyIH0gZnJvbSAnLi9jb3JlJztcblxuZGVjbGFyZSB2YXIgZ2xvYmFsOmFueTtcblxubGV0IENoZWNrOmFueSA9IHtcbiAgR2FtZTogR2FtZSxcbiAgU3ByaXRlOiBTcHJpdGUsXG4gIEdyYXBoaWNzOiBHcmFwaGljcyxcbiAgR2FtZU9iamVjdDogR2FtZU9iamVjdCxcbiAgSW5wdXRNYW5hZ2VyOiBJbnB1dE1hbmFnZXJcbn07XG5cbmdsb2JhbC5DaGVjayA9IENoZWNrOyIsImltcG9ydCB7IGRlZmF1bHRHYW1lT3B0aW9ucyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgR3JhcGhpY3MgfSBmcm9tICcuL2dyYXBoaWNzJztcbmltcG9ydCB7IEdhbWVPYmplY3QgfSBmcm9tICcuL2dhbWUtb2JqZWN0JztcbmltcG9ydCB7IElucHV0TWFuYWdlciB9IGZyb20gJy4vaW5wdXQtbWFuYWdlcic7XG5cbmRlY2xhcmUgdmFyIGdsb2JhbDphbnk7XG5cbi8qKlxuICogR2FtZSBjbGFzcywgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIHRoZSBnYW1lIGFuZCBtYW5hZ2luZyBkcmF3cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdhbWUge1xuXG4gIC8qKiBPcHRpb25zICovXG5cbiAgX2VsZW1lbnQ6IEVsZW1lbnQ7XG4gIF93aWR0aDogbnVtYmVyO1xuICBfaGVpZ2h0OiBudW1iZXI7XG4gIF9jb2xsYXBzZTogYm9vbGVhbjtcbiAgX2hpZGVDdXJzb3I6IGJvb2xlYW47XG4gIF91cGRhdGU6IEZ1bmN0aW9uO1xuICBfdXNlUmFkaW86IGJvb2xlYW47XG5cbiAgLyoqIEdhbWUgYm9hcmQgY29udHJvbCAqL1xuXG4gIF9nYW1lQm9hcmQ6IEFycmF5PGFueT47XG4gIF9nYW1lQm9hcmRDb250YWluZXI6IEVsZW1lbnQ7XG4gIF9nYW1lQm9hcmRPYmplY3RzOiBBcnJheTxhbnk+ID0gW107XG4gIF9jaGVja2JveERpbWVuczogYW55ID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cbiAgLyoqIEluc3RhbmNlIGNvbnRyb2wgKi9cblxuICBfaW5zdGFuY2VfaWQ6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRpbWluZyBjb250cm9sICovXG5cbiAgX2N1cnJlbnRUaW1lOiBudW1iZXIgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICBfbGFzdFRpbWU6IG51bWJlciA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gIF9kZWx0YVRpbWU6IG51bWJlciA9IDA7XG5cbiAgLyoqIEludGVybmFsIGNsYXNzIHJlZnMgKi9cblxuICBfZ3JhcGhpY3M6IEdyYXBoaWNzO1xuICBfaW5wdXRNYW5hZ2VyOiBJbnB1dE1hbmFnZXI7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBnYW1lIGFuZCBhcHBlbmRzIGdhbWUgYm9hcmQgdG8gdGhlIERPTS5cbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IEV4aXN0aW5nIGVsZW1lbnQgdG8gYXBwZW5kIHRoZSBnYW1lIGJvYXJkIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEdhbWUgc2V0dXAgaW5mb3JtYXRpb24uIFxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGg9MTVdIEhvdyBtYW55IGNoZWNrYm94ZXMgd2lkZSB0aGUgZ2FtZSBib2FyZCBzaG91bGQgYmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHQ9MTVdIEhvdyBtYW55IGNoZWNrYm94ZXMgaGlnaCB0aGUgZ2FtZSBib2FyZCBzaG91bGQgYmUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY29sbGFwc2U9ZmFsc2VdIFdoZXRoZXIgdGhlIGNoZWNrYm94ZXMgc2hvdWxkIGhhdmUgbWFyZ2lucy5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5oaWRlQ3Vyc29yPWZhbHNlXSBIaWRlIHRoZSBjdXJzb3Igb3ZlciB0aGUgZ2FtZSBib2FyZC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMudXBkYXRlPWZ1bmN0aW9uKCl7fV0gRnVuY3Rpb24gdG8gZXhlY3V0ZSBldmVyeSBnYW1lIGZyYW1lIGJlZm9yZSBhbGwgb3RoZXIgY2FsY3VsYXRpb25zLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnVzZVJhZGlvPWZhbHNlXSBVc2UgcmFkaW8gYnV0dG9ucyBpbnN0ZWFkIG9mIGNoZWNrYm94ZXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50OiBFbGVtZW50LCBvcHRpb25zOiBhbnkgPSBkZWZhdWx0R2FtZU9wdGlvbnMpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcHJvdmlkZSBhbiBlbGVtZW50IHRvIGEgQ2hlY2sgR2FtZS4nKTsgfVxuXG4gICAgLyoqIEFzc2lnbiBvcHRpb25zICovXG4gICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5fd2lkdGggPSBvcHRpb25zLndpZHRoIHx8IGRlZmF1bHRHYW1lT3B0aW9ucy53aWR0aDtcbiAgICB0aGlzLl9oZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCBkZWZhdWx0R2FtZU9wdGlvbnMuaGVpZ2h0O1xuICAgIHRoaXMuX2NvbGxhcHNlID0gb3B0aW9ucy5jb2xsYXBzZSB8fCBkZWZhdWx0R2FtZU9wdGlvbnMuY29sbGFwc2U7XG4gICAgdGhpcy5faGlkZUN1cnNvciA9IG9wdGlvbnMuaGlkZUN1cnNvciB8fCBkZWZhdWx0R2FtZU9wdGlvbnMuaGlkZUN1cnNvcjtcbiAgICB0aGlzLl91cGRhdGUgPSBvcHRpb25zLnVwZGF0ZSB8fCBkZWZhdWx0R2FtZU9wdGlvbnMudXBkYXRlO1xuICAgIHRoaXMuX3VzZVJhZGlvID0gb3B0aW9ucy51c2VSYWRpbyB8fCBkZWZhdWx0R2FtZU9wdGlvbnMudXNlUmFkaW87XG5cbiAgICAvKiogU2V0IHVwIHRoZSBnYW1lIGJvYXJkICovXG4gICAgdGhpcy5fZ2FtZUJvYXJkID0gdGhpcy5fY3JlYXRlR2FtZUJvYXJkKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xuICAgIHRoaXMuX2dhbWVCb2FyZENvbnRhaW5lciA9IHRoaXMuX2Jvb3RzdHJhcEdhbWVCb2FyZCh0aGlzLl9lbGVtZW50LCB0aGlzLl9nYW1lQm9hcmQpO1xuXG4gICAgLyoqIFNldCB1cCBncmFwaGljcyAqL1xuICAgIHRoaXMuX2dyYXBoaWNzID0gbmV3IEdyYXBoaWNzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2dhbWVCb2FyZCk7XG5cbiAgICAvKiogU2V0IHVwIGlucHV0IG1hbmFnZXIgKi9cbiAgICB0aGlzLl9pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKHRoaXMuX2dhbWVCb2FyZENvbnRhaW5lciwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fY2hlY2tib3hEaW1lbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjaGVja2JveCBlbGVtZW50IHJlYWR5IHRvIGJlIHVzZWQgYnkgQ2hlY2suXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbaWRdIElEIHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtjc3NdIENTUyB0ZXh0IHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudC5cbiAgICogQHJldHVybnMge0VsZW1lbnR9IENoZWNrYm94IGVsZW1lbnQuXG4gICAqL1xuICBfY3JlYXRlQ2hlY2tib3hFbGVtZW50KGlkOnN0cmluZyA9ICcnLCBjc3M6c3RyaW5nID0gJycpOkVsZW1lbnQge1xuICAgIGxldCBjaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgXG4gICAgLyoqIFNldCB1cCBlbGVtZW50IHByb3BlcnRpZXMgKi9cbiAgICBjaGVja2JveC50eXBlID0gdGhpcy5fdXNlUmFkaW8gPyAncmFkaW8nIDogJ2NoZWNrYm94JztcbiAgICBjaGVja2JveC5pZCA9IGlkO1xuICAgIGNoZWNrYm94LnN0eWxlLmNzc1RleHQgPSBjc3M7XG5cbiAgICAvKiogUHJldmVudCBkZWZhdWx0IHVzZXIgaW50ZXJhY3Rpb25zICovXG4gICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcbiAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hlY2tib3g7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGdyaWQgb2YgY2hlY2tib3hlcy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIEhvdyBtYW55IGNoZWNrYm94ZXMgd2lkZSB0aGUgZ2FtZSBib2FyZCBzaG91bGQgYmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSG93IG1hbnkgY2hlY2tib3hlcyBoaWdoIHRoZSBnYW1lIGJvYXJkIHNob3VsZCBiZS5cbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgZ2FtZSBib2FyZCBhcnJheSBvZiBjaGVja2JveCBlbGVtZW50cy5cbiAgICovXG4gIF9jcmVhdGVHYW1lQm9hcmQod2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyKTpBcnJheTxhbnk+IHtcbiAgICBsZXQgZ2FtZUJvYXJkID0gW107XG4gICAgbGV0IGN1cnJlbnRSb3cgPSBbXTtcblxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgaGVpZ2h0OyB4KyspIHtcbiAgICAgIGN1cnJlbnRSb3cgPSBbXTtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgd2lkdGg7IHkrKykge1xuICAgICAgICBsZXQgY2hlY2tib3hTdHlsZSA9ICh0aGlzLl9oaWRlQ3Vyc29yID8gJ2N1cnNvcjpub25lOycgOiAnJykgKyAodGhpcy5fY29sbGFwc2UgPyAncGFkZGluZzowO21hcmdpbjowOycgOiAnJyk7XG4gICAgICAgIGxldCBjaGVja2JveCA9IHRoaXMuX2NyZWF0ZUNoZWNrYm94RWxlbWVudChgJHt4fS0ke3l9YCwgY2hlY2tib3hTdHlsZSk7XG4gICAgICAgIGN1cnJlbnRSb3cucHVzaChjaGVja2JveCk7XG4gICAgICB9XG4gICAgICBnYW1lQm9hcmQucHVzaChjdXJyZW50Um93KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2FtZUJvYXJkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgYSBib2FyZCB0byBhbiBlbGVtZW50IG9uIHRoZSBET00uXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBET00gZWxlbWVudCB0byBhcHBlbmQgZ2FtZSBib2FyZCB0by5cbiAgICogQHBhcmFtIHtBcnJheX0gZ2FtZUJvYXJkIFZhbGlkIGdhbWUgYm9hcmQgZ3JpZC5cbiAgICogQHJldHVybnMge0VsZW1lbnR9IFRoZSBjb250YWluaW5nIGdhbWUgYm9hcmQgZGl2LlxuICAgKi9cbiAgX2Jvb3RzdHJhcEdhbWVCb2FyZChlbGVtZW50OiBFbGVtZW50LCBnYW1lQm9hcmQ6IEFycmF5PGFueT4pOkVsZW1lbnQge1xuICAgIGxldCBnYW1lQm9hcmRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZ2FtZUJvYXJkRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2Rpc3BsYXk6aW5saW5lLWJsb2NrOycgKyAodGhpcy5faGlkZUN1cnNvciA/ICdjdXJzb3I6bm9uZTsnIDogJycpO1xuXG4gICAgLyoqIENyZWF0ZSB0aGUgZ2FtZSBib2FyZCByb3dzICovXG4gICAgZ2FtZUJvYXJkLmZvckVhY2gocm93ID0+IHtcbiAgICAgIGxldCBnYW1lQm9hcmRSb3dFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBnYW1lQm9hcmRSb3dFbGVtZW50LnN0eWxlLmNzc1RleHQgPSB0aGlzLl9jb2xsYXBzZSA/ICdsaW5lLWhlaWdodDogMC41ZW07JyA6ICcnO1xuXG4gICAgICByb3cuZm9yRWFjaCgoY2hlY2tib3g6RWxlbWVudCkgPT4ge1xuICAgICAgICBnYW1lQm9hcmRSb3dFbGVtZW50LmFwcGVuZENoaWxkKGNoZWNrYm94KTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBnYW1lQm9hcmRFbGVtZW50LmFwcGVuZENoaWxkKGdhbWVCb2FyZFJvd0VsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgLyoqIEFkZCB0aGUgZ2FtZSBib2FyZCB0byB0aGUgRE9NICovXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChnYW1lQm9hcmRFbGVtZW50KTtcblxuICAgIC8qKiBEZXRlcm1pbmUgY2hlY2tib3ggc2l6ZSAqL1xuICAgIHRoaXMuX2NoZWNrYm94RGltZW5zLndpZHRoID0gdGhpcy5fZ2FtZUJvYXJkWzBdWzBdLm9mZnNldFdpZHRoO1xuICAgIHRoaXMuX2NoZWNrYm94RGltZW5zLmhlaWdodCA9IHRoaXMuX2dhbWVCb2FyZFswXVswXS5vZmZzZXRIZWlnaHQ7XG5cbiAgICByZXR1cm4gZ2FtZUJvYXJkRWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWluIGdhbWUgbG9vcC5cbiAgICovXG4gIF9nYW1lVXBkYXRlKCkge1xuICAgIC8qKiBDYWxjdWxhdGUgZGVsdGEgdGltZSAqL1xuICAgIHRoaXMuX2N1cnJlbnRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICB0aGlzLl9kZWx0YVRpbWUgPSAodGhpcy5fY3VycmVudFRpbWUgLSB0aGlzLl9sYXN0VGltZSk7XG4gICAgXG4gICAgLyoqIENsZWFyIHRoZSBnYW1lIGJvYXJkICovXG4gICAgdGhpcy5fY2xlYXJCb2FyZCgpO1xuXG4gICAgLyoqIFByb2Nlc3MgZ2FtZSBvYmplY3QgbG9naWNzICovXG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgdGhpcy5fZ2FtZUJvYXJkT2JqZWN0cy5mb3JFYWNoKGluc3RhbmNlID0+IGluc3RhbmNlLm9iamVjdC5fdXBkYXRlKGluc3RhbmNlLmlkKSk7XG5cbiAgICAvKiogUHJvY2VzcyBkcmF3aW5nICovXG4gICAgdGhpcy5fZ2FtZUJvYXJkT2JqZWN0cy5mb3JFYWNoKGluc3RhbmNlID0+IGluc3RhbmNlLm9iamVjdC5fZHJhdyhpbnN0YW5jZS5pZCwgdGhpcy5fZ3JhcGhpY3MpKTsgICAgXG4gICAgdGhpcy5fZ3JhcGhpY3MuZHJhdygpO1xuXG4gICAgLyoqIExvb3AgKi9cbiAgICB0aGlzLl9sYXN0VGltZSA9IHRoaXMuX2N1cnJlbnRUaW1lO1xuICAgIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZ2FtZVVwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbmNoZWNrcyBhbGwgY2hlY2tib3hlcyBvbiB0aGUgZ2FtZSBib2FyZC5cbiAgICovXG4gIF9jbGVhckJvYXJkKCkge1xuICAgIHRoaXMuX2dhbWVCb2FyZC5mb3JFYWNoKGJvYXJkUm93ID0+IHtcbiAgICAgIGJvYXJkUm93LmZvckVhY2goKGNoZWNrYm94OmFueSkgPT4ge1xuICAgICAgICBjaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZ2FtZSBvYmplY3QgdG8gdGhlIGdhbWUgYm9hcmQhXG4gICAqIEBwYXJhbSB7R2FtZU9iamVjdH0gb2JqZWN0IEdhbWUgb2JqZWN0IHRvIGFkZCB0byBib2FyZC5cbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIG9iamVjdCBpbnN0YW5jZSBpZC5cbiAgICovXG4gIGFkZE9iamVjdFRvQm9hcmQob2JqZWN0OiBHYW1lT2JqZWN0KSB7XG4gICAgdGhpcy5faW5zdGFuY2VfaWQrKztcblxuICAgIC8vKiogQXBwZW5kIGl0IHRvIHRoZSBib2FyZCAqL1xuICAgIHRoaXMuX2dhbWVCb2FyZE9iamVjdHMucHVzaCh7XG4gICAgICBpZDogdGhpcy5faW5zdGFuY2VfaWQsXG4gICAgICBvYmplY3Q6IG9iamVjdFxuICAgIH0pO1xuXG4gICAgLy8qKiBDYWxsIHRoZSBvYmplY3QncyBpbml0IGZ1bmN0aW9uICovXG4gICAgb2JqZWN0Ll9pbml0KHRoaXMuX2luc3RhbmNlX2lkKTtcblxuICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZV9pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgZ2FtZSBvYmplY3QgZnJvbSB0aGUgYm9hcmQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpZCBUaGUgb2JqZWN0IGluc3RhbmNlIGlkIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZU9iamVjdEZyb21Cb2FyZChpZDogbnVtYmVyKSB7XG4gICAgbGV0IHJlbW92ZVBvc2l0aW9uOiBudW1iZXIgPSAwO1xuXG4gICAgLyoqIEZpbmQgdGhlIGluc3RhbmNlICovXG4gICAgdGhpcy5fZ2FtZUJvYXJkT2JqZWN0cy5mb3JFYWNoKChpbnN0YW5jZSwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbnN0YW5jZS5pZCA9PT0gaWQpIHtcblxuICAgICAgICAvKiogUnVuIGRlc3Ryb3kgY29kZSAqL1xuICAgICAgICBpbnN0YW5jZS5vYmplY3QuX2Rlc3Ryb3koKTtcbiAgICAgICAgcmVtb3ZlUG9zaXRpb24gPSBpbmRleDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKiBERUxFVEUgQUxMIFBJQ1RVUkVTIE9GIFJPTiAqL1xuICAgIHRoaXMuX2dhbWVCb2FyZE9iamVjdHMuc3BsaWNlKHJlbW92ZVBvc2l0aW9uLCAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZ2FtZSBvYmplY3Qgd2l0aCB0aGUgZ2l2ZSBpZCwgb3IgLTEgaWYgbm9uZSB3ZXJlIGZvdW5kLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaWQgSWQgb2YgdGhlIG9iamVjdCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtHYW1lT2JqZWN0fG51bWJlcn0gVGhlIGZvdW5kIGdhbWUgb2JqZWN0IG9yIC0xLlxuICAgKi9cbiAgZ2V0T2JqZWN0QnlJZChpZDogbnVtYmVyKTpHYW1lT2JqZWN0fG51bWJlciB7XG4gICAgbGV0IGZvdW5kOmFueSA9IC0xO1xuXG4gICAgLyoqIEZpbmQgdGhlIGluc3RhbmNlICovXG4gICAgdGhpcy5fZ2FtZUJvYXJkT2JqZWN0cy5mb3JFYWNoKChpbnN0YW5jZSwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbnN0YW5jZS5pZCA9PT0gaWQpIHtcbiAgICAgICAgZm91bmQgPSBpbnN0YW5jZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBLaWNrcyBvZmYgdGhlIG1haW4gZ2FtZSBsb29wIVxuICAgKi9cbiAgZ2V0IHN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLl9nYW1lVXBkYXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlbHRhIHRpbWUgb2YgdGhlIGdhbWUgbG9vcC5cbiAgICogQHJldHVybnMge251bWJlcn0gRGVsdGEgdGltZS5cbiAgICovXG4gIGdldCBkZWx0YVRpbWUoKTpudW1iZXIgeyByZXR1cm4gdGhpcy5fZGVsdGFUaW1lOyB9XG5cbiAgc2V0IGRlbHRhVGltZShhKSB7IHRocm93IG5ldyBFcnJvcignRGVsdGEgdGltZSBpcyBhIHJlYWRvbmx5IHByb3BlcnR5LicpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBnYW1lIGJvYXJkLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBHYW1lIGJvYXJkIHdpZHRoLlxuICAgKi9cbiAgZ2V0IHdpZHRoKCk6bnVtYmVyIHsgcmV0dXJuIHRoaXMuX3dpZHRoOyB9XG5cbiAgc2V0IHdpZHRoKGEpIHsgdGhyb3cgbmV3IEVycm9yKCdXaWR0aCBpcyBhIHJlYWRvbmx5IHByb3BlcnR5LicpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgZ2FtZSBib2FyZC5cbiAgICogQHJldHVybnMge251bWJlcn0gR2FtZSBib2FyZCBoZWlnaHQuXG4gICAqL1xuICBnZXQgaGVpZ2h0KCk6bnVtYmVyIHsgcmV0dXJuIHRoaXMuX2hlaWdodDsgfVxuXG4gIHNldCBoZWlnaHQoYSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0hlaWdodCBpcyBhIHJlYWRvbmx5IHByb3BlcnR5LicpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGdyYXBoaWNzIHJlZmVyZW5jZS5cbiAgICogQHJldHVybnMge0dyYXBoaWNzfSBHcmFwaGljcyBvYmplY3QgcmVmZXJlbmNlLlxuICAgKi9cbiAgZ2V0IGdyYXBoaWNzKCk6R3JhcGhpY3MgeyByZXR1cm4gdGhpcy5fZ3JhcGhpY3M7IH1cblxuICBzZXQgZ3JhcGhpY3MoYSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0dyYXBoaWNzIGlzIGEgcmVhZG9ubHkgcHJvcGVydHkuJyk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5wdXQgbWFuYWdlciByZWZlcmVuY2UuXG4gICAqIEByZXR1cm5zIHtJbnB1dE1hbmFnZXJ9IElucHV0IG1hbmFnZXIgb2JqZWN0IHJlZmVyZW5jZS5cbiAgICovXG4gIGdldCBpbnB1dCgpOklucHV0TWFuYWdlciB7IHJldHVybiB0aGlzLl9pbnB1dE1hbmFnZXI7IH1cblxuICBzZXQgaW5wdXQoYSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0lucHV0IGlzIGEgcmVhZG9ubHkgcHJvcGVydHkuJyk7IH1cbn0iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi4vJztcbmltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4uL3Nwcml0ZXMnO1xuaW1wb3J0IHsgZGVmYXVsdEdhbWVPYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG4vKipcbiAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhbiBpbiBnYW1lIFwib2JqZWN0XCIgb3IgXCJlbnRpdHlcIi5cbiAqL1xuZXhwb3J0IGNsYXNzIEdhbWVPYmplY3Qge1xuXG4gIC8qKiBPcHRpb25zICovXG5cbiAgX2dhbWU6IEdhbWU7XG4gIF94OiBudW1iZXI7XG4gIF95OiBudW1iZXI7XG4gIF9zcHJpdGU6IFNwcml0ZTtcbiAgX2luaXQ6IEZ1bmN0aW9uO1xuICBfdXBkYXRlOiBGdW5jdGlvbjtcbiAgX2RyYXc6IEZ1bmN0aW9uO1xuICBfZGVzdHJveTogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhIG5ldyBnYW1lIG9iamVjdCB3aXRoIGEgR2FtZSBjbGFzcyByZWZlcmVuY2UuXG4gICAqIEBwYXJhbSB7R2FtZX0gZ2FtZSBSZWZlcmVuY2UgdG8gdGhlIEdhbWUgY2xhc3MuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gR2FtZSBvcHRpb25zIG9iamVjdC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLng9MF0gLy8gVGhlIHN0YXJ0aW5nIFggcG9zaXRpb24gb2YgdGhlIGdhbWUgb2JqZWN0IG9uIHRoZSBib2FyZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnk9MF0gLy8gVGhlIHN0YXJ0aW5nIFkgcG9zaXRpb24gb2YgdGhlIGdhbWUgb2JqZWN0IG9uIHRoZSBib2FyZC5cbiAgICogQHBhcmFtIHtTcHJpdGV9IFtzcHJpdGVdIC8vIFRoZSBzcHJpdGUgdGhhdCBiZWxvbmdzIHRvIHRoZSBnYW1lIG9iamVjdC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2luaXRdIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgZ2FtZSBvYmplY3QgaXMgZmlyc3QgYWRkZWQgdG8gdGhlIGdhbWUgYm9hcmQuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFt1cGRhdGVdIC8vIEZ1bmN0aW9uIHRvIGNhbGwgZXZlcnkgZ2FtZSBmcmFtZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2RyYXc9c2VsZkRyYXdGdW5jdGlvbihpZCwgZ3JhcGhpY3MpXSAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGV2ZXJ5IGdhbWUgZnJhbWUsIGFuZCBpcyBwYXNzZWQgYSByZWZlcmVuY2UgdG8gdGhlIGdyYXBoaWNzIGNsYXNzLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZGVzdHJveV0gLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBnYW1lIG9iamVjdCBpcyByZW1vdmVkIGZyb20gdGhlIGJvYXJkLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZ2FtZTogR2FtZSwgb3B0aW9uczphbnkgPSBkZWZhdWx0R2FtZU9iamVjdE9wdGlvbnMpIHtcbiAgICBpZiAoIWdhbWUpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcHJvdmlkZSBhIEdhbWUgcmVmZXJlbmNlLicpOyB9XG5cbiAgICAvKiogQXNzaWduIG9wdGlvbnMgKi9cbiAgICB0aGlzLl9nYW1lID0gZ2FtZTtcbiAgICB0aGlzLl94ID0gb3B0aW9ucy54IHx8IGRlZmF1bHRHYW1lT2JqZWN0T3B0aW9ucy54O1xuICAgIHRoaXMuX3kgPSBvcHRpb25zLnkgfHwgZGVmYXVsdEdhbWVPYmplY3RPcHRpb25zLnk7XG4gICAgdGhpcy5fc3ByaXRlID0gb3B0aW9ucy5zcHJpdGUgfHwgZGVmYXVsdEdhbWVPYmplY3RPcHRpb25zLnNwcml0ZTtcbiAgICB0aGlzLl9pbml0ID0gb3B0aW9ucy5pbml0IHx8IGRlZmF1bHRHYW1lT2JqZWN0T3B0aW9ucy5pbml0O1xuICAgIHRoaXMuX3VwZGF0ZSA9IG9wdGlvbnMudXBkYXRlIHx8IGRlZmF1bHRHYW1lT2JqZWN0T3B0aW9ucy51cGRhdGU7XG4gICAgdGhpcy5fZHJhdyA9IG9wdGlvbnMuZHJhdyB8fCBkZWZhdWx0R2FtZU9iamVjdE9wdGlvbnMuZHJhdztcbiAgICB0aGlzLl9kZXN0cm95ID0gb3B0aW9ucy5kZXN0cm95IHx8IGRlZmF1bHRHYW1lT2JqZWN0T3B0aW9ucy5kZXN0cm95O1xuICB9XG5cbiAgICAvKipcbiAgICogVGVzdHMgZm9yIGNvbGxpc2lvbiBiZXR3ZWVuIHR3byByZWN0YW5nbGVzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVjdDEgVGhlIGZpcnN0IHJlY3RhbmdsZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlY3QxLnggcmVjdDEgWCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlY3QxLnkgcmVjdDEgWSBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlY3QxLndpZHRoIHJlY3QxIHdpZHRoLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVjdDEuaGVpZ2h0IHJlY3QxIGhlaWdodC5cbiAgICogQHBhcmFtIHtPYmplY3R9IHJlY3QyIFRoZSBzZWNvbmQgcmVjdGFuZ2xlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVjdDIueCByZWN0MiBYIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVjdDIueSByZWN0MiBZIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVjdDIud2lkdGggcmVjdDIgd2lkdGguXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZWN0Mi5oZWlnaHQgcmVjdDIgaGVpZ2h0LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gSWYgdGhlcmUgaXMgYSBjb2xsaXNpb24uXG4gICAqL1xuICBfY2hlY2tSZWN0YW5nbGVzSW50ZXJzZWN0aW5nKHJlY3QxOmFueSwgcmVjdDI6YW55KTpib29sZWFuIHtcbiAgICBpZiAocmVjdDEueCA8IHJlY3QyLnggKyByZWN0Mi53aWR0aCAmJlxuICAgICAgcmVjdDEueCArIHJlY3QxLndpZHRoID4gcmVjdDIueCAmJlxuICAgICAgcmVjdDEueSA8IHJlY3QyLnkgKyByZWN0Mi5oZWlnaHQgJiZcbiAgICAgIHJlY3QxLmhlaWdodCArIHJlY3QxLnkgPiByZWN0Mi55KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGZvciBhIGNvbGxpc2lvbiB3aXRoIGFub3RoZXIgZ2FtZSBvYmplY3QuXG4gICAqIEBwYXJhbSB7R2FtZU9iamVjdHxudW1iZXJ9IG9iamVjdCBHYW1lIG9iamVjdCBvciBvYmplY3QgSUQgdG8gY2hlY2sgY29sbGlzaW9uIHdpdGguXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGVyZSBpcyBhIGNvbGxpc2lvbi5cbiAgICovXG4gIGNoZWNrQ29sbGlzaW9uKG9iamVjdDphbnkpOmJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrQ29sbGlzaW9uUG9pbnQob2JqZWN0LCB0aGlzLngsIHRoaXMueSk7XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgZm9yIGEgY29sbGlzaW9uIHdpdGggYW5vdGhlciBnYW1lIG9iamVjdCBpZiB0aGUgY3VycmVudCBnYW1lIG9iamVjdCB3YXMgaW4gYSBkaWZmZXJlbnQgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB7R2FtZU9iamVjdHxudW1iZXJ9IG9iamVjdCBHYW1lIG9iamVjdCBvciBvYmplY3QgSUQgdG8gY2hlY2sgY29sbGlzaW9uIHdpdGguXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IFggcG9zaXRpb24uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IFkgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGVyZSBpcyBhIGNvbGxpc2lvbi5cbiAgICovXG4gIGNoZWNrQ29sbGlzaW9uUG9pbnQob2JqZWN0OmFueSwgeDpudW1iZXIsIHk6bnVtYmVyKSB7XG4gICAgbGV0IG90aGVyT2JqZWN0OmFueTtcblxuICAgIC8qKiBJZiBhbiBJRCBpcyBwcm92aWRlZCwgZmluZCB0aGUgb2JqZWN0ICovXG4gICAgaWYgKHR5cGVvZihvYmplY3QpID09PSAnbnVtYmVyJykge1xuICAgICAgbGV0IGZvdW5kID0gdGhpcy5fZ2FtZS5nZXRPYmplY3RCeUlkKG9iamVjdCk7XG4gICAgICBpZiAoZm91bmQgPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG90aGVyT2JqZWN0ID0gZm91bmQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG90aGVyT2JqZWN0ID0gb2JqZWN0O1xuICAgIH1cblxuICAgIC8vVE9ETzogQWRkIHByZWNpc2UgY29sbGlzaW9uIGNoZWNraW5nXG4gICAgaWYgKCFvdGhlck9iamVjdC5zcHJpdGUucHJlY2lzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NoZWNrUmVjdGFuZ2xlc0ludGVyc2VjdGluZyh7XG4gICAgICAgIHg6IHggLSB0aGlzLnNwcml0ZS5zcHJpdGVEYXRhLm9yaWdpbi54LFxuICAgICAgICB5OiB5IC0gdGhpcy5zcHJpdGUuc3ByaXRlRGF0YS5vcmlnaW4ueSxcbiAgICAgICAgd2lkdGg6IHRoaXMuc3ByaXRlLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuc3ByaXRlLmhlaWdodFxuICAgICAgfSwge1xuICAgICAgICB4OiBvdGhlck9iamVjdC54IC0gb3RoZXJPYmplY3Quc3ByaXRlLnNwcml0ZURhdGEub3JpZ2luLngsXG4gICAgICAgIHk6IG90aGVyT2JqZWN0LnkgLSBvdGhlck9iamVjdC5zcHJpdGUuc3ByaXRlRGF0YS5vcmlnaW4ueSxcbiAgICAgICAgd2lkdGg6IG90aGVyT2JqZWN0LnNwcml0ZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBvdGhlck9iamVjdC5zcHJpdGUuaGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogUHJvcGVydHkgZ2V0dGVycy9zZXR0ZXJzICovXG5cbiAgc2V0IHgoeDpudW1iZXIpIHsgdGhpcy5feCA9IHg7IH1cbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLl94OyB9XG4gIHNldCB5KHk6bnVtYmVyKSB7IHRoaXMuX3kgPSB5OyB9XG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy5feTsgfVxuICBzZXQgc3ByaXRlKHNwcml0ZTpTcHJpdGUpIHsgdGhpcy5fc3ByaXRlID0gc3ByaXRlOyB9XG4gIGdldCBzcHJpdGUoKSB7IHJldHVybiB0aGlzLl9zcHJpdGU7IH1cbn0iLCJleHBvcnQgKiBmcm9tICcuL0dhbWVPYmplY3QnOyIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4uL3Nwcml0ZXMnO1xuXG4vKipcbiAqIENvbnRhaW5zIGdyYXBoaWNhbC9kcmF3aW5nIHJlbGF0ZWQgZnVuY3Rpb25zLlxuICovXG5leHBvcnQgY2xhc3MgR3JhcGhpY3Mge1xuXG4gIF9kcmF3QmF0Y2g6IEFycmF5PGFueT4gPSBbXTtcblxuICAvKiogT3B0aW9ucyAqL1xuXG4gIF93aWR0aDogbnVtYmVyO1xuICBfaGVpZ2h0OiBudW1iZXI7XG4gIF9nYW1lQm9hcmQ6IEFycmF5PEFycmF5PEhUTUxJbnB1dEVsZW1lbnQ+PjtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgZ3JhcGhpY3MgY2xhc3Mgd2l0aCBnYW1lIGJvYXJkIHByb3BlcnRpZXMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB0aGUgZ2FtZSBib2FyZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgdGhlIGdhbWUgYm9hcmQuXG4gICAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8SFRNTElucHV0RWxlbWVudD4+fSBnYW1lQm9hcmQgR2FtZSBib2FyZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpZHRoOm51bWJlciwgaGVpZ2h0Om51bWJlciwgZ2FtZUJvYXJkOkFycmF5PEFycmF5PEhUTUxJbnB1dEVsZW1lbnQ+Pikge1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuX2dhbWVCb2FyZCA9IGdhbWVCb2FyZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgdGhlIGRyYXcgYmF0Y2ggdG8gY2hlY2svdW5jaGVjayBhbGwgY2hlY2tib3hlcyBvbiB0aGUgZ2FtZSBib2FyZC5cbiAgICovXG4gIGRyYXcoKSB7XG4gICAgdGhpcy5fZHJhd0JhdGNoLmZvckVhY2goY2FsbCA9PiB7XG4gICAgICBpZiAoKGNhbGwueSA+PSAwKSAmJiAoY2FsbC54ID49IDApKSB7XG4gICAgICAgIGlmIChjYWxsLnkgPCB0aGlzLl9nYW1lQm9hcmQubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKGNhbGwueCA8IHRoaXMuX2dhbWVCb2FyZFtjYWxsLnldLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fZ2FtZUJvYXJkW2NhbGwueV1bY2FsbC54XS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9kcmF3QmF0Y2ggPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIHBvaW50IG9uIHRoZSBnYW1lIGJvYXJkLlxuICAgKiBAcGFyYW0ge251bWJlcn0geCBYIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0geSBZIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50LlxuICAgKi9cbiAgZHJhd1BvaW50KHg6bnVtYmVyLCB5Om51bWJlcikge1xuICAgIHggPSBNYXRoLmZsb29yKHgpO1xuICAgIHkgPSBNYXRoLmZsb29yKHkpO1xuXG4gICAgdGhpcy5fZHJhd0JhdGNoLnB1c2goe1xuICAgICAgeDogeCxcbiAgICAgIHk6IHlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIHNwcml0ZSBvbiB0aGUgZ2FtZSBib2FyZC5cbiAgICogQHBhcmFtIHtTcHJpdGV9IHNwcml0ZSBTcHJpdGUgdG8gZHJhdy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHggWCBjb29yZGluYXRlIHRvIGRyYXcgdGhlIHNwcml0ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHkgWSBjb29yZGluYXRlIHRvIGRyYXcgdGhlIHNwcml0ZS5cbiAgICovXG4gIGRyYXdTcHJpdGUoc3ByaXRlOlNwcml0ZSwgeDpudW1iZXIsIHk6bnVtYmVyKSB7XG4gICAgeCA9IE1hdGguZmxvb3IoeCk7XG4gICAgeSA9IE1hdGguZmxvb3IoeSk7XG5cbiAgICBmb3IgKGxldCBfeCA9IDA7IF94IDwgc3ByaXRlLndpZHRoOyBfeCsrKSB7XG4gICAgICBmb3IgKGxldCBfeSA9IDA7IF95IDwgc3ByaXRlLmhlaWdodDsgX3krKykge1xuICAgICAgICBsZXQgcG9pbnQgPSBzcHJpdGUuc3ByaXRlRGF0YS5wb2ludHNbX3ldW194XTtcbiAgICAgICAgaWYgKHBvaW50ID09PSAxKSB7XG4gICAgICAgICAgdGhpcy5fZHJhd0JhdGNoLnB1c2goe1xuICAgICAgICAgICAgeDogeCArIF94IC0gc3ByaXRlLnNwcml0ZURhdGEub3JpZ2luLngsXG4gICAgICAgICAgICB5OiB5ICsgX3kgLSBzcHJpdGUuc3ByaXRlRGF0YS5vcmlnaW4ueVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59IiwiZXhwb3J0ICogZnJvbSAnLi9HcmFwaGljcyc7IiwiZXhwb3J0ICogZnJvbSAnLi9HYW1lJztcbmV4cG9ydCAqIGZyb20gJy4vc3ByaXRlcyc7XG5leHBvcnQgKiBmcm9tICcuL2dyYXBoaWNzJztcbmV4cG9ydCAqIGZyb20gJy4vaW5wdXQtbWFuYWdlcic7XG5leHBvcnQgKiBmcm9tICcuL2dhbWUtb2JqZWN0JzsiLCJpbXBvcnQgeyBnZXRFbGVtZW50UG9zaXRpb24gfSBmcm9tICcuLi91dGlscyc7XG5cbi8qKlxuICogSW5wdXRNYW5hZ2VyIGNsYXNzLCBoYW5kbGVzIGFsbCB1c2VyIGlucHV0LlxuICovXG5leHBvcnQgY2xhc3MgSW5wdXRNYW5hZ2VyIHtcblxuICAvKiogQm9hcmQgY29udHJvbCAqL1xuXG4gIF9nYW1lQm9hcmRFbGVtZW50OiBFbGVtZW50O1xuICBfYm9hcmRXaWR0aDogbnVtYmVyO1xuICBfYm9hcmRIZWlnaHQ6IG51bWJlcjtcbiAgX2NoZWNrYm94RGltZW5zOiBhbnk7XG5cbiAgLyoqIE1vdXNlIGNvbnRyb2wgKi9cblxuICBfY3VycmVudE1vdXNlQ29vcmRzOmFueSA9IHsgeDogMCwgeTogMCB9O1xuXG4gIC8qKiBLZXlib2FyZCBjb250cm9sICovXG5cbiAgX2N1cnJlbnRLZXlzOmFueSA9IHt9O1xuXG4gIC8qKlxuICAgKiBTZXQgdXAgdGhlIGlucHV0IG1hbmFnZXIgdG8gbGlzdGVuIHRvIHVzZXIgaW5wdXQuXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZ2FtZUJvYXJkRWxlbWVudCBBIHJlZmVyZW5jZSB0byB0aGUgZ2FtZSBib2FyZCBjb250YWluZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib2FyZFdpZHRoIFdpZHRoIG9mIHRoZSBnYW1lIGJvYXJkLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYm9hcmRIZWlnaHQgSGVpZ2h0IG9mIHRoZSBnYW1lIGJvYXJkLlxuICAgKiBAcGFyYW0ge2FueX0gY2hlY2tib3hEaW1lbnMgT2JqZWN0IHRoYXQgcmVwcmVzZW50cyB0aGUgZGltZW5zaW9ucyBpbiBwaXhlbHMgb2YgYSBjaGVja2JveC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGdhbWVCb2FyZEVsZW1lbnQ6IEVsZW1lbnQsIGJvYXJkV2lkdGg6IG51bWJlciwgYm9hcmRIZWlnaHQ6IG51bWJlciwgY2hlY2tib3hEaW1lbnM6IGFueSkge1xuICAgIHRoaXMuX2dhbWVCb2FyZEVsZW1lbnQgPSBnYW1lQm9hcmRFbGVtZW50O1xuICAgIHRoaXMuX2JvYXJkSGVpZ2h0ID0gYm9hcmRIZWlnaHQ7XG4gICAgdGhpcy5fYm9hcmRXaWR0aCA9IGJvYXJkV2lkdGg7XG4gICAgdGhpcy5fY2hlY2tib3hEaW1lbnMgPSBjaGVja2JveERpbWVucztcblxuICAgIC8qKiBTZXQgdXAgbW91c2UgdHJhY2tpbmcgKi9cbiAgICB0aGlzLl9iaW5kTW91c2VNb3ZlbWVudCgpO1xuXG4gICAgLyoqIFNldCB1cCBrZWJvYXJkIHRyYWNraW5nICovXG4gICAgdGhpcy5fYmluZEtleWJvYXJkSW5wdXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBnYW1lIGJvYXJkIHRoYXQgdHJhY2tzIG1vdXNlIG1vdmVtZW50LlxuICAgKi9cbiAgX2JpbmRNb3VzZU1vdmVtZW50KCkge1xuICAgIC8qKiBMaXN0ZW4gZm9yIG1vdXNlIG1vdmVtZW50cyAqL1xuICAgIHRoaXMuX2dhbWVCb2FyZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGU6TW91c2VFdmVudCkgPT4ge1xuICAgICAgbGV0IGVsZW1lbnRQb3NpdGlvbiA9IGdldEVsZW1lbnRQb3NpdGlvbih0aGlzLl9nYW1lQm9hcmRFbGVtZW50KTtcblxuICAgICAgLy8qKiBDb252ZXJ0IG1vdXNlIHBvc2l0aW9uIHRvIGdyaWQgcG9zaXRpb24gKi9cbiAgICAgIGxldCByb3VuZGVkWCA9IE1hdGgucm91bmQoKGUucGFnZVggLSBlbGVtZW50UG9zaXRpb24ubGVmdCkgLyB0aGlzLl9jaGVja2JveERpbWVucy53aWR0aCk7XG4gICAgICBsZXQgcm91bmRlZFkgPSBNYXRoLnJvdW5kKChlLnBhZ2VZIC0gZWxlbWVudFBvc2l0aW9uLnRvcCkgLyB0aGlzLl9jaGVja2JveERpbWVucy5oZWlnaHQpO1xuXG4gICAgICAvLyoqIENsYW1wIHBvc2l0aW9uIHRvIGJlIHdpdGhpbiB0aGUgYm9hcmQgKi9cbiAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZUNvb3Jkcy54ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4ocm91bmRlZFgsIHRoaXMuX2JvYXJkV2lkdGggLSAxKSk7XG4gICAgICB0aGlzLl9jdXJyZW50TW91c2VDb29yZHMueSA9IE1hdGgubWF4KDAsIE1hdGgubWluKHJvdW5kZWRZLCB0aGlzLl9ib2FyZEhlaWdodCAtIDEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBrZXlib2FyZCBpbnB1dCB0byB0aGUgYm9keSBvYmplY3QgYW5kIGtlZXBzIHRyYWNrIG9mIHdoYXRcbiAgICoga2V5cyBhcmUgYmVpbmcgcHJlc3NlZC5cbiAgICovXG4gIF9iaW5kS2V5Ym9hcmRJbnB1dCgpIHtcbiAgICAvKiogQWRkIGtleWRvd24gbGlzdGVuZXIgKi9cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBlID0+IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlzW2Uud2hpY2hdID0gdGhpcy5fY3VycmVudEtleXNbZS53aGljaF0gfHwge307XG4gICAgICB0aGlzLl9jdXJyZW50S2V5c1tlLndoaWNoXS5kb3duID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIC8qKiBBZGQga2V5dXAgbGlzdGVuZXIgKi9cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZSA9PiB7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5c1tlLndoaWNoXSA9IHRoaXMuX2N1cnJlbnRLZXlzW2Uud2hpY2hdIHx8IHt9O1xuICAgICAgdGhpcy5fY3VycmVudEtleXNbZS53aGljaF0uZG93biA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFzY2lpIGNvZGUgb2YgdGhlIGNoYXJhY3RlciBpbiB0aGUgZmlyc3QgcG9zaXRpb24gb2ZcbiAgICogYSBnaXZlbiBzdHJpbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgU3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNoYXJhY3RlciB5b3Ugd2FudCB0aGUgYXNjaWkgY29kZSBvZi5cbiAgICovXG4gIHN0YXRpYyBhc2NpaShrZXk6c3RyaW5nKSB7XG4gICAgcmV0dXJuIGtleS5jaGFyQ29kZUF0KDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgYSBrZXkgd2l0aCB0aGUgcHJvdmlkZWQgY29kZSBpcyBjdXJyZW50bHkgYmVpbmcgaGVsZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGtleWNvZGUgS2V5Y29kZSBvZiB0aGUga2V5IHlvdSB3YW50IHRvIGNoZWNrLlxuICAgKi9cbiAgaXNLZXlEb3duKGtleWNvZGU6bnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRLZXlzW2tleWNvZGVdID8gdGhpcy5fY3VycmVudEtleXNba2V5Y29kZV0uZG93biA6IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIG9mIHRoZSBtb3VzZS5cbiAgICovXG4gIGdldCBtb3VzZVBvc2l0aW9uKCk6YW55IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudE1vdXNlQ29vcmRzO1xuICB9XG59IiwiZXhwb3J0ICogZnJvbSAnLi9JbnB1dE1hbmFnZXInOyIsImltcG9ydCB7IFNwcml0ZURhdGEgfSBmcm9tICcuL3Nwcml0ZURhdGEuaW50ZXJmYWNlJzsgXG5pbXBvcnQgeyBkZWZhdWx0Q2hhcmFjdGVyTWFwIH0gZnJvbSAnLi9kZWZhdWx0Q2hhcmFjdGVyTWFwJztcblxuLyoqXG4gKiBTcHJpdGUgY2xhc3MsIHJlcHJlc2VudHMgYSBncmFwaGljYWwgYXNzZXQgdXNhYmxlIGJ5IHRoZSBnYW1lLlxuICovXG5leHBvcnQgY2xhc3MgU3ByaXRlIHtcblxuICAvKiogT3B0aW9ucyAqL1xuICBcbiAgX3Nwcml0ZURhdGE6IFNwcml0ZURhdGE7XG4gIF9wcmVjaXNlOiBib29sZWFuO1xuXG4gIC8qKiBQcm9wZXJ0aWVzICovXG4gIFxuICBfd2lkdGg6IG51bWJlciA9IDA7XG4gIF9oZWlnaHQ6IG51bWJlciA9IDA7XG5cbiAgLyoqXG4gICAqIFxuICAgKiBAcGFyYW0ge1Nwcml0ZURhdGF9IHNwcml0ZURhdGEgU3ByaXRlIGRhdGEgdGhhdCBkZWZpbmVzIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSBzcHJpdGUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3ByZWNpc2U9ZmFsc2VdIFVzZSBwcmVjaXNlIGNvbGxpc2lvbiBjaGVja2luZy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNwcml0ZURhdGE6U3ByaXRlRGF0YSwgcHJlY2lzZTpib29sZWFuID0gZmFsc2UpIHtcbiAgICB0aGlzLl9zcHJpdGVEYXRhID0gU3ByaXRlLm5vcm1hbGl6ZVNwcml0ZURhdGEoc3ByaXRlRGF0YSk7XG4gICAgdGhpcy5fcHJlY2lzZSA9IHByZWNpc2U7XG5cbiAgICAvKiogQXNzaWduIGRlZmF1bHQgb3JpZ2luICovXG4gICAgaWYgKCF0aGlzLl9zcHJpdGVEYXRhLm9yaWdpbikgeyB0aGlzLl9zcHJpdGVEYXRhLm9yaWdpbiA9IHsgeDowLCB5OjAgfTsgfSAgICBcblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHNwcml0ZSAqL1xuICAgIHRoaXMuX3Nwcml0ZURhdGEucG9pbnRzLmZvckVhY2gocG9pbnRSb3cgPT4ge1xuICAgICAgdGhpcy5fd2lkdGggPSBwb2ludFJvdy5sZW5ndGggPiB0aGlzLl93aWR0aCA/IHBvaW50Um93Lmxlbmd0aCA6IHRoaXMuX3dpZHRoO1xuICAgICAgdGhpcy5faGVpZ2h0Kys7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBzcHJpdGUgZGF0YSBvZiB0ZXh0IGNoYXJhY3RlcnMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGV4dCB0byB1c2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjaGFyYWN0ZXJNYXAgQ2hhcmFjdGVyIG1hcCB0byB1c2UuXG4gICAqIEByZXR1cm5zIHtTcHJpdGVEYXRhfSBDb25zdHJ1Y3RlZCBzcHJpdGUgZGF0YS5cbiAgICovXG4gIHN0YXRpYyB0ZXh0KHN0cjpzdHJpbmcsIGNoYXJhY3Rlck1hcD1kZWZhdWx0Q2hhcmFjdGVyTWFwKTpTcHJpdGVEYXRhIHtcbiAgICBsZXQgdGV4dFNwcml0ZURhdGE6U3ByaXRlRGF0YSA9IHsgcG9pbnRzOiBbXSB9O1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IGNoYXJQb2ludHMgPSBjaGFyYWN0ZXJNYXAuY2hhcmFjdGVyc1tzdHJbaV1dO1xuICAgICAgaWYgKGNoYXJQb2ludHMpIHtcbiAgICAgICAgY2hhclBvaW50cy5mb3JFYWNoKChjaGFyUm93OmFueSwgaW5kZXg6bnVtYmVyKSA9PiB7XG4gICAgICAgICAgaWYgKHRleHRTcHJpdGVEYXRhLnBvaW50c1tpbmRleF0pIHtcbiAgICAgICAgICAgIHRleHRTcHJpdGVEYXRhLnBvaW50c1tpbmRleF0gPSBbXG4gICAgICAgICAgICAgIC4uLnRleHRTcHJpdGVEYXRhLnBvaW50c1tpbmRleF0sXG4gICAgICAgICAgICAgIC1jaGFyYWN0ZXJNYXAub3B0aW9ucy5zcGFjaW5ncyxcbiAgICAgICAgICAgICAgLi4uY2hhclJvd1xuICAgICAgICAgICAgXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dFNwcml0ZURhdGEucG9pbnRzW2luZGV4XSA9IFtcbiAgICAgICAgICAgICAgLi4uY2hhclJvd1xuICAgICAgICAgICAgXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRleHRTcHJpdGVEYXRhLm9yaWdpbiA9IHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVNwcml0ZURhdGEodGV4dFNwcml0ZURhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgc2hvcnRoYW5kIHNwcml0ZSBkYXRhLlxuICAgKiBAcGFyYW0ge1Nwcml0ZURhdGF9IHNwcml0ZURhdGEgU3ByaXRlIGRhdGEgdG8gbm9ybWFsaXplXG4gICAqL1xuICBzdGF0aWMgbm9ybWFsaXplU3ByaXRlRGF0YShzcHJpdGVEYXRhOlNwcml0ZURhdGEpOlNwcml0ZURhdGEge1xuICAgIGxldCBmaXhlZFBvaW50czpBcnJheTxBcnJheTxudW1iZXI+PiA9IFtdO1xuXG4gICAgc3ByaXRlRGF0YS5wb2ludHMuZm9yRWFjaChwb2ludFJvdyA9PiB7XG4gICAgICBsZXQgbmV3Um93OkFycmF5PG51bWJlcj4gPSBbXTtcbiAgICAgIHBvaW50Um93LmZvckVhY2goKHBvaW50LCBpbmRleCwgYXJyKSA9PiB7XG4gICAgICAgIGlmIChwb2ludCA8IDApIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IChwb2ludCAqIC0xKTsgaSsrKSB7XG4gICAgICAgICAgICBuZXdSb3cucHVzaCgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocG9pbnQgPiAxKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2ludDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdSb3cucHVzaCgxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3Um93LnB1c2gocG9pbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGZpeGVkUG9pbnRzLnB1c2gobmV3Um93KTtcbiAgICB9KTtcblxuICAgIGxldCBub3JtYWxpemVkU3ByaXRlOlNwcml0ZURhdGEgPSB7XG4gICAgICBwb2ludHM6IGZpeGVkUG9pbnRzLFxuICAgICAgb3JpZ2luOiBzcHJpdGVEYXRhLm9yaWdpblxuICAgIH07XG5cbiAgICByZXR1cm4gbm9ybWFsaXplZFNwcml0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIGdpdmVuIHNwcml0ZSBkYXRhLlxuICAgKiBAcGFyYW0ge1Nwcml0ZURhdGF9IHNwcml0ZURhdGEgVGhlIHNwcml0ZSBkYXRhIHlvdSB3aXNoIHRvIGludmVyc2UuXG4gICAqL1xuICBzdGF0aWMgaW52ZXJzZShzcHJpdGVEYXRhOlNwcml0ZURhdGEpOlNwcml0ZURhdGEge1xuICAgIGxldCBpbnZlcnNlU3ByaXRlRGF0YTpTcHJpdGVEYXRhID0gc3ByaXRlRGF0YTtcblxuICAgIGludmVyc2VTcHJpdGVEYXRhLnBvaW50cy5mb3JFYWNoKHBvaW50Um93ID0+IHtcbiAgICAgIHBvaW50Um93LmZvckVhY2goKHBvaW50LCBpbmRleCwgYXJyKSA9PiB7XG4gICAgICAgIGlmICgocG9pbnQgPiAxKSB8fCAocG9pbnQgPCAwKSkge1xuICAgICAgICAgIGFycltpbmRleF0gPSBwb2ludCAqIC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFycltpbmRleF0gPSBwb2ludCA9PT0gMSA/IDAgOiAxOyAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW52ZXJzZVNwcml0ZURhdGE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3ByaXRlRGF0YSBvZiB0aGUgc3ByaXRlLlxuICAgKiBAcmV0dXJucyB7U3ByaXRlRGF0YX0gc3ByaXRlRGF0YS5cbiAgICovXG4gIGdldCBzcHJpdGVEYXRhKCk6U3ByaXRlRGF0YSB7IHJldHVybiB0aGlzLl9zcHJpdGVEYXRhOyB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNwcml0ZSBkYXRhIG9mIHRoZSBzcHJpdGVcbiAgICogQHBhcmFtIHtTcHJpdGVEYXRhfSBhIE5ldyBzcHJpdGUgZGF0YS5cbiAgICovXG4gIHNldCBzcHJpdGVEYXRhKGEpIHsgdGhpcy5fc3ByaXRlRGF0YSA9IGE7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiB0aGUgc3ByaXRlIGlzIHByZWNpc2UuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBTcHJpdGUgaXMgcHJlY2lzZS5cbiAgICovXG4gIGdldCBwcmVjaXNlKCk6Ym9vbGVhbiB7IHJldHVybiB0aGlzLl9wcmVjaXNlOyB9XG5cbiAgc2V0IHByZWNpc2UoYTpib29sZWFuKSB7IHRoaXMuX3ByZWNpc2UgPSBhOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBzcHJpdGUuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFNwcml0ZSB3aWR0aC5cbiAgICovXG4gIGdldCB3aWR0aCgpOm51bWJlciB7IHJldHVybiB0aGlzLl93aWR0aDsgfVxuXG4gIHNldCB3aWR0aChhKSB7IHRocm93IG5ldyBFcnJvcignV2lkdGggaXMgYSByZWFkb25seSBwcm9wZXJ0eS4nKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIHNwcml0ZS5cbiAgICogQHJldHVybnMge251bWJlcn0gU3ByaXRlIGhlaWdodC5cbiAgICovXG4gIGdldCBoZWlnaHQoKTpudW1iZXIgeyByZXR1cm4gdGhpcy5faGVpZ2h0OyB9XG5cbiAgc2V0IGhlaWdodChhKSB7IHRocm93IG5ldyBFcnJvcignSGVpZ2h0IGlzIGEgcmVhZG9ubHkgcHJvcGVydHkuJyk7IH1cbn0iLCJjb25zdCBsb3dlckNhc2VBbHBoYTphbnkgPSB7XG4gICdhJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV1cbiAgXSxcbiAgJ2InOiBbXG4gICAgWzMsIDBdLFxuICAgIFsxLCAwLCAxLCAwXSxcbiAgICBbNF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbNF1cbiAgXSxcbiAgJ2MnOiBbXG4gICAgWzRdLFxuICAgIFsxLCAtM10sXG4gICAgWzEsIC0zXSxcbiAgICBbMSwgLTNdLFxuICAgIFs0XVxuICBdLFxuICAnZCc6IFtcbiAgICBbMywgMF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzMsIDBdXG4gIF0sXG4gICdlJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTNdLFxuICAgIFszLCAwXSxcbiAgICBbMSwgLTNdLFxuICAgIFs0XVxuICBdLFxuICAnZic6IFtcbiAgICBbNF0sXG4gICAgWzEsIC0zXSxcbiAgICBbMywgMF0sXG4gICAgWzEsIC0zXSxcbiAgICBbMSwgLTNdXG4gIF0sXG4gICdnJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTNdLFxuICAgIFsxLCAwLCAyXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XVxuICBdLFxuICAnaCc6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzRdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXVxuICBdLFxuICAnaSc6IFtcbiAgICBbM10sXG4gICAgWzAsIDEsIDBdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzNdXG4gIF0sXG4gICdqJzogW1xuICAgIFswLCAzXSxcbiAgICBbLTIsIDEsIDBdLFxuICAgIFstMiwgMSwgMF0sXG4gICAgWzEsIDAsIDEsIDBdLFxuICAgIFszLCAwXVxuICBdLFxuICAnayc6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAwLCAxLCAwXSxcbiAgICBbMiwgMCwgMF0sXG4gICAgWzEsIDAsIDEsIDBdLFxuICAgIFsxLCAtMiwgMV1cbiAgXSxcbiAgJ2wnOiBbXG4gICAgWzEsIC0zXSxcbiAgICBbMSwgLTNdLFxuICAgIFsxLCAtM10sXG4gICAgWzEsIC0zXSxcbiAgICBbNF1cbiAgXSxcbiAgJ20nOiBbXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbNF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV1cbiAgXSxcbiAgJ24nOiBbXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsyLCAwLCAxXSxcbiAgICBbMSwgMCwgMl0sXG4gICAgWzEsIC0yLCAxXVxuICBdLFxuICAnbyc6IFtcbiAgICBbNF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzRdXG4gIF0sXG4gICdwJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgLTNdLFxuICAgIFsxLCAtM11cbiAgXSxcbiAgJ3EnOiBbXG4gICAgWzRdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgMCwgMl0sXG4gICAgWzRdXG4gIF0sXG4gICdyJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgMCwgMSwgMF0sXG4gICAgWzEsIC0yLCAxXVxuICBdLFxuICAncyc6IFtcbiAgICBbNF0sXG4gICAgWzEsIC0zXSxcbiAgICBbNF0sXG4gICAgWy0zLCAxXSxcbiAgICBbNF1cbiAgXSxcbiAgJ3QnOiBbXG4gICAgWzNdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzAsIDEsIDBdLFxuICAgIFswLCAxLCAwXVxuICBdLFxuICAndSc6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XVxuICBdLFxuICAndic6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMCwgMiwgMF0sXG4gICAgWzAsIDIsIDBdXG4gIF0sXG4gICd3JzogW1xuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdXG4gIF0sXG4gICd4JzogW1xuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMCwgMiwgMF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdXG4gIF0sXG4gICd5JzogW1xuICAgIFsxLCAwLCAxXSxcbiAgICBbMSwgMCwgMV0sXG4gICAgWzNdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMF1cbiAgXSxcbiAgJ3onOiBbXG4gICAgWzRdLFxuICAgIFstMywgMV0sXG4gICAgWy0yLCAxLCAwXSxcbiAgICBbMCwgMSwgLTJdLFxuICAgIFs0XVxuICBdXG59O1xuXG5jb25zdCB1cHBlckNhc2VBbHBoYTphbnkgPSB7XG4gICdBJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV1cbiAgXSxcbiAgJ0InOiBbXG4gICAgWzMsIDBdLFxuICAgIFsxLCAwLCAxLCAwXSxcbiAgICBbNF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbNF1cbiAgXSxcbiAgJ0MnOiBbXG4gICAgWzRdLFxuICAgIFsxLCAtM10sXG4gICAgWzEsIC0zXSxcbiAgICBbMSwgLTNdLFxuICAgIFs0XVxuICBdLFxuICAnRCc6IFtcbiAgICBbMywgMF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzMsIDBdXG4gIF0sXG4gICdFJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTNdLFxuICAgIFszLCAwXSxcbiAgICBbMSwgLTNdLFxuICAgIFs0XVxuICBdLFxuICAnRic6IFtcbiAgICBbNF0sXG4gICAgWzEsIC0zXSxcbiAgICBbMywgMF0sXG4gICAgWzEsIC0zXSxcbiAgICBbMSwgLTNdXG4gIF0sXG4gICdHJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTNdLFxuICAgIFsxLCAwLCAyXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XVxuICBdLFxuICAnSCc6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzRdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXVxuICBdLFxuICAnSSc6IFtcbiAgICBbM10sXG4gICAgWzAsIDEsIDBdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzNdXG4gIF0sXG4gICdKJzogW1xuICAgIFswLCAzXSxcbiAgICBbLTIsIDEsIDBdLFxuICAgIFstMiwgMSwgMF0sXG4gICAgWzEsIDAsIDEsIDBdLFxuICAgIFszLCAwXVxuICBdLFxuICAnSyc6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAwLCAxLCAwXSxcbiAgICBbMiwgMCwgMF0sXG4gICAgWzEsIDAsIDEsIDBdLFxuICAgIFsxLCAtMiwgMV1cbiAgXSxcbiAgJ0wnOiBbXG4gICAgWzEsIC0zXSxcbiAgICBbMSwgLTNdLFxuICAgIFsxLCAtM10sXG4gICAgWzEsIC0zXSxcbiAgICBbNF1cbiAgXSxcbiAgJ00nOiBbXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbNF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV1cbiAgXSxcbiAgJ04nOiBbXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsyLCAwLCAxXSxcbiAgICBbMSwgMCwgMl0sXG4gICAgWzEsIC0yLCAxXVxuICBdLFxuICAnTyc6IFtcbiAgICBbNF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzRdXG4gIF0sXG4gICdQJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgLTNdLFxuICAgIFsxLCAtM11cbiAgXSxcbiAgJ1EnOiBbXG4gICAgWzRdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgMCwgMl0sXG4gICAgWzRdXG4gIF0sXG4gICdSJzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgMCwgMSwgMF0sXG4gICAgWzEsIC0yLCAxXVxuICBdLFxuICAnUyc6IFtcbiAgICBbNF0sXG4gICAgWzEsIC0zXSxcbiAgICBbNF0sXG4gICAgWy0zLCAxXSxcbiAgICBbNF1cbiAgXSxcbiAgJ1QnOiBbXG4gICAgWzNdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzAsIDEsIDBdLFxuICAgIFswLCAxLCAwXVxuICBdLFxuICAnVSc6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XVxuICBdLFxuICAnVic6IFtcbiAgICBbMSwgLTIsIDFdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMCwgMiwgMF0sXG4gICAgWzAsIDIsIDBdXG4gIF0sXG4gICdXJzogW1xuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdXG4gIF0sXG4gICdYJzogW1xuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMCwgMiwgMF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdXG4gIF0sXG4gICdZJzogW1xuICAgIFsxLCAwLCAxXSxcbiAgICBbMSwgMCwgMV0sXG4gICAgWzNdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMF1cbiAgXSxcbiAgJ1onOiBbXG4gICAgWzRdLFxuICAgIFstMywgMV0sXG4gICAgWy0yLCAxLCAwXSxcbiAgICBbMCwgMSwgLTJdLFxuICAgIFs0XVxuICBdXG59O1xuXG5jb25zdCBudW1iZXJzOmFueSA9IHtcbiAgJzAnOiBbXG4gICAgWzAsIDIsIDBdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFswLCAyLCAwXVxuICBdLFxuICAnMSc6IFtcbiAgICBbMCwgMSwgMF0sXG4gICAgWzIsIDBdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzNdXG4gIF0sXG4gICcyJzogW1xuICAgIFswLCAyLCAwXSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFstMiwgMSwgMF0sXG4gICAgWzAsIDEsIC0yXSxcbiAgICBbNF1cbiAgXSxcbiAgJzMnOiBbXG4gICAgWzRdLFxuICAgIFstMywgMV0sXG4gICAgWzAsIDNdLFxuICAgIFstMywgMV0sXG4gICAgWzRdXG4gIF0sXG4gICc0JzogW1xuICAgIFsxLCAtMiwgMV0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbNF0sXG4gICAgWy0zLCAxXSxcbiAgICBbLTMsIDFdXG4gIF0sXG4gICc1JzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTNdLFxuICAgIFszLCAwXSxcbiAgICBbLTMsIDFdLFxuICAgIFs0XVxuICBdLFxuICAnNic6IFtcbiAgICBbNF0sXG4gICAgWzEsIC0zXSxcbiAgICBbNF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbNF1cbiAgXSxcbiAgJzcnOiBbXG4gICAgWzRdLFxuICAgIFstMywgMV0sXG4gICAgWy0zLCAxXSxcbiAgICBbLTMsIDFdLFxuICAgIFstMywgMV1cbiAgXSxcbiAgJzgnOiBbXG4gICAgWzRdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzRdLFxuICAgIFsxLCAtMiwgMV0sXG4gICAgWzRdXG4gIF0sXG4gICc5JzogW1xuICAgIFs0XSxcbiAgICBbMSwgLTIsIDFdLFxuICAgIFs0XSxcbiAgICBbLTMsIDFdLFxuICAgIFstMywgMV1cbiAgXVxufTtcblxuY29uc3Qgc3ltYm9sczphbnkgPSB7XG4gICcgJzogW1xuICAgIFstM10sXG4gICAgWy0zXSxcbiAgICBbLTNdLFxuICAgIFstM10sXG4gICAgWy0zXVxuICBdLFxuICAnLCc6IFtcbiAgICBbLTJdLFxuICAgIFstMl0sXG4gICAgWy0yXSxcbiAgICBbMCwgMV0sXG4gICAgWzJdXG4gIF0sXG4gICcuJzogW1xuICAgIFswXSxcbiAgICBbMF0sXG4gICAgWzBdLFxuICAgIFswXSxcbiAgICBbMV1cbiAgXSxcbiAgJy8nOiBbXG4gICAgWy0zLCAxXSxcbiAgICBbLTIsIDJdLFxuICAgIFswLCAyLCAtMV0sXG4gICAgWzIsIC0yXSxcbiAgICBbMSwgLTNdXG4gIF0sXG4gICc7JzogW1xuICAgIFstMl0sXG4gICAgWzAsIDFdLFxuICAgIFstMl0sXG4gICAgWzAsIDFdLFxuICAgIFsxLCAwXVxuICBdLFxuICAnXFwnJzogW1xuICAgIFsxXSxcbiAgICBbMV0sXG4gICAgWzBdLFxuICAgIFswXSxcbiAgICBbMF1cbiAgXSxcbiAgJ1snOiBbXG4gICAgWzJdLFxuICAgIFsxLCAwXSxcbiAgICBbMSwgMF0sXG4gICAgWzEsIDBdLFxuICAgIFsyXVxuICBdLFxuICAnXSc6IFtcbiAgICBbMl0sXG4gICAgWzAsIDFdLFxuICAgIFswLCAxXSxcbiAgICBbMCwgMV0sXG4gICAgWzJdXG4gIF0sXG4gICdcXFxcJzogW1xuICAgIFsxLCAtM10sXG4gICAgWzIsIC0yXSxcbiAgICBbMCwgMiwgLTFdLFxuICAgIFstMiwgMl0sXG4gICAgWy0zLCAxXVxuICBdLFxuICAnLSc6IFtcbiAgICBbLTNdLFxuICAgIFstM10sXG4gICAgWzNdLFxuICAgIFstM10sXG4gICAgWy0zXVxuICBdLFxuICAnPSc6IFtcbiAgICBbLTNdLFxuICAgIFszXSxcbiAgICBbLTNdLFxuICAgIFszXSxcbiAgICBbLTNdXG4gIF0sXG4gICc8JzogW1xuICAgIFstMiwgMV0sXG4gICAgWzAsIDEsIDBdLFxuICAgIFsxLCAtMl0sXG4gICAgWzAsIDEsIDBdLFxuICAgIFstMiwgMV1cbiAgXSxcbiAgJz4nOiBbXG4gICAgWzEsIC0yXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWy0yLCAxXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzEsIC0yXVxuICBdLFxuICAnPyc6IFtcbiAgICBbMCwgMiwgMF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbLTIsIDEsIDBdLFxuICAgIFstNF0sXG4gICAgWy0yLCAxLCAwXVxuICBdLFxuICAnOic6IFtcbiAgICBbMF0sXG4gICAgWzFdLFxuICAgIFswXSxcbiAgICBbMF0sXG4gICAgWzFdXG4gIF0sXG4gICdcIic6IFtcbiAgICBbMSwgMCwgMV0sXG4gICAgWzEsIDAsIDFdLFxuICAgIFstM10sXG4gICAgWy0zXSxcbiAgICBbLTNdXG4gIF0sXG4gICd7JzogW1xuICAgIFswLCAyXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzEsIC0yXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzAsIDJdXG4gIF0sXG4gICd9JzogW1xuICAgIFsyLCAwXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWy0yLCAxXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzIsIDBdXG4gIF0sXG4gICd8JzogW1xuICAgIFsxXSxcbiAgICBbMV0sXG4gICAgWzFdLFxuICAgIFsxXSxcbiAgICBbMV1cbiAgXSxcbiAgJyEnOiBbXG4gICAgWzFdLFxuICAgIFsxXSxcbiAgICBbMV0sXG4gICAgWzBdLFxuICAgIFsxXVxuICBdLFxuICAnQCc6IFtcbiAgICBbMCwgMiwgMF0sXG4gICAgWzEsIC0yLCAxXSxcbiAgICBbMSwgMCwgMl0sXG4gICAgWzEsIC0zXSxcbiAgICBbMCwgMiwgMF1cbiAgXSxcbiAgICcjJzogW1xuICAgICBbMCwgMSwgMCwgMV0sXG4gICAgIFs0XSxcbiAgICAgWzAsIDEsIDAsIDFdLFxuICAgICBbNF0sXG4gICAgIFswLCAxLCAwLCAxXVxuICAgXSxcbiAgICckJzogW1xuICAgICBbMCwgMSwgMF0sXG4gICAgIFszXSxcbiAgICAgWzIsIDBdLFxuICAgICBbMCwgMl0sXG4gICAgIFszXVxuICAgXSxcbiAgICclJzogW1xuICAgICBbMSwgLTIsIDFdLFxuICAgICBbLTIsIDJdLFxuICAgICBbMCwgMiwgLTFdLFxuICAgICBbMiwgLTJdLFxuICAgICBbMSwgLTIsIDFdXG4gICBdLFxuICAgJ14nOiBbXG4gICAgIFswLCAxLCAwXSxcbiAgICAgWzEsIDAsIDFdLFxuICAgICBbLTNdLFxuICAgICBbLTNdLFxuICAgICBbLTNdXG4gICBdLFxuICAgJyYnOiBbXG4gICAgIFszLCAwXSxcbiAgICAgWzEsIDAsIDEsIDBdLFxuICAgICBbMiwgMCwgMV0sXG4gICAgIFsxLCAwLCAxLCAwXSxcbiAgICAgWzAsIDEsIDAsIDFdXG4gICBdLFxuICAgJyonOiBbXG4gICAgIFstM10sXG4gICAgIFsxLCAwLCAxXSxcbiAgICAgWzAsIDEsIDBdLFxuICAgICBbMSwgMCwgMV0sXG4gICAgIFstM11cbiAgIF0sXG4gICAnKCc6IFtcbiAgICBbMCwgMV0sXG4gICAgWzEsIDBdLFxuICAgIFsxLCAwXSxcbiAgICBbMSwgMF0sXG4gICAgWzAsIDFdXG4gIF0sXG4gICcpJzogW1xuICAgIFsxLCAwXSxcbiAgICBbMCwgMV0sXG4gICAgWzAsIDFdLFxuICAgIFswLCAxXSxcbiAgICBbMSwgMF1cbiAgXSxcbiAgJ18nOiBbXG4gICAgWy0zXSxcbiAgICBbLTNdLFxuICAgIFstM10sXG4gICAgWy0zXSxcbiAgICBbM11cbiAgXSxcbiAgJysnOiBbXG4gICAgWy0zXSxcbiAgICBbMCwgMSwgMF0sXG4gICAgWzNdLFxuICAgIFswLCAxLCAwXSxcbiAgICBbLTNdXG4gIF0sXG4gICdgJzogW1xuICAgIFsxLCAwXSxcbiAgICBbMCwgMV0sXG4gICAgWy0yXSxcbiAgICBbLTJdLFxuICAgIFstMl1cbiAgXSxcbiAgJ34nOiBbXG4gICAgWy00XSxcbiAgICBbMCwgMSwgMCwgMV0sXG4gICAgWzEsIDAsIDEsIDBdLFxuICAgIFstNF0sXG4gICAgWy00XVxuICBdXG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdENoYXJhY3Rlck1hcDphbnkgPSB7XG4gIG9wdGlvbnM6IHtcbiAgICBzcGFjaW5nOiAxXG4gIH0sXG4gIGNoYXJhY3RlcnM6IHtcbiAgICAuLi5sb3dlckNhc2VBbHBoYSxcbiAgICAuLi51cHBlckNhc2VBbHBoYSxcbiAgICAuLi5udW1iZXJzLFxuICAgIC4uLnN5bWJvbHNcbiAgfVxufTsiLCJleHBvcnQgKiBmcm9tICcuL1Nwcml0ZSc7XG5leHBvcnQgKiBmcm9tICcuL3Nwcml0ZURhdGEuaW50ZXJmYWNlJztcbmV4cG9ydCAqIGZyb20gJy4vZGVmYXVsdENoYXJhY3Rlck1hcCc7IiwiaW1wb3J0IHsgR3JhcGhpY3MgfSBmcm9tICcuLi9ncmFwaGljcyc7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBldmVyeSBnYW1lIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRHYW1lT2JqZWN0T3B0aW9uczphbnkgPSB7XG4gIHg6IDAsIC8vIFRoZSBzdGFydGluZyBYIHBvc2l0aW9uIG9mIHRoZSBnYW1lIG9iamVjdCBvbiB0aGUgYm9hcmQuXG4gIHk6IDAsIC8vIFRoZSBzdGFydGluZyBZIHBvc2l0aW9uIG9mIHRoZSBnYW1lIG9iamVjdCBvbiB0aGUgYm9hcmQuXG4gIHNwcml0ZTogdW5kZWZpbmVkLCAvLyBUaGUgc3ByaXRlIHRoYXQgYmVsb25ncyB0byB0aGUgZ2FtZSBvYmplY3QuXG4gIGluaXQ6IGZ1bmN0aW9uKCl7fSwgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBnYW1lIG9iamVjdCBpcyBmaXJzdCBhZGRlZCB0byB0aGUgZ2FtZSBib2FyZCBhbmQgaXMgcGFzc2VkIGFuIGluc3RhbmNlIGlkLlxuICB1cGRhdGU6IGZ1bmN0aW9uKCl7fSwgLy8gRnVuY3Rpb24gdG8gY2FsbCBldmVyeSBnYW1lIGZyYW1lIGFuZCBpcyBwYXNzZWQgYW4gaW5zdGFuY2UgaWQuXG4gIFxuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGV2ZXJ5IGdhbWUgZnJhbWUsIGFuZFxuICAvLyBpcyBwYXNzZWQgaW5zdGFuY2UgaWQgYW5kIGEgcmVmZXJlbmNlIHRvIHRoZSBncmFwaGljcyBjbGFzcy5cbiAgZHJhdzogZnVuY3Rpb24oaWQ6bnVtYmVyLCBncmFwaGljczogR3JhcGhpY3MpIHtcbiAgICBpZiAodGhpcy5fc3ByaXRlKSB7XG4gICAgICBncmFwaGljcy5kcmF3U3ByaXRlKHRoaXMuX3Nwcml0ZSwgdGhpcy5feCwgdGhpcy5feSk7XG4gICAgfVxuICB9LFxuICBkZXN0cm95OiBmdW5jdGlvbigpe30gLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBnYW1lIG9iamVjdCBpcyByZW1vdmVkIGZyb20gdGhlIGJvYXJkLlxufSIsIi8qKlxuICogUmVwcmVzZW50cyB0aGUgZGVmYXVsdCBvcHRpb25zIGV2ZXJ5IGdhbWUgaGFzLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdEdhbWVPcHRpb25zOmFueSA9IHtcbiAgd2lkdGg6IDE1LCAvLyBXaWR0aCBvZiB0aGUgZ2FtZSBib2FyZFxuICBoZWlnaHQ6IDE1LCAvLyBIZWlnaHQgb2YgdGhlIGdhbWUgYm9hcmRcbiAgY29sbGFwc2U6IGZhbHNlLCAvLyBDb2xsYXBzZSB0aGUgc3BhY2UgYmV0d2VlbiBjaGVja2JveGVzXG4gIGhpZGVDdXJzb3I6IGZhbHNlLCAvLyBIaWRlIHRoZSBjdXJzb3Igb3ZlciB0aGUgZ2FtZWJvYXJkXG4gIHVzZVJhZGlvOiBmYWxzZSwgLy8gVXNlIHJhZGlvIGlucHV0cyBpbnN0ZWFkIG9mIGNoZWNrYm94ZXNcbiAgdXBkYXRlOiBmdW5jdGlvbigpe30gLy8gQ2FsbGJhY2sgZnVuY3Rpb24gdGhhdCB0cmlnZ2VycyBhdCB0aGUgc3RhcnQgb2YgZXZlcnkgZ2FtZSBsb29wXG59IiwiLyoqXG4gKiBSZXR1cm5zIHRoZSB0cnVlIHBvc2l0aW9uIG9mIGFuIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGUgRWxlbWVudCB0byBnZXQgdGhlIHBvc2l0aW9uIG9mLiBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRQb3NpdGlvbihlOmFueSk6YW55IHtcbiAgbGV0IGN1ckxlZnQgPSAwLFxuICAgICAgY3VyVG9wID0gMDtcblxuICBkbyB7XG4gICAgY3VyTGVmdCArPSBlLm9mZnNldExlZnQ7XG4gICAgY3VyVG9wICs9IGUub2Zmc2V0VG9wO1xuICB9IHdoaWxlIChlID0gZS5vZmZzZXRQYXJlbnQpO1xuXG4gIHJldHVybiB7XG4gICAgbGVmdDogY3VyTGVmdCxcbiAgICB0b3A6IGN1clRvcFxuICB9O1xufSIsImV4cG9ydCAqIGZyb20gJy4vZGVmYXVsdEdhbWVPcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vZGVmYXVsdEdhbWVPYmplY3RPcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0RWxlbWVudFBvc2l0aW9uJzsiLCJpbXBvcnQgJy4vcmVxdWVzdEFuaW1hdGlvbkZyYW1lJzsiLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuXG4vLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcG9seWZpbGwgYnkgRXJpayBNw7ZsbGVyLiBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXG5cbi8vIE1JVCBsaWNlbnNlXG5cbmRlY2xhcmUgdmFyIGdsb2JhbDphbnk7XG5cbnZhciBsYXN0VGltZSA9IDA7XG52YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG5mb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIWdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBnbG9iYWxbdmVuZG9yc1t4XSsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgZ2xvYmFsLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZ2xvYmFsW3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGdsb2JhbFt2ZW5kb3JzW3hdKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbn1cblxuaWYgKCFnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjazphbnksIGVsZW1lbnQ6YW55KSB7XG4gICAgICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgdmFyIGlkID0gZ2xvYmFsLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sIFxuICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfTtcblxuaWYgKCFnbG9iYWwuY2FuY2VsQW5pbWF0aW9uRnJhbWUpXG4gICAgZ2xvYmFsLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQ6YW55KSB7XG4gICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgfTsiXX0=
