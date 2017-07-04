# Quick Start

## Installation
To get started with Check, first download the latest release from [here](https://github.com/christopherwk210/check/releases) and include it on the page with a script tag as you usually would:

```html
<html>
  <body>
    <script src="Check.js"></script>
  </body>
</html>
```

That's it! You're ready to make your first unorthodox game using checkbox elements ✅!

## Your First Game
In order to use Check, you have to instatiate it like so:

```javascript
var game = new Check.Game(document.getElementById('game'), {
  collapse: true
});
```

This will create a new Check game, and append the "game board" (the grid of checkbox elements in which your game will live) to the element with an id of 'game'. The second parameter is an options object, which we pass `{ collapse: true }` so that the checkbox elements don't have any white space between them.

Inside your game, you can create game objects to handle what the user sees and interacts with. Pretty much all of your game logic will exist inside game objects. Let's create a game object that logs to the console every in-game frame:

```javascript
var myFirstObject = new Check.GameObject(game, {
  update: function() {
    console.log('Hello, world!');
  }
});
```

Your game will almost always run at 60 frames per second, so this will log `'Hello, world!'` to the console 60 times every second. Pretty useless, but it's a start.

Now that we have a game object, let's add it to our game board. This is pretty straightforward:

```javascript
game.addObjectToBoard(myFirstObject);
```

Looks like everything is set up! Last but not least, we have to tell the game to start the main loop. This is another simple one liner: `game.start()`, so let's show it all together now (and in context):

```html
<html>
  <body>
    <script src="Check.js"></script>
    <script>
    // Create a Check game
    var game = new Check.Game(document.getElementById('game'), {
      collapse: true
    });

    // Create a game object
    var myFirstObject = new Check.GameObject(game, {
      update: function() {
        console.log('Hello, world!');
      }
    });

    // Add it to the board
    game.addObjectToBoard(myFirstObject);

    // Start our very first game!
    game.start();
    </script>
  </body>
</html>
```

Load this up in your browser and pop open the console, and you'll see that 'Hello, world!' appears in the console, like, a billion times. Which is means it's working! Congrats on making your first (completely useless) game using Check.

## Adding Visuals
Okay, so we've made our first game. It's horribly boring. Let's make something interesting appear inside our checkbox grid (the game board). We can do this with the use of sprites.

A sprite is a grid of 1's and 0's that represents where checkboxes should be toggled on or off. We assign these to game objects to give them a presence on the game board. Let's make a sprite for the game object we made earlier:

```javascript
var myFirstSprite = new Check.Sprite({
  points: [
    [1, 0, 1],
    [0],
    [1, 0, 1],
    [1, 1, 1]
  ]
});
```

The `points` array of arrays represents each row of our sprite. So in the first row, we have a checked box, an unchecked box, then a checked box. The next row we have nothing checked at all, and so on. Take a look at the bottom row, which has three 1's in a row. That's a little annoying to write, so let's refactor this using [shorthand definition](/api/classes/sprite.md?id=shorthand-definition):

```javascript
var myFirstSprite = new Check.Sprite({
  points: [
    [1, 0, 1],
    [0],
    [1, 0, 1],
    [3]
  ]
});
```

Any number greater than 1 will represent a sequence of that many 1's in a row. So in this case, 3 will expand to `[1, 1, 1]`. Any number less than 1 represents a sequence of that many 0's in a row, which is useful for spacing things out.

Now that we have a sprite, let's assign it to our object:

```javascript
// Create a cool sprite
var myFirstSprite = new Check.Sprite({
  points: [
    [1, 0, 1],
    [0],
    [1, 0, 1],
    [1, 1, 1]
  ]
});

// Create a game object
var myFirstObject = new Check.GameObject(game, {
  sprite: myFirstSprite,
  update: function() {
    console.log('Hello, world!');
  }
});
```

Great! Now when we look back at the browser, we can see a cool looking smiley face in our game board.

## Adding Interaction
Let's finish up our first game by providing a way for the user to interact with our object. Check provides a convenient way to convert the user's mouse coordinates into grid coordinates that represent a point on the game board. Let's use this to make our smiley face follow the user's mouse.

First, let's change the update method of our object:

```javascript
var myFirstObject = new Check.GameObject(game, {
  sprite: myFirstSprite,
  update: function() {
    var mousePos = game.input.mousePosition; // Holds mouse coordinates!
  }
});
```

Now that we have the mouse coordinates, we need to make our object change it's position. We can do that by modifying the `x` and `y` properties of our object:

```javascript
var myFirstObject = new Check.GameObject(game, {
  sprite: myFirstSprite,
  update: function() {
    var mousePos = game.input.mousePosition; // Holds mouse coordinates!
    this.x = mousePos.x;
    this.y = mousePos.y;
  }
});
```

We're all done! Now, our smiley face follows the mouse when we move it over the game board.