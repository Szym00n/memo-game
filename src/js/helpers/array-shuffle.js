export default function arrayShuffle(arr, returnNew = true) {
  let index = arr.length;
  const result = returnNew ? [...arr] : arr;
  while (index--) {
    const tmp = result[index];
    const randIndex = Math.floor(Math.random() * index);
    result[index] = result[randIndex];
    result[randIndex] = tmp;
  }
  return result;
}
