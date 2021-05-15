export function getDeep(obj: { [key: string]: any }, key: string, defaultValue?: any) {
  if (!key) return obj;
  if (!obj) return defaultValue;
  const value = key
    .split('.')
    .filter(Boolean)
    .reduce((o, k) => (o || {})[k], obj);
  return value === undefined ? defaultValue : value;
}

export function setDeep(obj: { [key: string]: any }, key: string, value: any) {
  const keys = key.split('.').filter(Boolean);
  if (keys.length === 1) {
    obj[keys[0]] = value;
  } else if (keys.length > 1) {
    let firstKey = keys.shift() as string;
    let newKey = keys.join('.');
    setDeep(obj[firstKey], newKey, value);
  }
}

export function getDeepArray(obj: { [key: string]: any }, key: string) {
  const items: any[] = [];
  if (!obj) return items;
  const keyArr = key.split('.');
  let value = obj;
  while (keyArr.length) {
    const k = keyArr.shift();
    if (!k) continue;
    value = value[k];
    if (value === null) value = undefined as any;
    if (value === undefined) break;
    if (Array.isArray(value)) {
      value.forEach(item => {
        items.push(...getDeepArray(item, keyArr.join('.')));
      });
    }
  }
  if (Array.isArray(value)) items.push(...value);
  else if (value !== undefined) items.push(value);
  return items;
}
