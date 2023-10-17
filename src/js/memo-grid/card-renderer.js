import { createElement } from '../helpers/create-element';
import arrayShuffle from '../helpers/array-shuffle';

const INIT_OPTIONS = {
  theme: 'default',
  cardClass: 'memo-card',
  cardFrontClass: 'memo-card__front',
  cardBackClass: 'memo-card__back',
  renderFrontFn: (element, symbol) => {
    element.textContent = symbol;
  },
  renderBackFn: (element) => {
    element.textContent = '?';
  },
};

export function createRenderer(options = INIT_OPTIONS) {
  const config = { ...INIT_OPTIONS, ...options };
  const symbols = Array.isArray(config.symbols) ? config.symbols : [];

  function createSideEl(dataIndex) {
    const isFrontCard = dataIndex != null;
    const element = createElement('div', {
      className: isFrontCard ? config.cardFrontClass : config.cardBackClass,
    });

    isFrontCard
      ? config.renderFrontFn(
          element,
          symbols[dataIndex] ?? dataIndex + 1,
          dataIndex
        )
      : config.renderBackFn(element);
    return element;
  }

  return {
    reset() {
      if (symbols && symbols.length) arrayShuffle(symbols, false);
    },
    createCard(dataIndex) {
      return createElement(
        'div',
        {
          className: `${config.cardClass} ${config.cardClass}--${config.theme}`,
        },
        [createSideEl(dataIndex), createSideEl()]
      );
    },
  };
}

const CARD_COLORS = [
  'FloralWhite',
  'Silver',
  'Gray',
  'Black',
  'LightPink',
  'DarkRed',
  'MediumVioletRed',
  'BlueViolet',
  'DodgerBlue',
  'DarkSteelBlue',
  'darkblue',
  'LightGreen',
  'LimeGreen',
  'DarkGreen',
  'Moccasin',
  'Yellow',
  'Tan',
  'Crimson',
  'Cyan',
  'DarkMagenta',
];

const renderers = {};

export function getMemoCardRenderer(type, theme = 'default') {
  const name = `${type}-${theme}`;
  if (renderers[type]) return renderers[type];

  let renderer = null;
  switch (type) {
    case 'numbers':
      renderer = createRenderer({ theme: theme });
      break;
    case 'colors':
      renderer = createRenderer({
        theme,
        symbols: CARD_COLORS,
        renderFrontFn: (element, color) => {
          element.style.backgroundColor = color;
          element.classList.add('memo-card__color');
        },
      });
      break;
  }

  if (renderer) renderers[type] = renderer;

  return renderer;
}
