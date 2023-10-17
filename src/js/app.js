import '../scss/main.scss';
import {
  createGameController,
  createSinglePlayerController,
  createMultiPlayerController,
} from './controllers';
import {
  getSettingsWithDialog,
  showGameOverDialog,
  singleResultsRenderer,
  multiResultsRenderer,
  bindRenderContainer,
  adjustGridToWindow,
} from './ui';
import { MemoGrid, getMemoCardRenderer } from './memo-grid';

const MemoGame = createGameController(
  new MemoGrid(
    document.getElementById('memo-grid'),
    getMemoCardRenderer('numbers')
  )
);

MemoGame.registerController(
  'single',
  createSinglePlayerController(
    bindRenderContainer(
      singleResultsRenderer,
      document.getElementById('results')
    )
  )
)
  .registerController(
    'multi',
    createMultiPlayerController(
      bindRenderContainer(
        multiResultsRenderer,
        document.getElementById('results')
      )
    )
  )
  .registerCommand('play', (game) => {
    game.newGame();
  })
  .registerCommand('settings', async (game) => {
    const data = await getSettingsWithDialog(game.getSettings());
    if (data) {
      game.updateSettings(
        {
          ...data,
          controller: data.players > 1 ? 'multi' : 'single',
        },
        true
      );
      adjustGridToWindow(document.getElementById('memo-grid'), game);
      game.newGame();
    }
  });

MemoGame.registerCommand('game-over', async (_, result) => {
  setTimeout(() => showGameOverDialog(result), 1000);
});

document.body.addEventListener('click', ({ target }) => {
  if (target.dataset?.action) {
    MemoGame.exec(target.dataset?.action);
  }
});

window.addEventListener(
  'resize',
  adjustGridToWindow.bind(null, document.getElementById('memo-grid'), MemoGame)
);

MemoGame.exec('settings');
