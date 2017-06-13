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

    this.gameBoard = this.createGameBoard(this.width, this.height);
    this.gameBoardContainer = this.bootstrapGameBoard(this.element, this.gameBoard);
  }

  /**
   * Returns a grid of checkboxes.
   * @param {Number} width How many checkboxes wide the game board should be.
   * @param {Number} height How many checkboxes high the game board should be.
   * @returns {Array} The game board array of checkbox elements.
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
   * Appends a board to an element on the DOM.
   * @param {Element} element DOM element to append game board to.
   * @param {Array} gameBoard Valid game board grid.
   * @returns {Element} The containing game board div.
   */
  bootstrapGameBoard(element, gameBoard) {
    let gameBoardElement = document.createElement('div');
    gameBoard.forEach(row => {
      let gameBoardRowElement = document.createElement('div');

      row.forEach(checkbox => {
        gameBoardRowElement.appendChild(checkbox);
      });
      
      gameBoardElement.appendChild(gameBoardRowElement);
    });
  }

  /**
   * Define a custom update function that triggers every game tick.
   * @param {Function} callback Function to be called every game tick.
   */
  set update(callback) {
    this.update = callback;
  }
}