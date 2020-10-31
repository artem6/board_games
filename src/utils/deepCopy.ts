function deepCopy<T>(obj: T): T {
  if (obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export default deepCopy;
