import { createElement } from '/js/helpers';

/**
 * Renders results of single mode game
 * @param {HTMLElement} container
 * @param {object} data
 */
export function singleResultsRenderer(container, data) {
  container.textContent = '';
  container.append(
    createElement('div', {
      className: 'single-player-results',
      innerHTML: `<p>Czas: <span data-bind="time">${
        data?.time ?? '0:00'
      }</span></p>
    <p>Liczba prób: <span data-bind="tries">${data?.tries ?? 0}</span></p>`,
    })
  );
}

/**
 * Renders a results block for a single player i multiplayer mode
 * @param {number} player number of player
 * @param {object} data player's score
 * @returns
 */
function renderMultiBlock(player, data) {
  const el = createElement('div', {
    className: 'player-score',
    innerHTML: `<p><span>Gracz ${player}</span> <span data-bind="matches">${
      data?.matches ?? 0
    } / ${data?.tries ?? 0}</span></p>`,
  });
  if (data.active) setTimeout(() => el.classList.add('active'), 500);
  return el;
}

/**
 * Renders results of multiplayer mode game
 * @param {HTMLElement} container
 * @param {object[]} data
 */
export function multiResultsRenderer(container, data) {
  container.textContent = '';
  container.append(
    createElement(
      'div',
      { className: 'multi-player-results' },
      data.map((score, index) => renderMultiBlock(index + 1, score))
    )
  );
}

/**
 * Binds HTML element as a container for rendering function.
 * @param {Function} renderFn
 * @param {HTMLElement} container
 * @returns {Function} rendering function
 */
export function bindRenderContainer(renderFn, container) {
  if (!(container instanceof HTMLElement))
    throw new Error('Container is not valid HTMLElement!');
  return renderFn.bind(null, container);
}
