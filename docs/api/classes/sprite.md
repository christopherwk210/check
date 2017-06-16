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

## Shorthand definition

Sometimes, you may want to define a long sequence of the same value in a sprite. Check lets you do this by using numbers less than zero or greater than one:

```javascript
var spriteData = {
  points: [
    [5],
    [1, -3, 1],
    [5]
  ]
};
```

The above points uses shorthand to represent longer sequences of 1's and 0's. The first row only has a single value of 5. This is translated to five 1's in a row. The second row has a -3 in the middle. This translates to three 0's in a row at that position. All together, the above points render the following:

<p style="text-align:center">
  <img src="../images/simple_sprite_shorthand.png">
</p>

## Size

The width and height of each sprite are automatically calculated by finding the longest row, and counting how many rows there are. This means that given the following:

```javascript
var spriteData = {
  points: [
    [-5],
    [-5],
    [-5]
  ]
};
```

Your sprite will have a width of 5 and a height of 3, *even though* there are no checked boxes and nothing is drawn. This is important to keep in mind when you aren't using precise collision checking, as the collision rectangle still covers empty spaces.

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

## `static` normalizeSpriteData(spriteData)
Normalizes shorthand sprite data. This function turns shorthand sprite data points into standard points and is called *automatically* when creating a new sprite.