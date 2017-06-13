/**
 * This class is responsible for setting up and maintaining
 * the game and all assets.
 */
class Check {
  /**
   * Initializes the game and appends game board to the DOM.
   * @param {element} element Existing element to append the game board to.
   * @param {number} width How many checkboxes wide the game board should be.
   * @param {number} height How many checkboxes high the game board should be.
   */
  constructor(element, width, height) {
    this.element = element;
    this.width = width;
    this.height = height;
  }

  /**
   * Define a custom update function that triggers every game tick.
   * @param {function} callback Function to be called every game tick.
   */
  set update(callback) {
    this.update = callback;
  }
}