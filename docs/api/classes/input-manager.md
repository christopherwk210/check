# Check.InputManager

This class handles user input by way of the mouse and keyboard. Touchscreen input is not supported, and there are no plans to add support at this time. You should *not* directly instantiate or reference this class directly apart from static methods, as the main `Game` class will have it's own reference to it. Instead, you should use the internal reference: `Check.Game.input`.

# Methods

## `get` mousePosition
Returns the position of the mouse over the game board as grid coordinates in the form of an object:

```javascript
var mousePos = game.input.mousePosition; // { x: 3, y: 5 }
```