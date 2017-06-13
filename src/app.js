/**
 * This class is responsible for setting up and maintaining
 * the game and all assets.
 */
class Check {
  /**
   * Initializes the game and appends game board to the DOM.
   * @param {Element} element Existing element to append the game board to.
   * @param {Number} width How many checkboxes wide the game board should be.
   * @param {Number} height How many checkboxes high the game board should be.
   */
  constructor(element, width, height) {
    this.element = element;
    this.width = width;
    this.height = height;
  }

  /**
   * Returns a grid of checkboxes.
   * @param {Number} width How many checkboxes wide the game board should be.
   * @param {Number} height How many checkboxes high the game board should be.
   * @returns {Array}
   */
  createGameBoard(width, height) {
    let gameBoard = [];
    let currentRow = [];

    for (let x = 0; x < height; x++) {
      currentRow = [];

      for (let y = 0; y < width; y++) {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${x}${y}`;
        currentRow.push(checkbox);
      }

      gameBoard.push(currentRow);
    }

    return gameBoard;
  }

  /**
   * Define a custom update function that triggers every game tick.
   * @param {Function} callback Function to be called every game tick.
   */
  set update(callback) {
    this.update = callback;
  }
}