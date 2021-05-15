import { getDeep } from './getDeep';

export function sort<T>(data: T[], key: string, direction = 'desc') {
  const stableData = data.map((val, idx) => ({ val, idx }));
  // TODO there is a slight bug in the sort function which causes the data to not be 'stable' when reversing the same sort twice
  stableData.sort((a, b) => {
    const aKey: number | string = getDeep(a.val, key, null);
    const bKey: number | string = getDeep(b.val, key, null);
    const dirMult = direction === 'desc' ? -1 : 1;
    if (aKey === bKey) return (a.idx - b.idx) * dirMult;
    if (aKey === null || aKey === undefined) return 1;
    if (bKey === null || bKey === undefined) return -1;
    if (aKey > bKey) return dirMult;
    return -1 * dirMult;
  });

  stableData.forEach((item, idx) => {
    data[idx] = item.val;
  });
  return data;
}
