# Check.Sprite

The Sprite class represents a single "sprite", or image in your game. Since we are working with checkboxes, a sprite in our game is actually just a collection of points that represent checked checkboxes.

```javascript
var mySprite = new Check.Sprite(spriteData, precise);
```

`precise` is a boolean that decides if the sprite should use precise collision checking. If false, collisions are checked using the sprite's bounding box (a rectangle around all the points). If true, collisions are checked per checkbox in the sprite. This is a more taxing operation, so only use when needed.

# SpriteData

The `spriteData` parameter is where you'll define how your sprite looks. Sprite data should look something like this:

```javascript
var spriteData = {
  points: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1]
  ],
  origin: {
    x: 1,
    y: 1
  }
};
```

`points` is where you define what checkboxes should be checked for your sprite. A `1` represents a checked box, and a `0` represent an unchecked box. The `points` in the above example would render the following:

<p style="text-align:center">
  <img src="../images/simple_sprite.png">
</p>

`origin` defines the point that corresponds with the sprite's position on the game board. By default, this is set to `{ x: 0, y: 0 }` which represents the top left point of the sprite. In our example, we set it to be the center of our sprite.

# Methods

## `get` spriteData
Returns the spriteData of the sprite.

## `get` width
Returns the sprite width.

## `get` height
Returns the sprite height.

## `static` inverse(spriteData)
Allows you to "invert" sprite data. This will turn all `0`'s to `1`'s and vice-versa for the given sprite data:

```javascript
var spriteData = {
  points: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1]
  ]
};

var newSpriteData = Check.Sprite.inverse(spriteData);
/*
newSpriteData == {
  points: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ]
}
*/
```