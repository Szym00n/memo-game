import { createElement } from '/js/helpers';
/**
 * Functions related to displaying dialogs
 */

/**
 * Search HTML for dialog with data-dialog attribute corresponding to name parameter.
 * Apply provided in formFields data to the form inside the dialog and show it as a modal.
 * Returns a promise which resolved returns data entered into a form inside the dialog.
 *
 * @param {String} name - name of the dialog and form inside
 * @param {object} formFields - values for fields of the form inside the dialog
 * @returns {Promise} - promise which result is data from the form
 */
export function showHTMLModalDialog(name, formFields = {}) {
  //TODO check for another dialog opened already
  const dialog = document.querySelector(`[data-dialog=${name}]`);

  if (!dialog) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const formElements = document.forms[name]?.elements;
    const fields = Object.assign(Object.create(null), formFields);

    //applying default values to form fields
    for (let f in fields) {
      formElements[f] && (formElements[f].value = fields[f]);
    }

    const onCloseListener = function (e) {
      dialog.removeEventListener('close', onCloseListener);

      if (this.returnValue === 'cancel') {
        resolve(null);
      }
      //retrieving values of form fields
      const res = Object.create(null);
      for (let f in fields) {
        res[f] = formElements[f]?.value;
      }

      resolve(res);
    };

    //Removing listener to prevent memory leaks do to the closure created around it
    dialog.addEventListener('close', onCloseListener);
    dialog.showModal();
  });
}

function encodeDimensionsForDialog({ rows, columns }) {
  //HTML dialog's form stores dimensions as string in format ROWSxCOLUMNS
  return `${Math.min(rows, columns)}x${Math.max(rows, columns)}`;
}

export async function getSettingsWithDialog(
  config = { theme: 'numbers', players: 1, dimensions: '4x4' }
) {
  const data = await showHTMLModalDialog('settings', {
    ...config,
    dimensions: encodeDimensionsForDialog(config.dimensions),
  });
  if (data && data.dimensions) {
    const [rows, columns] = data.dimensions.split('x').map((n) => +n);
    return {
      ...data,
      dimensions: { rows, columns },
    };
  }
}

function renderSingleScore(container, score) {
  container.append(
    createElement('p', {
      className: 'dialog__header',
      textContent: 'Oto Twój wynik',
    }),
    createElement('div', {
      className: 'dialog__result',
      innerHTML: `<p><span>Czas: </span><span>${score.time}</span></p>
       <p><span>Próby: </span><span>${score.tries}</span></p>`,
    })
  );
}

function multiWinnersMessage(scores) {
  const winners = scores.filter((el) => el.isWinner).map((el) => el.player);
  return winners.length === 1
    ? `Wygrał gracz nr ${scores[0].player}`
    : winners.length === scores.length
    ? 'Mamy remis!'
    : `Wygrali gracze ${winners.join(', ').replace(/, (\d)$/, ' i $1')}`;
}

function renderMultiScore(container, scores) {
  container.append(
    createElement('p', {
      className: 'dialog__header',
      textContent: multiWinnersMessage(scores),
    }),
    createElement(
      'ol',
      { className: 'dialog__results' },
      scores.map((score) =>
        createElement('li', {
          className: `dialog__result ${score.isWinner ? 'winner-score' : ''}`,
          innerHTML: `<p><span>Gracz ${score.player}</span><span>${score.matches} na ${score.tries}</span></p>`,
        })
      )
    )
  );
}

export function showGameOverDialog(result) {
  const container = document.getElementById('game-over-results');
  container.textContent = '';

  if (Array.isArray(result)) {
    renderMultiScore(container, result);
  } else {
    renderSingleScore(container, result);
  }

  showHTMLModalDialog('game-over');
}
