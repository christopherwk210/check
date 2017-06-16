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
    this._spriteData = Sprite.normalizeSpriteData(spriteData);
    this._precise = precise;

    /** Assign default origin */
    if (!this._spriteData.origin) { this._spriteData.origin = { x:0, y:0 }; }    

    /** Calculate the width and height of the sprite */
    this._spriteData.points.forEach(pointRow => {
      this._width = pointRow.length > this._width ? pointRow.length : this._width;
      this._height++;
    });
  }

  /**
   * 
   * @param {SpriteData} spriteData Sprite data to normalize
   */
  static normalizeSpriteData(spriteData:SpriteData):SpriteData {
    let fixedPoints:Array<Array<number>> = [];

    spriteData.points.forEach(pointRow => {
      let newRow:Array<number> = [];
      pointRow.forEach((point, index, arr) => {
        if (point < 0) {
          for (let i = 0; i < (point * -1); i++) {
            newRow.push(0);
          }
        } else if (point > 1) {
          for (let i = 0; i < point; i++) {
            newRow.push(1);
          }
        } else {
          newRow.push(point);
        }
      });
      fixedPoints.push(newRow);
    });

    let normalizedSprite:SpriteData = {
      points: fixedPoints,
      origin: spriteData.origin
    };

    return normalizedSprite;
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
   * Returns the spriteData of the sprite.
   * @returns {SpriteData} spriteData.
   */
  get spriteData():SpriteData { return this._spriteData; }

  set spriteData(a) { throw new Error('SpriteData is a readonly property.'); }

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