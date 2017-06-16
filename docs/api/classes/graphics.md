# Check.Graphics

All game drawing is done through this class. You should *not* directly instantiate or reference this class directly apart from static methods, as the main `Game` class will have it's own reference to it. Instead, you should use the internal reference: `Check.Game.graphics`.

# Methods

## drawPoint(x, y)
Draws a point (checks a checkbox) at the given coordinates, `0, 0` being the top left checkbox.

## drawSprite(sprite, x, y)
Draws a sprite at the given coordinates.

## draw()
This process all batched drawing operations and applies all checked states to the game board. This is called **automatically** at the end of every game frame, and should only be used in specific cases where you need to update the board more than once in a single frame. This isn't recommended as it could affect the performance of your game.