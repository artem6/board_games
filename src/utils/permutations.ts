// import { factorial } from "./factorial";
import { sort } from "./sort";

export const generateSortPermutations = (data: {[val:number]:string[]}):string[][] => {
  let perms:string[][] = [[]];

  const keys = sort(Object.keys(data).map(v => parseFloat(v)), '', 'asc');

  keys.forEach(key => {
    const vals = data[key];

    const addPermutation = (vals:string[], perms: string[][]) => {
      const iterateOnPerms = [...perms];
      perms = [];
      vals.forEach((val, idx) => {
        let newPerms = iterateOnPerms.map(arr => [...arr, val]);

        const remainingVals = [...vals];
        remainingVals.splice(idx, 1);

        if (remainingVals.length) newPerms = addPermutation(remainingVals, newPerms)

        perms.push(...newPerms);

      })
      return perms;
    }

    perms = addPermutation(vals, perms);
  })

  return perms;
}

// console.log(generateSortPermutations({
//   1: ['a','b'],
//   2: ['c','d','e','f'],
//   3: ['g'],
// }).map(arr =>  arr.join('')))

// console.log(factorial(2) * factorial(4) * factorial(1))