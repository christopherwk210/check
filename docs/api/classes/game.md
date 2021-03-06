# Check.Game

This class is the entry point to your game, as it is resposible for managing the main game loop and all draw calls.

```javascript
var game = new Check.Game(element, options);
```

The element you provide will be the element that Check appends the game board to. The game board is the grid of checkboxes that is used to display everything in your game. Options is an object that takes a few different parameters:

```javascript
defaultOptions = {
  width: 15, // Width of the game board
  height: 15, // Height of the game board
  collapse: false, // Collapse the space between checkboxes
  hideCursor: false, // Hide the cursor over the gameboard
  useRadio: false, // Use radio inputs instead of checkboxes
  update: function(){} // Callback function that triggers at the start of every game loop.
}
```

The update function will be called every game loop *before* the update function of every object.

# Methods

## start()
This method kicks off the main game loop, effectively starting your game.

## addObjectToBoard(object)
Adds a game object to the board, and returns the instance id for that object. Whenever you add an object to the game board, the instance id this returns represents that exact instance of the object. This is helpful for when you need to reference that specific object, since you can multiple instances of the same object to the board.

## removeObjectFromBoard(id)
This removes an instance from the game board. This will trigger the destroy method of the object destroyed.

## getObjectById(id)
Returns an object for the given id, or -1 if none could be found.

## `get` deltaTime
Returns the delta time (ms) of each game loop. On the very first loop, this value is 0.

## `get` width
Returns the width of the game board.

## `get` height
Returns the height of the game board.

## `get` graphics
Returns the internal [Graphics](/api/classes/graphics.md) class reference, which allows you to perform drawing operations.

## `get` input
Returns the internal [InputManager](/api/classes/input-manager.md) class reference, which allows you to handle user input.