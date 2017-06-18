# Check.GameObject

GameObject's control aspects of your game and interact with other GameObjects. They can have their update logic and life cycle.

```javascript
var myObject = new Check.GameObject(game, options);
```

The first parameter, game, is a reference to your Check.Game class. The second parameter is an options object with optional values:

```javascript
defaultOptions = {
  x: 0, // The starting X position of the game object on the board.
  y: 0, // The starting Y position of the game object on the board.
  sprite: undefined, // The sprite that belongs to the game object.
  autoAddToGameBoard: false, // Add the game object to the board on creation.
  init: function(){}, // Function called when the game object is added to the game board.
  update: function(){}, // Function called every game frame.
  
  // Function that is called at the end of every game frame, and
  // is passed a reference to the graphics class.
  draw: function(graphics) {
    if (this.sprite) {
      graphics.drawSprite(this.sprite, this.x, this.y);
    }
  },
  destroy: function(){} // Function called when the game object is removed from the board.
}
```