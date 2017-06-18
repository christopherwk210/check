import { Graphics } from '../graphics';

/**
 * Represents the default options for every game object.
 */
export const defaultGameObjectOptions:any = {
  x: 0, // The starting X position of the game object on the board.
  y: 0, // The starting Y position of the game object on the board.
  sprite: undefined, // The sprite that belongs to the game object.
  init: function(){}, // Function to call when the game object is first added to the game board and is passed an instance id.
  update: function(){}, // Function to call every game frame and is passed an instance id.
  
  // Function that is called at the end of every game frame, and
  // is passed instance id and a reference to the graphics class.
  draw: function(id:number, graphics: Graphics) {
    if (this._sprite) {
      graphics.drawSprite(this._sprite, this._x, this._y);
    }
  },
  destroy: function(){} // Function to call when the game object is removed from the board.
}