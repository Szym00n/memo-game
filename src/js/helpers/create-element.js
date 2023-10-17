const assign = (to, from) => {
  const keys = Object.keys(from);
  keys.forEach((key) => {
    to[key] = from[key];
  });
};

/**
 * Creates new HTMLElement
 * @param {string} type
 * @param {object} attributes
 * @param {HTMLElement[]} children
 * @returns {HTMLElement}
 */
export function createElement(type, attributes = {}, children) {
  const el = document.createElement(type);
  const attrNames = Object.keys(attributes);
  attrNames.forEach((name) => {
    const value = attributes[name];
    if (el[name] === undefined) {
      el.setAttribute(name, value);
      return;
    }
    el[name] = typeof value === 'object' ? assign(el[name], value) : value;
  });
  if (children) el.append(...children);
  return el;
}
