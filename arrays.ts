function groupBy<T>(
  arr: T[],
  criteria: (item: T) => string
): { [key: string]: T[] } {
  return arr.reduce((acc, item) => {
    const key = criteria(item)

    return {
      ...acc,
      [key]: acc.hasOwnProperty(key) ? acc[key].concat([item]) : [item]
    }
  }, {})
}

function sort<T>(arr: T[], func: (a: T, b: T) => number): T[] {
  return arr.concat().sort(func)
}

export { groupBy, sort }
