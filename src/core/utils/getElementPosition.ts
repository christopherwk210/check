/**
 * Returns the true position of an element.
 * @param {Element} e Element to get the position of. 
 */
export function getElementPosition(e:any):any {
  let curLeft = 0,
      curTop = 0;

  do {
    curLeft += e.offsetLeft;
    curTop += e.offsetTop;
  } while (e = e.offsetParent);

  return {
    left: curLeft,
    top: curTop
  };
}