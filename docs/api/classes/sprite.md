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
  <img src="./images/simple_sprite.png">
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
  <img src="./images/simple_sprite_shorthand.png">
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

## text(str, characterMap?)
Sometimes you may want to show a text message to the player. This method will allow you to do that by constructing valid sprite data with text symbols for each character in `str`. The optional parameter `characterMap` allows you to supply custom rules that ddefine how each symbol will appear. When omitted, the default character map that ships with Check will be used.

The sprite data returned from this function will have an origin of `0,0`.

### Custom Character Map
To define a custom character map, you must pass an object that looks like the following:

```javascript
{
  options: {
    spacing: 1
  },
  characters: {
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
    ...
  }
}
```

`options.spacing` defines the amount of spaces between each character. `characters` is an object that should contain all the symbols you wish you use, defined as spriteData points.

It's important that every character in your character map has consistent row widths. This doesn't mean your character map has to represent a mono space font, but that every *row* of each character is of equal width. For example, this is good:
```javascript
'1': [
  [0, 1, 0],
  [2, 0],
  [0, 1, 0],
  [0, 1, 0],
  [3]
]
```
and this is not:
```javascript
'1': [
  [0, 1],
  [2, 0],
  [0, 1],
  [0, 1],
  [3]
]
```
When a character is not one equal width, the padding between characters will be off.

If you don't provide certain characters, they will just be omitted when generating the sprite data if they are present in the string.

## `get` spriteData
Returns the spriteData of the sprite.

## `set` spriteData(spriteData)
Set new sprite data for the sprite.

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
When using shorthand notation, this function will flip the signs of numbers greater than one and less than 0.

## `static` normalizeSpriteData(spriteData)
Normalizes shorthand sprite data. This function turns shorthand sprite data points into standard points and is called *automatically* when creating a new sprite.