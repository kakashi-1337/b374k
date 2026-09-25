export default (num, places = 2) => {
  return Math.round((Number(num) + Number.EPSILON) * (10 ** places)) / (10 ** places)
}
