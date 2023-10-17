import Timer from '../utils/timer.js';

const singlePlayerController = {
  name: 'SinglePlayer',
  timer: null,
  tries: 0,
  players: 1,
  renderFn: null,
  result() {
    return { time: this.timer.toString('M:s', 2), tries: this.tries };
  },
  onStart() {
    this.timer.start();
    this.tries = 0;
    this.render();
  },
  onTry() {
    this.tries++;
    this.render();
  },
  onMatch() {
    this.onTry();
  },
  onEnd() {
    this.timer.stop();
    return { ...this.result() };
  },
  onReset() {
    this.timer.reset();
    this.tries = 0;
    this.render();
  },
  render() {
    if (!this.renderFn) return;
    this.renderFn(this.result());
  },
  init(renderFn) {
    this.timer = new Timer();
    this.renderFn = renderFn;
    this.timer.onChange(() => {
      this.render();
    });
    return this;
  },
  getTemplateContainer() {
    return this.renderFn?.element;
  },
  activate() {
    this.onReset();
  },
};

export function createSinglePlayerController(renderFn) {
  return Object.create(singlePlayerController).init(renderFn);
}
