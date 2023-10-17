import { bindDOMElementAsTemplate } from '../helpers/bind-template';

export function bindMultiPlayerTemplate() {
  const blocks = document.querySelectorAll('.player-score');
  const templates = [];

  blocks.forEach((el) => {
    templates.push(bindDOMElementAsTemplate(el));
  });

  return (data) => {
    const scores = data.scores;
    const activeIndex =
      data.activePlayer >= scores.length ? 0 : data.activePlayer;
    scores.forEach((score, index) => {
      templates[index](score);
      blocks[index].classList.toggle('active', index === activeIndex);
    });
  };
}
