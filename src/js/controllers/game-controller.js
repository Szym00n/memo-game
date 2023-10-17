import { getMemoCardRenderer } from '../memo-grid/card-renderer';

const DEFAULT_CONFIG = {
  dimensions: { rows: 4, columns: 5 },
  theme: 'numbers',
  players: 1,
};

export function createGameController(
  memoGrid,
  gameSettings = DEFAULT_CONFIG,
  initFn
) {
  const controllers = new Map();
  const commands = new Map();
  const memo = memoGrid;

  let settings = { ...DEFAULT_CONFIG, ...gameSettings };
  let activeController = null;
  let gridDimensions = settings.dimensions;
  let theme = settings.theme;

  const game = {
    newGame() {
      memo.reset(this.getSettings());
    },

    //TODO: Consider removing activate parameter
    registerController(name, controller, activate = false) {
      if (controllers.has(name)) return false;

      controllers.set(name, controller);
      if (activate) this.setActiveController(name, this.getSettings());

      return this;
    },
    registerCommand(command, callback) {
      commands.set(command, callback);
      return this;
    },
    setActiveController(name, conf) {
      if (!controllers.has(name))
        throw new Error(`Controller ${name}  is not registered`);
      activeController = controllers.get(name);
      activeController.activate(conf);
    },
    getSettings() {
      return {
        players: activeController?.players ?? 1,
        dimensions: gridDimensions,
        theme,
      };
    },
    updateSettings(conf, restart = false) {
      if (conf.theme && theme != conf.theme) {
        const cr = getMemoCardRenderer(conf.theme);
        theme = conf.theme;
        memo.setCardRenderer(cr);
      }
      if (conf.dimensions) {
        gridDimensions.rows = conf.dimensions.rows ?? gridDimensions.rows;
        gridDimensions.columns =
          conf.dimensions.columns ?? gridDimensions.columns;

        if (window.innerHeight > window.innerWidth) {
          const { rows, columns } = gridDimensions;
          gridDimensions.rows = Math.max(rows, columns);
          gridDimensions.columns = Math.min(rows, columns);
        }

        memo.setDimensions(
          gridDimensions.rows,
          gridDimensions.columns,
          restart
        );
      }
      if (conf.controller) {
        this.setActiveController(conf.controller, conf);
      }
    },
    exec(command, ...args) {
      if (!commands.has(command)) return;
      return commands.get(command)(game, ...args);
    },
    result() {
      return gameResult;
    },
  };

  memo
    .on('start', () => {
      activeController?.onStart();
    })
    .on('end', () => {
      game.exec('game-over', activeController?.onEnd());
    })
    .on('reset', () => {
      activeController?.onReset();
    })
    .on('try', ({ isMatch }) => {
      isMatch ? activeController?.onMatch() : activeController?.onTry();
    });

  if (typeof initFn === 'function') initFn(game);

  return game;
}
