import queryString from 'query-string';

function stringify(val: any) {
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return JSON.stringify(val);
  return `${val}`;
}

function parseVal(val: string): any {
  let parsed = parseInt(val, 10);
  if (stringify(parsed) === val) return parsed;
  parsed = parseFloat(val);
  if (stringify(parsed) === val) return parsed;
  if (val === 'undefined') return undefined;
  if (val === 'null') return null;
  try {
    parsed = JSON.parse(val);
    if (stringify(parsed) === val) return parsed;
  } catch (e) {
    /* ignore */
  }
  return val;
}

function getQueryParams(): { [key: string]: any } {
  if (typeof window === 'undefined') return {};
  const obj = queryString.parse(window.location.search);
  Object.keys(obj).forEach((key) => {
    const rawVal = obj[key];
    if (typeof rawVal === 'string') obj[key] = parseVal(rawVal);
  });
  return obj;
}

function setQueryParams(obj: { [key: string]: any }) {
  obj = { ...obj };
  Object.keys(obj).forEach((key) => {
    obj[key] = stringify(obj[key]);
  });
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?${queryString.stringify(obj)}`,
  );
}

export { getQueryParams, setQueryParams };
