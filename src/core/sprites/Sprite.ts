import { SpriteData } from './spriteData.interface'; 

/**
 * Sprite class, represents a graphical asset usable by the game.
 */
export class Sprite {

  /** Options */
  _spriteData: SpriteData;
  _precise: boolean;

  /** Properties */
  _width: number = 0;
  _height: number = 0;

  /**
   * 
   * @param {SpriteData} spriteData Sprite data that defines the appearance of the sprite.
   * @param {boolean} [precise=false] Use precise collision checking.
   */
  constructor(spriteData:SpriteData, precise:boolean = false) {
    this._spriteData = spriteData;
    this._precise = precise;

    /** Calculate the width and height of the sprite */
    this._spriteData.points.forEach(pointRow => {
      this._width = pointRow.length > this._width ? pointRow.length : this._width;
      this._height++;
    });
  }

  /**
   * Returns the inverse of given sprite data.
   * @param {SpriteData} spriteData The sprite data you wish to inverse.
   */
  static inverse(spriteData:SpriteData):SpriteData {
    let inverseSpriteData:SpriteData = spriteData;

    inverseSpriteData.points.forEach(pointRow => {
      pointRow.forEach((point, index, arr) => {
        arr[index] = point === 1 ? 0 : 1;
      });
    });

    return inverseSpriteData;
  }

  /**
   * Returns the width of the sprite.
   * @returns {number} Sprite width.
   */
  get width():number { return this._width; }

  set width(a) { throw new Error('Width is a readonly property.'); }

  /**
   * Returns the height of the sprite.
   * @returns {number} Sprite height.
   */
  get height():number { return this._height; }

  set height(a) { throw new Error('Height is a readonly property.'); }
}