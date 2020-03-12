function asString(val: string | string[] | null): string | null {
  return val ? (Array.isArray(val) ? val.join(',') : val) : null
}

function serializeQs(params: Object): string {
  return Object.keys(params)
    .filter(key => params[key])
    .map(key => key + '=' + params[key])
    .join('&')
}

export { serializeQs, asString }
