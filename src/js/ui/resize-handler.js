function getPageOverflow() {
  const doc = document.documentElement;
  const body = document.body;
  return {
    x:
      Math.max(
        body.scrollWidth,
        doc.scrollWidth,
        body.offsetWidth,
        doc.offsetWidth,
        body.clientWidth,
        doc.clientWidth
      ) - doc.clientWidth,
    y:
      Math.max(
        body.scrollHeight,
        doc.scrollHeight,
        body.offsetHeight,
        doc.offsetHeight,
        body.clientHeight,
        doc.clientHeight
      ) - doc.clientHeight,
  };
}

function getElementContentDimensions(element) {
  let { height, width } = element.getBoundingClientRect();
  return {
    width: Math.max(width, element.scrollWidth),
    height: Math.max(height, element.scrollHeight),
  };
}

function calculateGridGapSize(width, height, columns, rows) {
  const minimalGap = 0;
  const defaultGap = 15;
  const defaultCardSize = 60;
  return Math.max(
    minimalGap,
    Math.min(
      defaultGap,
      width / columns - defaultCardSize,
      height / rows - defaultCardSize
    )
  );
}

function maxPossibleCardSize(dimension, whitespace, cellsCount) {
  return Math.floor((dimension - whitespace) / cellsCount);
}

/**
 * Calculates maximal card size
 * @param {HTMLElement} container
 * @param {object} gridDimensions {columns:number, cows:number}
 * @returns {number}
 */
function calcGridSettings(container, { columns, rows }) {
  const gridDim = getElementContentDimensions(container);
  const overflow = getPageOverflow();

  const width = gridDim.width - overflow.x;
  const height = gridDim.height - overflow.y;

  const gap = calculateGridGapSize(width, height, columns, rows);

  const whitespaceX = gap * (columns + 1);
  const whitespaceY = gap * (rows + 1);

  const maxCardWidth = maxPossibleCardSize(width, whitespaceX, columns);
  const maxCardHeight = maxPossibleCardSize(height, whitespaceY, rows);

  const maxDimension = Math.min(maxCardWidth, maxCardHeight);

  //TODO: get rid off this magic values
  const cardSize = Math.max(
    40, //this.#minCardSizePx,
    Math.min(maxDimension, 125 /*this.#maxCardSizePx*/)
  );
  return { cardSize, gap };
}

export default function adjustGridToWindow(container, game) {
  const gs = calcGridSettings(container, game.getSettings().dimensions);

  container.style.setProperty('--grid-item-size', gs.cardSize + 'px');
  container.style.setProperty('--grid-gap', gs.gap + 'px');
}
