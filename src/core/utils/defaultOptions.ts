/**
 * Represents the default options every game has.
 */
export const defaultOptions = {
  width: 15, // Width of the game board
  height: 15, // Height of the game board
  collapse: false, // Collapse the space between checkboxes
  hideCursor: false, // Hide the cursor over the gameboard
  useRadio: false, // Use radio inputs instead of checkboxes
  update: function(){} // Callback function that triggers at the start of every game loop
}