import arrayShuffle from '../helpers/array-shuffle';

/**
 * Represents grid of memo cards
 */
export class MemoGrid {
  /** @type {HTMLElement} */
  #container = null;
  #dimensions = { rows: 4, columns: 4 };
  /** @type {MemoCardRenderer} */
  #cardRenderer = null;
  /** @type {HTMLElement[]} */
  #cards = [];
  /** @type {number[]} */
  #values;
  /** @type {HTMLElement} */
  #selectedCard = null;
  /** @type {number} */
  #unmatchedCardPairs = 0;
  #isRestarted = true;
  #events = {
    start: null,
    reset: null,
    end: null,
    try: null, // (isMatch)=>{}
  };

  static minDimension = 2;
  static maxDimension = 8;

  /**
   * @param {HTMLElement | null} Mounting point of the component
   * During mounting all content of the container will be removed!
   */
  constructor(
    container,
    cardRenderer,
    dimensions = {
      rows: MemoGrid.minDimension,
      columns: MemoGrid.minDimension,
    }
  ) {
    this.setCardRenderer(cardRenderer);
    if (dimensions && dimensions.rows && dimensions.columns) {
      this.setDimensions(dimensions.rows, dimensions.columns, false);
    }
    if (container !== null) {
      this.mount(container);
    }
  }
  /** @returns {Number} Number of visible cards */
  get cardsCount() {
    return this.#dimensions.columns * this.#dimensions.rows;
  }

  /**
   * Returns grid dimensions object
   * @returns {object} {columns: Number, rows: Number}
   */
  getDimensions() {
    return { ...this.#dimensions };
  }

  /**
   * Set new dimensions of the grid
   * @param {Number} rows
   * @param {Number} columns
   * @param {Boolean} reset Default true. Force resetting of the grid
   * @returns
   */
  setDimensions(rows, columns, reset = true) {
    function isOutOfRange(n) {
      return n < MemoGrid.minDimension || n > MemoGrid.maxDimension;
    }
    if (
      isOutOfRange(columns) ||
      isOutOfRange(rows) ||
      (columns * rows) % 2 !== 0
    ) {
      throw new Error('Wrong combination of rows and columns!');
    }

    if (this.#dimensions.rows === rows && this.#dimensions.columns === columns)
      return this;

    this.#dimensions = { rows, columns };

    if (this.#container === null) return this;

    this.#container.style.setProperty('--grid-columns', columns);
    this.#container.style.setProperty('--grid-rows', rows);

    if (reset) this.reset();
    return this;
  }

  /**
   * Mounts into the provided HTMLElement
   * @param {HTMLElement} container
   * @returns {MemoGrid}
   */
  mount(container) {
    if (this.#container) {
      throw new Error('MemoGridControl can not be mounted twice!');
    }
    this.#container = container;
    this.reset();

    container.addEventListener('click', (event) => {
      // Important!
      // All child elements of cards must have style set to pointer-events: none
      // otherwise target will bee pointing to one of them instead to a card
      if (event.target.matches('.memo-card:not(.open)')) {
        event.stopPropagation();
        this.#onCardClick(event.target);
      }
    });

    //window.addEventListener('resize', () => this.#adjustToWindow());

    return this;
  }

  /** Resets game state to start position */
  reset() {
    this.#unmatchedCardPairs = this.cardsCount / 2;
    this.#resetCardsValues();
    this.#renderCards();
    this.#isRestarted = true;
    this.#emit('reset');
  }

  /**
   * Registers callback for the game events.
   * Only one callback for each event is allowed.
   * @param {string} event Event name
   * @param {function} callback Callback function
   * @returns {MemoGrid}
   */
  on(event, callback) {
    if (event in this.#events) {
      this.#events[event] = callback;
    }
    return this;
  }

  /**
   * Emits given event
   * @param {string} event Event name
   * @param data
   */
  #emit(event, data) {
    if (this.#events[event]) {
      this.#events[event](data);
    }
  }

  /** @param {HTMLElement} card*/
  #onCardClick(card) {
    this.#rotateCard(card);

    if (this.#isRestarted) {
      this.#isRestarted = false;
      this.#emit('start');
    }

    if (this.#selectedCard === null) {
      this.#selectedCard = card;
      return;
    }
    const selectedCard = this.#selectedCard;

    //on match founded
    if (this.#checkCardsForMatch(selectedCard, card)) {
      selectedCard.classList.add('matched');
      card.classList.add('matched');
      this.#selectedCard = null;
      this.#unmatchedCardPairs -= 1;
      this.#emit('try', { isMatch: true });

      if (this.#unmatchedCardPairs === 0) this.#emit('end');

      return;
    }

    setTimeout(() => {
      this.#rotateCardBack(card);
      this.#rotateCardBack(selectedCard);
    }, 800);

    this.#emit('try', { isMatch: false });
    this.#selectedCard = null;
  }

  /**
   * Checks if cards match
   * @param {HTMLElement} card1
   * @param {HTMLElement} card2 Card object
   * @returns {Boolean}
   */
  #checkCardsForMatch(card1, card2) {
    return (
      this.#values[card1.dataset.index] === this.#values[card2.dataset.index]
    );
  }

  /**
   * Ads open class to the card element
   * @param {HTMLElement} card
   */
  #rotateCard(card) {
    card.classList.add('open');
  }

  /**
   * Removes open class from the card element
   * @param {HTMLElement} card
   */
  #rotateCardBack(card) {
    card.classList.remove('open');
  }

  #renderCards() {
    this.#cards.length = 0;
    this.#container.textContent = '';

    this.#cardRenderer.reset();
    let cardsCount = this.cardsCount;

    while (cardsCount--) {
      const index = this.#cards.length;
      const card = this.#cardRenderer.createCard(this.#values[index]);
      card.dataset.index = index;
      this.#cards.push(card);
    }

    this.#container.append(...this.#cards);
  }

  #resetCardsValues() {
    this.#values = arrayShuffle(
      Array.from({ length: this.cardsCount }).map((_, index) =>
        Math.floor(index / 2)
      )
    );
  }

  /**
   * Sets MemoCardRenderer object used to render card content
   * @param {MemoCardRenderer} cardRenderer
   */
  setCardRenderer(cardRenderer) {
    if (!cardRenderer.reset || !cardRenderer.createCard) {
      throw new Error("Card renderer doesn't implement required interface");
    }
    this.#cardRenderer = cardRenderer;
  }
}
