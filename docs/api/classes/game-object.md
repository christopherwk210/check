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
  init: function(){}, // Function called when the game object is added to the game board.
  update: function(){}, // Function called every game frame.
  draw: function(id, graphics) { // Function that is called at the end of every game frame.
    if (this.sprite) {
      graphics.drawSprite(this.sprite, this.x, this.y);
    }
  },
  destroy: function(){} // Function called when the game object is removed from the board.
}
```

# Lifecycle Methods

All lifecycle methods other than destroy are passed an instance id so that the function can manipulate the current instance of the object.

## init(id)
This function is called once when the object is added to the board.

## update(id)
This function is called every frame of the game.

## draw(id, graphics)
This function is called at the end of every frame, and is passed a graphics reference for drawing. The default draw function draws the object's sprite, so when you override this method you'll have to account for that.

## destroy()
This function is called when the object is removed from the board.

# Methods

## checkCollision(object|id)
Returns true or false depending on if the object is colliding with a given object or instance.

## `get` x
Returns the object's x position in the room.

## `set` x
Sets the object's x position in the room.

## `get` y
Returns the object's y position in the room.

## `set` y
Sets the object's y position in the room.

## `get` sprite
Returns the object's sprite.

## `set` sprite
Sets the object's sprite.