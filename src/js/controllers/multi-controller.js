const multiPlayerController = {
  name: 'MultiPlayer',
  players: 2,
  playersData: [],
  activePlayer: 0,
  renderFn: null,
  result() {
    return this.playersData.map((data, index) => ({
      ...data,
      active: this.activePlayer === index,
    }));
  },
  onMatch() {
    this.onTry(false);
  },
  onTry(isFail = true) {
    const currentResult = this.playersData[this.activePlayer];
    currentResult.tries++;
    if (isFail) {
      this.activePlayer =
        this.players === this.activePlayer + 1 ? 0 : this.activePlayer + 1;
    } else {
      currentResult.matches++;
    }
    this.render();
  },
  onStart() {},
  onEnd() {
    let bestScore;
    return this.playersData
      .map((score, index) => ({
        matches: score.matches,
        tries: score.tries,
        player: index + 1,
        strScore: `${score.matches} / ${score.tries}`,
      }))
      .sort((a, b) => {
        //more matches - better score
        if (a.matches < b.matches) return 1;
        if (a.matches > b.matches) return -1;
        //less tries - better score
        if (a.tries > b.tries) return 1;
        if (a.tries < b.tries) return -1;

        return 0;
      })
      .map((score, _, arr) => {
        score.isWinner = score.strScore === arr[0].strScore;
        return score;
      });
  },
  setRenderer(renderFn) {
    this.renderFn = renderFn;
    return this;
  },
  onReset(config) {
    this.players = +(config?.players ?? this.players);
    this.activePlayer = 0;
    this.playersData = [];

    while (this.playersData.length < this.players)
      this.playersData.push({
        matches: 0,
        tries: 0,
        active: !this.playersData.length,
      });

    this.render();
  },
  activate(config) {
    this.onReset(config);
  },
  render() {
    if (!this.renderFn) return;
    this.renderFn(this.result());
  },
};

export function createMultiPlayerController(renderFn) {
  return Object.assign({}, multiPlayerController).setRenderer(renderFn);
}
